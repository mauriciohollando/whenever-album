/**
 * Creates the single Whenever album product / $20 price.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-stripe-product.mjs
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("STRIPE_SECRET_KEY missing");
  process.exit(1);
}

const stripe = new Stripe(key);
const existing = await stripe.products.search({
  query: "name:'Whenever — Family Album' AND active:'true'",
  limit: 1,
});

const product =
  existing.data[0] ||
  (await stripe.products.create({
    name: "Whenever — Family Album",
    description:
      "One AI-generated 20-page family album. Any years you want. Pay once per album.",
    metadata: { product: "whenever", sku: "album" },
  }));

const prices = await stripe.prices.list({
  product: product.id,
  active: true,
  limit: 10,
});
const twenty = prices.data.find(
  (p) => p.unit_amount === 2000 && p.currency === "usd" && p.type === "one_time"
);

const price =
  twenty ||
  (await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
    currency: "usd",
    metadata: { product: "whenever", sku: "album" },
  }));

console.log(`STRIPE_PRICE_ALBUM=${price.id}`);
console.log(`STRIPE_PRODUCT_ID=${product.id}`);
console.log("\nAdd STRIPE_PRICE_ALBUM to Vercel Production + Preview.");
