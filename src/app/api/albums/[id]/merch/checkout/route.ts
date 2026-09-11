import { NextResponse } from "next/server";
import { merchProduct, quoteMerch, type MerchSku } from "@/lib/commerce";
import { siteOrigin } from "@/lib/site";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { stripeItem, stripeShipping, STRIPE_SHIP_COUNTRIES } from "@/lib/stripeCatalog";
import { loadAlbum, saveAlbum } from "@/lib/store";
import { tokensMatch, newId } from "@/lib/token";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const token = String(body.token || "");
  const album = await loadAlbum(id);
  if (!album || !tokensMatch(token, album.tokenHash)) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  if (album.status !== "ready") {
    return NextResponse.json({ error: "Wait until the album is developed." }, { status: 409 });
  }

  const sku = String(body.sku || "") as MerchSku;
  const product = merchProduct(sku);
  const photoId = String(body.photoId || "");
  const artUrl = String(body.artUrl || "");
  const photo = album.pages.flatMap((page) => page.photos).find((item) => item.id === photoId);
  if (!product || !photo?.imageUrl || !artUrl) {
    return NextResponse.json({ error: "Pick a photograph and a product." }, { status: 400 });
  }

  const country = String(body.country || "US").toUpperCase();
  const quote = quoteMerch(sku, country);
  const draftId = newId("mch");
  album.merchDrafts = {
    ...(album.merchDrafts || {}),
    [draftId]: {
      id: draftId,
      sku,
      photoId,
      color: String(body.color || product.colors[0].id),
      size: String(body.size || product.sizes[0]),
      crop: {
        x: Number(body.cropX ?? 50),
        y: Number(body.cropY ?? 50),
        zoom: Number(body.cropZoom ?? 1),
      },
      artUrl,
      country,
    },
  };
  await saveAlbum(album);

  const origin = siteOrigin();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [stripeItem(sku, `${product.name} · ${photo.title}`, quote.priceUsd)],
    success_url: `${origin}/album/${album.id}?token=${token}&merch=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/album/${album.id}?token=${token}&merch=cancel`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    shipping_address_collection: {
      allowed_countries: STRIPE_SHIP_COUNTRIES as unknown as string[],
    },
    shipping_options: [
      stripeShipping(country === "US" ? "US shipping" : "International shipping", quote.shippingUsd),
    ],
    metadata: {
      product: "whenever",
      sku: "merch",
      album_id: album.id,
      merch_draft_id: draftId,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout did not return a URL." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
