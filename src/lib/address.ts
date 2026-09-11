import type Stripe from "stripe";
import type { ShippingAddress } from "./types";

type StripeShip = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export function addressFromStripe(session: Stripe.Checkout.Session): ShippingAddress | null {
  const raw = session as Stripe.Checkout.Session & {
    shipping_details?: StripeShip | null;
    collected_information?: { shipping_details?: StripeShip | null };
  };
  const ship = raw.collected_information?.shipping_details || raw.shipping_details;
  const addr = ship?.address;
  if (!addr?.line1 || !addr.city || !addr.country) return null;
  return {
    name: ship?.name || session.customer_details?.name || "Album owner",
    email: session.customer_details?.email || session.customer_email || undefined,
    line1: addr.line1,
    line2: addr.line2 || undefined,
    city: addr.city,
    state: addr.state || undefined,
    postal: addr.postal_code || "",
    country: addr.country,
  };
}
