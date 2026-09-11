import type Stripe from "stripe";
import { dollarsToCents } from "./commerce";
import { optionalPriceId } from "./stripe";

const PRICE_ENV: Record<string, string> = {
  album: "STRIPE_PRICE_ALBUM",
  extra_album: "STRIPE_PRICE_EXTRA_ALBUM",
  hardcover: "STRIPE_PRICE_HARDCOVER",
  hardcover_cart: "STRIPE_PRICE_HARDCOVER_CART",
  softcover: "STRIPE_PRICE_SOFTCOVER",
  tee: "STRIPE_PRICE_TEE",
  hoodie: "STRIPE_PRICE_HOODIE",
  mug: "STRIPE_PRICE_MUG",
  poster: "STRIPE_PRICE_POSTER",
};

export function stripeItem(sku: string, name: string, usd: number): Stripe.Checkout.SessionCreateParams.LineItem {
  const env = PRICE_ENV[sku];
  const price = env ? optionalPriceId(env) : undefined;
  if (price) return { price, quantity: 1 };
  return {
    price_data: {
      currency: "usd",
      unit_amount: dollarsToCents(usd),
      product_data: {
        name,
        metadata: { product: "whenever", sku },
      },
    },
    quantity: 1,
  };
}

export function stripeShipping(name: string, usd: number): Stripe.Checkout.SessionCreateParams.ShippingOption {
  return {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: dollarsToCents(usd), currency: "usd" },
      display_name: name,
    },
  };
}

export const STRIPE_SHIP_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "IE",
  "AU",
  "NZ",
  "DE",
  "FR",
  "NL",
  "ES",
  "IT",
];
