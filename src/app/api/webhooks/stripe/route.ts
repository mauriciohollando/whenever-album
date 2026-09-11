import { NextResponse } from "next/server";
import { applyStripeSession } from "@/lib/fulfill";
import { getStripe } from "@/lib/stripe";

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

  await applyStripeSession(event.data.object);
  return NextResponse.json({ ok: true });
}
