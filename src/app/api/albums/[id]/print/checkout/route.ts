import { NextResponse } from "next/server";
import { loadAccessibleAlbum } from "@/lib/access";
import { quoteLaterBook, type PrintFinish } from "@/lib/commerce";
import { siteOrigin } from "@/lib/site";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { stripeItem, stripeShipping, STRIPE_SHIP_COUNTRIES } from "@/lib/stripeCatalog";

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
  const found = await loadAccessibleAlbum(id, String(body.token || ""));
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  const { album } = found;
  if (album.status !== "ready") {
    return NextResponse.json({ error: "Wait until the album is developed." }, { status: 409 });
  }
  if (album.printOrder && album.printOrder.status !== "failed" && album.printOrder.status !== "refunded") {
    return NextResponse.json({ error: "A printed book is already on the way." }, { status: 409 });
  }

  const print = String(body.print || "") as PrintFinish;
  if (print !== "hardcover" && print !== "softcover") {
    return NextResponse.json({ error: "Pick hardcover or softcover." }, { status: 400 });
  }

  const country = String(body.country || "US").toUpperCase();
  const quote = quoteLaterBook(print, country);
  const origin = siteOrigin();
  const token = String(body.token || "");
  const returnToken = token ? `&token=${token}` : "";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      stripeItem(
        print === "hardcover" ? "hardcover" : "softcover",
        `${print === "hardcover" ? "Hardcover" : "Softcover"} photo book`,
        quote.printUsd
      ),
    ],
    success_url: `${origin}/api/auth/claim?album=${album.id}${returnToken}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/album/${album.id}${token ? `?token=${token}` : ""}`,
    customer_email: album.email || undefined,
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
      sku: "print",
      album_id: album.id,
      print,
      later: "1",
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout did not return a URL." }, { status: 500 });
  }
  return NextResponse.json({ url: session.url, quote });
}
