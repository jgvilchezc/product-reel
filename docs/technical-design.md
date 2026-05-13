# ProductReel — Technical Design Document

**Jose Vilchez** · 12 May 2026 · v1.0

Honest description of how the system is wired, why each piece exists, where it breaks, and what would have to change to scale.

## 1. What the system does

ProductReel turns a Shopify product page into a 36-second cinematic ad video automatically.

Three entry points trigger the same pipeline:

- **Webhook** — Shopify fires `products/create`, we render a video, email the merchant.
- **Scrape** — a visitor pastes a public product URL on the landing, we render and show the result inline.
- **Backfill** — a visitor pastes a store URL, we enumerate the first five products and render them all.

Each entry point feeds a single pipeline function, which calls Gemini for analysis, Nano Banana for image enhancement, Shotstack for rendering, and Resend for delivery. The output is an mp4 hosted on Shotstack's CDN.

## 2. Architectural constraint that shapes everything

Vercel Hobby has a hard 60-second timeout per function invocation. The whole pipeline doesn't fit in 60 seconds when Nano Banana is on (it adds 10–20s) and we wait for the render to finish (another 30–50s). So the architecture has to either fit inside the budget or escape it cleanly via async.

The webhook flow escapes via Shotstack callbacks. The scrape and backfill flows fit because their callers poll separately.

Everything else in this document is downstream of that decision.

## 3. High-level flow

```
   Shopify Admin            User pastes URL          User pastes store URL
        |                          |                          |
        v                          v                          v
  /api/webhook              /api/scrape                /api/backfill
        |                          |                          |
        +--------------------------+--------------------------+
                                   |
                                   v
                  processProduct(product, options)
                          [lib/pipeline.ts]
                                   |
              +--------------------+--------------------+
              |                    |                    |
              v                    v                    v
        analyzeProduct       enhanceImages        submitRender
        [lib/gemini.ts]    [lib/imageEnhance]   [lib/shotstack.ts]
              |                    |                    |
              v                    v                    v
         Gemini 2.5            Nano Banana          Shotstack
         Flash Vision         + Shotstack Ingest    Edit API
                                                        |
                                  +---------------------+---------------------+
                                  |                                           |
                              callback URL set                          no callback
                                  |                                           |
                                  v                                           v
                       /api/shotstack-callback                       caller polls
                                  |                                  /api/status/{id}
                                  v
                              Resend email
```

The webhook flow always uses the callback. Scrape and backfill flows do not — they return a renderId and let the UI poll. Different latency profiles, same code path inside the pipeline.

## 4. Tech stack

- Next.js 16 App Router on Vercel Hobby serverless
- TypeScript end to end
- External services:
  - Google Gemini 2.5 Flash (multi-image vision analysis)
  - Google Gemini 2.5 Flash Image / Nano Banana (image enhancement)
  - Shotstack Edit API (video rendering)
  - Shotstack Ingest API (asset upload via signed S3 URLs)
  - Resend (transactional email)
  - Shopify Admin (webhook source, public `/products.json` for scrape/backfill)

No databases, no queues, no cache, no auth backend. State lives only inside each function invocation. The render ID is the only durable handle the system gives back, and that's stored by Shotstack.

## 5. Source layout

```
app/
  page.tsx                          # Landing page (all sections)
  api/
    webhook/route.ts                # Shopify webhook receiver
    scrape/route.ts                 # Single-product URL → render
    backfill/route.ts               # Store URL → first 5 products → renders
    simulate/route.ts               # Demo with bundled Nike images
    status/[renderId]/route.ts      # Shotstack render status poller
    shotstack-callback/route.ts     # Async render-complete handler
    diag-enhance/route.ts           # Nano Banana per-image diagnostic
lib/
  pipeline.ts                       # Orchestration / processProduct
  gemini.ts                         # Vision analysis + content generation
  imageEnhance.ts                   # Nano Banana wrapper
  shotstack.ts                      # Render payload builder + Edit/Ingest API
public/test/                        # Demo assets (originals + Nano Banana outputs)
docs/                               # Strategy docs + this TDD
```

## 6. Components in detail

### 6.1 lib/pipeline.ts

The single orchestration function `processProduct(shopifyProduct, options)` runs through:

