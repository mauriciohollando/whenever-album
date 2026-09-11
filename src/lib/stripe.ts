import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.trim() && !!process.env.STRIPE_PRICE_ALBUM?.trim();
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
  if (!client) client = new Stripe(key);
  return client;
}

export function albumPriceId(): string {
  const id = process.env.STRIPE_PRICE_ALBUM?.trim();
  if (!id) throw new Error("STRIPE_PRICE_ALBUM is missing");
  return id;
}
