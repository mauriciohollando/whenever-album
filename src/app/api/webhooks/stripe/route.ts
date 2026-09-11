import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { loadAlbum, saveAlbum } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object;
  if (session.metadata?.product !== "whenever") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const albumId = session.metadata?.album_id;
  if (!albumId) return NextResponse.json({ ok: true });

  const album = await loadAlbum(albumId);
  if (!album) return NextResponse.json({ ok: true, missing: true });
  if (album.status === "draft") {
    album.status = "paid";
    album.email = session.customer_details?.email || session.customer_email || album.email;
    album.stripeSessionId = session.id;
    album.updatedAt = new Date().toISOString();
    await saveAlbum(album);
  }

  return NextResponse.json({ ok: true });
}
