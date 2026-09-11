# Whenever

A twenty-page family album for any stretch of years — 500 BC, 1948, 2112, or the Tuesday in between.

**Live:** after first deploy, `https://whenever-album.vercel.app`

## Product

- Up to 6 people, 5 photographs each, name + note
- Year window of 5–60 years (BC or AD; people age as pages turn)
- Up to 10 named events
- Up to 3 mood tags
- 20 pages, 1–4 photographs per page
- Tap a photograph for its title and description
- **$20** per album, one Stripe product, no subscription

## Stack

Next.js App Router, Stripe Checkout, OpenAI (`gpt-4o-mini` for the album plan, `gpt-image-1` for photographs), Vercel Blob.

## Local

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Create the Stripe price (same Stripe account as the other live shops):

```bash
node --env-file=.env.local scripts/create-stripe-product.mjs
```

Copy `STRIPE_PRICE_ALBUM` into `.env.local` and Vercel.

## Deploy

Separate Vercel project (not the aiquest / RFPCheck app).

```bash
npx vercel --prod
```

Env on Production + Preview:

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Same live Stripe key |
| `STRIPE_PRICE_ALBUM` | $20 one-time price |
| `STRIPE_WEBHOOK_SECRET` | `checkout.session.completed` |
| `OPENAI_API_KEY` | Plan + photographs |
| `BLOB_READ_WRITE_TOKEN` | Uploads + generated images |
| `NEXT_PUBLIC_SITE_URL` | Checkout return URLs |
| `ALBUM_TOKEN_SECRET` | Album link tokens |

Webhook URL: `https://<host>/api/webhooks/stripe`  
Events: `checkout.session.completed`