1. **shopifyToProductInput** — strips body_html, parses price, filters unsupported image formats (avif/heic get dropped with a console warn), caps source images to 5.
2. **analyzeProduct** — calls Gemini with the product text + up to 5 images.
3. **reorderByPriority** — reorders the unique image list per Gemini's image_priority array.
4. **enhanceImages** (optional, gated by `options.enhanceImagesOption`) — runs each image through Nano Banana, returns the Shotstack-hosted URL.
5. **cyclicPadToSeven** — fills the template's 7 image slots by cycling back through the unique inputs. With 5 unique we get `[a, b, c, d, e, a, b]` instead of duplicating the last image like the original car-sale template did.
6. **buildRenderPayload + submitRender** — assembles the Cinematic Showcase JSON, including the callback URL when set, and posts to Shotstack.
7. **pollAndEmail** (legacy path) — only runs when `notifyEmail` is set AND `callbackUrl` is not. The webhook flow uses callbacks, so it skips this. Scrape/backfill flows skip it because they don't email.

The function returns `{ renderIds, productInput, brandName, analysis, pollAndEmailPromise? }`. Callers running under Vercel's `after()` must await the promise if it's set.

### 6.2 lib/gemini.ts

Wraps `gemini-2.5-flash` for multi-image product analysis. The prompt is a 5-step structured procedure (visual analysis → safe text zones → content generation → self-evaluation → JSON output) that returns a single tolerant-parsed JSON blob.

Output fields:

| Field | Purpose | Constraint |
|---|---|---|
| voiceover | Ad copy, hypothetical TTS | ≤ 35 words |
| background_prompt | Future cinematic backdrop generation | free text |
| text_position | top / bottom / split | enum |
| needs_text_background | Plate behind body text? | boolean |
| product_category | One of 9 buckets | enum |
| text_color | Overlay color | "#ffffff" or "#111111" |
| short_title | Billboard headline | ≤ 22 chars |
| spec | Scene-2 tagline | ≤ 22 chars |
| interior | Scene-3 body | ≤ 90 chars |
| upgrades | Scene-4 body | ≤ 90 chars |
| image_priority | Ad-hero ranking | int array, length matches input |

`coerceAnalysis` enforces every constraint independently of what Gemini returns. Hard slices on string lengths. Hex-value whitelist on color. Index range check on priority. Fallback derivations on short_title from raw product title.

### 6.3 lib/imageEnhance.ts

Wraps Gemini 2.5 Flash Image (model id `gemini-2.5-flash-image`, branded "Nano Banana"). Three category-aware prompts hardcoded in the file:

- **Portrait prompt** — fashion, beauty, jewelry. Preserves skin texture without airbrushing.
- **Product prompt** — footwear, electronics, home, food, sports. Recovers material texture and edge clarity.
- **Cinematic prompt** — fallback for "other". General photographic upscale.

For each input image:

1. Fetch the source URL, build inline_data with base64 + mime_type.
2. POST to the Nano Banana endpoint with the chosen prompt.
3. Receive the enhanced PNG as base64.
4. Upload it to Shotstack Ingest via the signed-upload flow (see 6.4).
5. Return the Ingest-hosted https URL.

Per-image errors get caught and silently fall back to the original URL. The pipeline never crashes from a Nano Banana failure; worst case is "this one image isn't enhanced".

`enhanceImagesDiagnostic` is a parallel export that returns `{ original, enhanced, fellBack, error }` per image. `/api/diag-enhance` uses it for visual quality auditing.

### 6.4 lib/shotstack.ts

Two base URLs, two APIs:

```typescript
const SHOTSTACK_BASE = 'https://api.shotstack.io/edit/stage';      // render
const SHOTSTACK_INGEST_BASE = 'https://api.shotstack.io/ingest/stage'; // upload
```

The Ingest API is a three-step signed-upload flow because their direct-data-URI endpoint rejects anything over 400KB and Nano Banana output is 1–3MB:

```
1. POST /ingest/stage/upload  { filename }
   → { data.id, data.attributes.url }    // url is a presigned S3 PUT URL
2. PUT raw bytes to that S3 URL
3. GET  /ingest/stage/sources/{id}       // poll until attributes.status === 'ready'
   → attributes.source                   // final hosted URL
```

`uploadImageToIngest` runs all three steps with a 20-attempt × 1.5s polling loop. Worst case 30s per image, parallel with the four others, so the overall enhancement step is bounded by the slowest single image.

