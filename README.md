# ProductReel

AI-generated cinematic video ads for Shopify product pages. Paste a product URL, get a finished 36-second MP4 in your inbox.

Live at **https://product-reel.vercel.app**.

This is a take-home project for Shotstack. Brief: pick an audience segment that's underserved, validate it, design the GTM motion that drives them to a first successful render, and ship the minimum artefact that motion needs. The full strategy lives in [`docs/strategy-one-pager.md`](docs/strategy-one-pager.md); the architecture write-up is in [`docs/technical-design.md`](docs/technical-design.md).

## What it does

Three things, each a separate entry point.

**Paste-a-URL (`/api/scrape`).** Give it any public Shopify product URL. We hit the store's `/products/<handle>.json`, ask Gemini 2.5 Flash to write the script and pick the strongest hero shot, run each image through Nano Banana for a quality pass, and submit the render to Shotstack's Cinematic Showcase template. About 50-60 seconds from URL to MP4.

**Backfill a whole store (`/api/backfill`).** Same idea, but enumerates the first five products in the store's public catalog. Five videos in parallel. Useful when you want to see what your whole catalog looks like as video, not just one product.

**Real Shopify webhook (`/api/webhook`).** HMAC-validated. Fires when a merchant creates a new product. Same pipeline, async email when the render finishes. This is what a paying merchant would install.

The landing page also has a "before vs after" slider showing what Nano Banana actually does to a low-res Shopify image. Drag the handle and you'll see.

## Try it without installing anything

1. Open https://product-reel.vercel.app
2. Scroll to **"Scrape any Shopify URL"**. Paste a product URL or click one of the sample chips. Drop your email if you want the MP4 in your inbox. Skip it if you'd rather just watch the result on screen.
3. Hit *Scrape & generate*. About 30-60 seconds.

To try the catalog version, scroll one section down to **"Backfill existing catalog"** and paste a store URL instead. Five videos arrive one by one as each render finishes.

## Run it locally

```bash
git clone https://github.com/jgvilchezc/product-reel.git
cd product-reel
npm install
cp .env.example .env.local   # fill in the keys below
npm run dev
```

Open http://localhost:3000.

### Env vars

| Key | What it's for |
|-----|--------------|
| `GEMINI_API_KEY` | Gemini 2.5 Flash (analysis) and Gemini 2.5 Flash Image / Nano Banana (enhancement). One key, both models. |
| `SHOTSTACK_API_KEY` | Shotstack stage tier for now. Bump to prod when scaling. |
| `RESEND_API_KEY` | Transactional email. Optional. Leave blank and the MP4 URL just shows up in the UI. |
| `SHOPIFY_WEBHOOK_SECRET` | Only needed if you wire a real Shopify webhook. Skip it to skip HMAC validation in dev. |
| `MERCHANT_EMAIL` | Fallback recipient for webhook-triggered renders when the Shopify payload has no email. |

## How to wire a real Shopify store

There's no OAuth app yet. That's Phase 3 of the GTM plan, so this is manual. Five clicks.

1. In your Shopify admin, go to **Settings → Notifications → Webhooks → Create webhook**.
2. **Event:** `Product creation`. **Format:** JSON. **URL:** `https://product-reel.vercel.app/api/webhook` (or your own deployment URL).
3. Save. Shopify shows you the HMAC secret. Copy it.
4. In Vercel (or wherever you deployed), set `SHOPIFY_WEBHOOK_SECRET` to that value and `MERCHANT_EMAIL` to the address that should receive the renders. Redeploy.
5. Create a test product in Shopify. The video lands in the inbox in about a minute.

If you're testing on a Shopify dev store, the same flow works. The webhook handler logs the request body and the render submit ID, so `vercel logs` will tell you what happened if anything looks off.

## Tech stack

- Next.js 16 App Router on Vercel (Hobby tier today, 60-second `maxDuration` ceiling — see the technical design doc for how the callback architecture works around this).
- Gemini 2.5 Flash for multi-image analysis, Gemini 2.5 Flash Image (Nano Banana) for per-image enhancement.
- Shotstack Edit API for rendering, Shotstack Ingest API for uploading enhanced images.
- Resend for email delivery.
- Tailwind for the landing page.

## What's intentionally not built yet

- No OAuth app on the Shopify App Store. That's a Phase 3 decision, gated on the first paying pilots.
- No in-app video editor. The "AI Director" chat on the landing page is honestly labeled as a mockup.
- No multi-template menu. One well-tested template beats five mediocre ones.
- No verified sender domain for transactional email. The landing asks for the visitor's email if they want it in their inbox.

## Sample videos

Some real renders we generated from public Shopify stores, just to show what the output looks like across categories: see [`docs/sample-videos.md`](docs/sample-videos.md).

## Docs

- [`docs/strategy-one-pager.md`](docs/strategy-one-pager.md) — the GTM strategy, one page.
- [`docs/strategy-day1.md`](docs/strategy-day1.md) — long-form version with detail on every phase, what broke, and what I fixed.
- [`docs/technical-design.md`](docs/technical-design.md) — architecture, components, failure modes, what I'd change if I rebuilt this from scratch.

## Contact

Jose Vilchez · josegabrielvilchezc@gmail.com
