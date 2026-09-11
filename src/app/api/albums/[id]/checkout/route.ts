import { NextResponse } from "next/server";
import { consumeCredit, loadCredit } from "@/lib/credits";
import { quoteCart, type PrintFinish } from "@/lib/commerce";
import { emailLooksOk, normalizeEmail } from "@/lib/auth";
import { promoMakesDigitalFree } from "@/lib/promos";
import { applyAlbumPayment } from "@/lib/fulfill";
import { siteOrigin } from "@/lib/site";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { stripeItem, stripeShipping, STRIPE_SHIP_COUNTRIES } from "@/lib/stripeCatalog";
import { loadAccessibleAlbum } from "@/lib/access";
import { loadAlbum, saveAlbum } from "@/lib/store";
import { recordPurchase } from "@/lib/users";
import { parseDraft } from "@/lib/validate";
import type { Album } from "@/lib/types";

export const runtime = "nodejs";

function printFrom(body: Record<string, unknown>): PrintFinish | null {
  const value = String(body.print || "");
  if (value === "hardcover" || value === "softcover") return value;
  return null;
}

async function lockDraft(album: Album, body: Record<string, unknown>) {
  const draft = parseDraft(body);
  album.members = draft.members;
  album.start = draft.start;
  album.end = draft.end;
  album.events = draft.events;
  album.tags = draft.tags;
  album.updatedAt = new Date().toISOString();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const token = String(body.token || "");
  const found = await loadAccessibleAlbum(id, token);
  if (!found) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  const album = found.album;
  if (album.status !== "draft") {
    return NextResponse.json({ error: "This album is already paid for." }, { status: 409 });
  }

  try {
    await lockDraft(album, body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Finish the album first.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const creditToken = String(body.creditToken || "");
  const extraAlbum = body.extraAlbum === true || body.extraAlbum === "1";
  const print = printFrom(body);
  const country = String(body.country || "US").toUpperCase();
  const freeDigital = promoMakesDigitalFree(String(body.promoCode || ""));
  const email = normalizeEmail(String(body.email || album.email || ""));
  if (email && emailLooksOk(email)) album.email = email;
  const quote = quoteCart({
    extraAlbum,
    print,
    country,
    digitalPaid: !!creditToken,
    freeDigital,
  });
  let usedCredit = false;

  if (creditToken) {
    const credit = await loadCredit(creditToken);
    if (!credit || credit.remaining < 1) {
      return NextResponse.json({ error: "That second-album credit is gone." }, { status: 400 });
    }
    usedCredit = true;
    album.email = credit.email || album.email;
    if (!print) {
      await consumeCredit(creditToken);
      album.status = "paid";
      album.paidWithCredit = true;
      album.updatedAt = new Date().toISOString();
      await saveAlbum(album);
      await recordPurchase(album, {
        kind: "digital",
        label: "Digital album (credit)",
        amountUsd: 0,
        creditsGranted: 0,
        stripeSessionId: `credit:${album.id}`,
      });
      return NextResponse.json({
        url: `${siteOrigin()}/api/auth/claim?album=${album.id}&token=${token}&next=${encodeURIComponent(`/album/${album.id}?token=${token}&checkout=success`)}`,
      });
    }
    album.pendingCreditToken = creditToken;
  }

  if (freeDigital && !print && !quote.extraAlbumUsd && !usedCredit) {
    album.status = "paid";
    album.updatedAt = new Date().toISOString();
    await saveAlbum(album);
    await recordPurchase(album, {
      kind: "digital",
      label: "Digital album (promo)",
      amountUsd: 0,
      creditsGranted: 0,
      stripeSessionId: `promo:${album.id}`,
    });
    return NextResponse.json({
      url: `${siteOrigin()}/api/auth/claim?album=${album.id}&token=${token}&next=${encodeURIComponent(`/album/${album.id}?token=${token}&checkout=success`)}`,
    });
  }

  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
  }
  const origin = siteOrigin();

  const line_items = usedCredit || quote.digitalUsd === 0
    ? []
    : [stripeItem("album", "Whenever digital album", quote.digitalUsd)];
  if (!usedCredit && quote.extraAlbumUsd) {
    line_items.push(stripeItem("extra_album", "Second album credit", quote.extraAlbumUsd));
  }
  if (print === "hardcover") {
    line_items.push(
      stripeItem(
        quote.hardcoverBundled ? "hardcover_cart" : "hardcover",
        "Hardcover photo book",
        quote.printUsd
      )
    );
  }
  if (print === "softcover") {
    line_items.push(stripeItem("softcover", "Softcover photo book", quote.printUsd));
  }

  if (line_items.length === 0) {
    album.status = "paid";
    album.updatedAt = new Date().toISOString();
    await saveAlbum(album);
    await recordPurchase(album, {
      kind: "digital",
      label: "Digital album",
      amountUsd: 0,
      creditsGranted: 0,
      stripeSessionId: `free:${album.id}`,
    });
    return NextResponse.json({
      url: `${siteOrigin()}/api/auth/claim?album=${album.id}&token=${token}&next=${encodeURIComponent(`/album/${album.id}?token=${token}&checkout=success`)}`,
    });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${origin}/api/auth/claim?album=${album.id}&token=${token}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/make?album=${album.id}&token=${token}&checkout=cancel`,
    customer_email: album.email || undefined,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    shipping_address_collection: print
      ? { allowed_countries: STRIPE_SHIP_COUNTRIES as unknown as string[] }
      : undefined,
    shipping_options: print
      ? [stripeShipping(country === "US" ? "US shipping" : "International shipping", quote.shippingUsd)]
      : undefined,
    metadata: {
      product: "whenever",
      sku: "album",
      album_id: album.id,
      extra_album: extraAlbum ? "1" : "0",
      print: print || "",
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout did not return a URL." }, { status: 500 });
  }

  album.stripeSessionId = session.id;
  await saveAlbum(album);
  return NextResponse.json({ url: session.url, quote });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { sessionId?: string };
  const album = await loadAlbum(id);
  if (!album || !body.sessionId) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }
  const session = await getStripe().checkout.sessions.retrieve(body.sessionId);
  if (session.payment_status === "paid") {
    await applyAlbumPayment(album, session);
  }
  return NextResponse.json({ ok: true });
}