`buildRenderPayload` accepts an optional `callbackUrl` parameter. When set, it gets attached to the render payload as the top-level `callback` field. Shotstack POSTs to that URL when the render reaches a terminal state (done or failed).

### 6.5 Text overlay positioning logic

The Cinematic Showcase template has a hardcoded layout. Gemini's analysis informs three overlay decisions made at render time:

- `text_color` flips between white and near-black based on dominant image luminance. White-on-white bracelets used to render with invisible text. Now Gemini reports the luminance and the renderer flips every text clip together.
- Image clip opacity ties to text color. White text means all background images at 0.4 opacity for legibility. Dark text means images at 1.0 (no point darkening a light product).
- `text_position` and `needs_text_background` exist in the schema but aren't fully wired in the current template. They were intended for a future template that wraps text on different sides.

## 7. API endpoints

| Endpoint | Method | Triggers | Returns | Latency |
|---|---|---|---|---|
| `/api/webhook` | POST | Shopify products/create event | 200 OK immediately, pipeline runs in `after()` | <5s response, ~30s pipeline |
| `/api/scrape` | POST | Visitor pastes product URL | renderId + product metadata | 8–30s |
| `/api/backfill` | POST | Visitor pastes store URL | List of renderId per product | 12–25s |
| `/api/simulate` | POST | Demo button on landing | renderId(s) for the Nike demo | 8–15s |
| `/api/status/{id}` | GET | UI poll | `{ status, url?, error? }` | <1s |
| `/api/shotstack-callback` | POST | Called BY Shotstack | 200 OK ack | <2s including Resend |
| `/api/diag-enhance` | POST | Internal quality audit | Per-image enhanced URL + error | 10–25s |

### 7.1 Webhook contract

```
POST /api/webhook
Headers:
  Content-Type: application/json
  x-shopify-hmac-sha256: <base64 HMAC>
  x-shopify-topic: products/create   (informational; not validated)
Body:
  Shopify product JSON (id, title, body_html, vendor, variants, images)
```

The handler validates HMAC against `SHOPIFY_WEBHOOK_SECRET`, returns 200 OK within Shopify's 5-second SLA, then runs the pipeline asynchronously via `after()`.

### 7.2 Scrape contract

```
POST /api/scrape
Body:
  { productUrl: string, enhance?: boolean, notifyEmail?: string }
Response:
  { success: true, renderIds: [string], product: { title, vendor, price, imageCount, sourceUrl } }
```

Hits `<base>/products/<handle>.json` to fetch the product, then runs the same pipeline.

### 7.3 Backfill contract

```
POST /api/backfill
Body:
  { storeUrl: string, limit?: number }   // limit max 5
Response:
  {
    success: boolean,
    store: string,
    totalInCatalog: number,
    submitted: number,
    failed: number,
    products: [{ title, handle, renderId, productUrl }],
    errors: [{ reason }]
  }
```

Enumerates `<store>/products.json?limit=5` and processes each in parallel via `Promise.allSettled`. Per-product errors isolated so one failure doesn't kill the batch.

### 7.4 Callback contract

Shotstack posts a body that varies by tier. The handler accepts three shapes:

```
{ id, status, url }                                // top-level
{ response: { id, status, url } }                  // older edit API
{ data: { id, attributes: { status, url } } }      // JSON:API style
```

Merchant context (email, product, brand) rides on the callback URL as query params, set at submit time:

```
https://product-reel.vercel.app/api/shotstack-callback
  ?email=<urlencoded>&product=<urlencoded>&brand=<urlencoded>
```

The handler only emails on terminal states (done or failed). Intermediate pings (rendering, saving) get acknowledged with 200 OK and ignored.

## 8. Key design decisions and the why

### 8.1 Why Shotstack callbacks instead of polling inside the lambda

The original code polled Shotstack from inside the webhook handler. That worked until Nano Banana started genuinely working (it was silently broken for weeks). Once enhancement added 15–25 real seconds, the chain Gemini + Nano Banana + submit + poll + email exceeded 60s and Vercel killed the lambda mid-poll. The render finished on Shotstack's side, but the merchant never got the email.

Callbacks fix this structurally. The webhook lambda exits at ~30s after submit. Shotstack later POSTs `/api/shotstack-callback` when the render finishes, and that handler sends the email with its own 60s budget.

