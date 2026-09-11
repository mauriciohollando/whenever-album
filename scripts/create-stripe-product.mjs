/**
 * Creates Whenever Stripe products / one-time prices.
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

const CATALOG = [
  {
    env: "STRIPE_PRICE_ALBUM",
    sku: "album",
    name: "Whenever — Digital album",
    description: "One AI-generated 20-page family album. Pay once. PDF included.",
    amount: 1200,
  },
  {
    env: "STRIPE_PRICE_EXTRA_ALBUM",
    sku: "extra_album",
    name: "Whenever — Second album credit",
    description: "A second digital album for $3 more when bought with the first.",
    amount: 300,
  },
  {
    env: "STRIPE_PRICE_HARDCOVER",
    sku: "hardcover",
    name: "Whenever — Hardcover photo book",
    description: "Printed hardcover of the generated album. Ships after the photographs exist.",
    amount: 3900,
  },
  {
    env: "STRIPE_PRICE_HARDCOVER_CART",
    sku: "hardcover_cart",
    name: "Whenever — Hardcover with digital album",
    description: "Hardcover add-on when bought with the digital album ($2 off).",
    amount: 3700,
  },
  {
    env: "STRIPE_PRICE_SOFTCOVER",
    sku: "softcover",
    name: "Whenever — Softcover photo book",
    description: "Printed softcover of the generated album. Ships after the photographs exist.",
    amount: 2400,
  },
  {
    env: "STRIPE_PRICE_TEE",
    sku: "tee",
    name: "Whenever — T-shirt",
    description: "Bella+Canvas 3001 with one album photograph.",
    amount: 2800,
  },
  {
    env: "STRIPE_PRICE_HOODIE",
    sku: "hoodie",
    name: "Whenever — Hoodie",
    description: "Gildan 18500 with one album photograph.",
    amount: 4900,
  },
  {
    env: "STRIPE_PRICE_MUG",
    sku: "mug",
    name: "Whenever — Mug",
    description: "11oz ceramic mug with one album photograph.",
    amount: 1800,
  },
  {
    env: "STRIPE_PRICE_POSTER",
    sku: "poster",
    name: "Whenever — Poster",
    description: "12×16 matte poster of one album photograph.",
    amount: 2200,
  },
];

for (const item of CATALOG) {
  const existing = await stripe.products.search({
    query: `name:'${item.name.replaceAll("'", "\\'")}' AND active:'true'`,
    limit: 1,
  });
  const product =
    existing.data[0] ||
    (await stripe.products.create({
      name: item.name,
      description: item.description,
      metadata: { product: "whenever", sku: item.sku },
    }));

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 20 });
  const found = prices.data.find(
    (price) => price.unit_amount === item.amount && price.currency === "usd" && price.type === "one_time"
  );
  const price =
    found ||
    (await stripe.prices.create({
      product: product.id,
      unit_amount: item.amount,
      currency: "usd",
      metadata: { product: "whenever", sku: item.sku },
    }));

  console.log(`${item.env}=${price.id}`);
}

console.log("\nAdd these to .env.local and Vercel Production + Preview.");
console.log("Checkout still works with price_data if a price id is missing.");