This also scales further. Polling-inside-lambda only works when the polled work fits the budget. Callbacks have no such ceiling.

### 8.2 Why cap source images at 5

The Cinematic Showcase template has 7 image slots. Caps at 5 unique source images and cycle-pads to fill the rest, instead of allowing 10+ inputs.

Reasons:

- **Gemini latency** scales with image count. 10 images means ~15s of multi-image analysis. 5 means ~8s.
- **Nano Banana cost** scales linearly. 5 images at $0.04 = $0.20. 10 images = $0.40. For 200 cold-email pre-renders that's $40 vs $80.
- **Shotstack submit time** also scales with the number of source URLs it has to fetch.
- **Cyclic pad** means visually the merchant still sees 7 distinct frames, the repetition just cycles through the best images (Gemini-priority ordered) rather than duplicating the worst one three times.

The cap can be raised to 10 on Vercel Pro. The trade-off is mostly cost, not engineering.

### 8.3 Why opt-in email instead of a verified sender domain

Registering and DKIM-signing a dedicated sender domain takes half a day and earns its cost only when there are paying merchants. For the demo and the early pilots, the landing page asks the visitor for their email if they want the rendered video by inbox; if not, the MP4 URL just appears in the UI.

This means the cold-email outreach path (Phase 1) still needs Instantly with a verified domain, but that's a different channel and unrelated to the transactional video delivery. The two stay independent.

### 8.4 Why filter unsupported image formats upstream

Shotstack rejects avif/heic with a 400 error at submit time. Shopify CDN sometimes serves avif depending on the requesting browser. If a product has 5 jpg + 1 avif, the old code would crash the whole render. The filter runs in `shopifyToProductInput` and drops unsupported formats with a console warn. If 0 supported images remain, the function throws a clear, actionable error.

### 8.5 Why Nano Banana uses signed-upload instead of direct data URI

Shotstack's `/ingest/{v}/sources` endpoint advertises "POST a URL" but the URL field accepts data URIs too. In practice, anything over ~400KB triggers `Item size has exceeded the maximum allowed size` because they store the source record in DynamoDB. Nano Banana output is 1–3MB per image. So we use their three-step signed-upload pattern instead: request a presigned S3 URL, PUT bytes directly, poll until ready.

The 30-minute investigation that produced this finding involved manual probing and reading Vercel runtime logs because Shotstack's docs for the staging tier are sparse.

### 8.6 Why no database, no queue, no cache

The system is stateless on our side. The render ID is the only durable handle and Shotstack stores it. Adding state would mean adding infrastructure cost (Postgres on Supabase, Upstash for queues, etc.) before any merchant pays.

The cost of statelessness: we can't reliably retry a failed Nano Banana call across requests, can't store merchant context server-side between webhook receipt and callback (which is why merchant email rides on the callback URL as query string), and can't show a merchant their video history. All three become real problems at 100+ pilot merchants. For 5 pilots, they're not.

When state becomes necessary, the obvious next steps are Supabase Postgres for persistence and Upstash QStash for queues. Both have generous free tiers.

## 9. Configuration

Required environment variables:

```
GEMINI_API_KEY              # Google AI Studio key (used by gemini.ts AND imageEnhance.ts)
SHOTSTACK_API_KEY           # Shotstack stage tier key (Edit + Ingest)
SHOPIFY_WEBHOOK_SECRET      # HMAC secret for webhook validation (skip in dev)
RESEND_API_KEY              # Resend transactional email
MERCHANT_EMAIL              # Fallback recipient when webhook payload lacks an email
```

The webhook validation falls back to "skip HMAC" when `SHOPIFY_WEBHOOK_SECRET` is unset. Useful for dev, dangerous in production. The route logs a warning when it skips.

Hard-coded constants worth knowing:

```
maxDuration                 60s         all routes
MAX_PRODUCTS (backfill)     5
Image source cap            5
POLL_INTERVAL_MS            3000ms      legacy poll inside processProduct
POLL_MAX_ATTEMPTS           16          legacy poll, fits inside 60s budget
Ingest poll                 20 × 1500ms
```

## 10. Failure modes and resilience

| Failure | Behavior |
|---|---|
| Gemini call fails or returns malformed JSON | `coerceAnalysis` returns `fallbackAnalysis(product)`, render still happens with safe defaults |
| Single Nano Banana image fails | Per-image fallback to original Shopify URL, render uses that instead |
| All Nano Banana calls fail | All 5 images render unenhanced, video still produced |
| Shotstack Ingest signed-upload fails | Caught per-image, falls back to original |
| Shotstack submit fails | processProduct throws, caller decides (webhook logs, scrape returns 500) |
| Shopify products.json returns HTML (anti-bot) | Backfill returns clean error: *"Catalog endpoint returned HTML instead of JSON"* |
| Product has no supported-format images | `shopifyToProductInput` throws with merchant-facing message |
| Render times out at Shotstack | Callback fires with `status: 'failed'`, merchant gets failure email |
| Shotstack callback never fires | Email never sends, but the render itself succeeded. Merchant has to check the dashboard. No retry today. |
| Resend rate-limited | Callback handler returns 500. Shotstack retries the callback (it does so up to 3 times). |

The pipeline's design priority is "always produce something" over "fail loudly". This is appropriate for the demo phase. At scale we'd want explicit dead-letter handling for missed callbacks.

## 11. Known limitations

- **Vercel Hobby 60s ceiling.** Webhook flow fits comfortably (~33s) thanks to callbacks. Scrape with enhance maxes at ~30s. Backfill of 5 products parallel maxes at ~25s. No headroom for 10+ image products or 10+ product backfills.
- **Vercel Hobby concurrency cap.** Bursts of 5+ parallel calls from the same client IP hit a 30s edge timeout on some requests. Production webhook traffic from independent merchants doesn't trigger this; the cold-email pre-render script does. Workaround: throttle the batch script to 2 concurrent, or run the batch from outside Vercel.
- **No state.** A merchant can't see their video history. We can't aggregate metrics on a per-store basis. We can't retry failed renders from a dead-letter queue.
- **Shopify webhook setup is manual.** No OAuth means each merchant pastes the webhook URL by hand in Shopify Admin. Five clicks per pilot.
- **No verified sender domain.** Email is opt-in by visitor input. Real merchants would expect emails from a stable address like `videos@productreel.com`.
- **Stage-tier Shotstack rendering.** Stage queues can stretch to 200+ seconds during peak. The webhook flow's callback architecture handles this fine (merchant just waits longer for the email), but anyone watching the UI in real time may give up.

## 12. Architecture milestones beyond Day 1

These are intentionally not built yet. They get built when the constraint they remove becomes a real ceiling.

| Milestone | Removes constraint | Trigger |
|---|---|---|
| Vercel Pro upgrade ($20/mo) | 60s function timeout, low parallel concurrency cap | When pre-render outreach scales beyond 200/week, or when Nano Banana scope grows to 10+ images |
| Verified sender domain | Email goes to spam | First paying pilot |
| Shopify OAuth app | Manual webhook config per merchant | Phase 4. When funnel justifies the 2-week privacy review |
| Persistent state (Supabase Postgres) | No merchant dashboard, no retry semantics | When 10+ merchants are active or when failed-render recovery becomes important |
| Queue-based fan-out (Upstash QStash) | Webhook lambda doing too much in 60s for very large catalogs | When backfill needs to handle 20+ products in one go |
| Shotstack production tier | Stage queue tail latency | When demo latency >2 min becomes embarrassing |

The order of these isn't fixed. Whichever constraint hits first gets resolved first.

## 13. What I'd change if rebuilding today

A few small things that aren't worth refactoring now but are worth noting:

- **Single env-var Gemini key shared between text and image models.** Should be two keys for billing separation and quota isolation. Trivial change, just hasn't earned the time yet.
- **No structured logging.** `console.log` everywhere. At first paying pilot we'd add something like Pino or wire to Vercel's log drain.
- **No retries on Shotstack ingest poll timeout.** It throws after 30s. In practice that almost never happens, but should retry once.
- **lib/shotstack.ts is doing too much.** It owns render payload construction, Edit API calls, and Ingest API calls. Splitting into three files would help testability.
- **Type narrowing is loose around Shotstack response shapes.** Doing `body.response?.id || body.data?.id` in several places to handle tier variations. A single normalizer function would centralize that.

None of these are blocking the Friday demo.

---

**Related docs:** [strategy-day1.md](./strategy-day1.md) (GTM, Day 1 status) · [strategy.md](./strategy.md) (Day 0, kickoff)
