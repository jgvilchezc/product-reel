# ProductReel — GTM

**Jose Vilchez** · Day 1 · 12 May 2026

Yesterday was the kickoff. Today the pipeline is real. This is the same strategy doc as before, updated with what got built, what broke, what I fixed, and what's next.

I'll skip the deck voice. Here's how I'd actually run this.

## The advantage

The build isn't the moat. With a weekend and Claude Code anyone can wire a webhook to Gemini and call Shotstack. What's hard isn't shipping the pipeline. What's hard is getting any merchant to ever see it.

The advantage I actually have is mechanical: I can render a real cinematic video for any Shopify store using only their public product URL, before they hear from me. As of today I can also render their whole catalog in one shot. That changes outreach from "buy a meeting" to "here's the asset, want it on your store?". That's the whole strategy. The rest of this is downstream of that one move.

## Who I'd target

Shopify DTC stores running 50–500 SKUs, $100k–$5M annual GMV, no in-house creative team. Their products are already structured data on cdn.shopify.com with photos. They just don't have video.

The segment is underserved, but not because nobody is in it. There are five-ish video apps on the Shopify App Store: Shhots, Vidify, Typito, Provid.AI, Vimeo Create. They're all manual. Merchant logs in, picks a product, picks a template, hits generate. That works at one SKU per week. It breaks at fifty.

Shotstack today serves upstream: API customers, agencies, enterprise. The merchant who'd actually benefit from programmatic video can't reach the API directly. Wrong abstraction, wrong pricing, wrong onboarding. That gap is the wedge.

## How big

Roughly: about 2.83M live Shopify stores in 2026 (Store Leads). I estimate around a quarter sit in the 50–500 SKU band, so call it ~700k stores, with 39% in the US which is where I'd start (~275k addressable). If a store renders 80 videos a year at $29/mo, that's $348 per store per year. At 1% penetration of the US band I get about $957k ARR and ~220k Shotstack renders a year. Real, not enormous, and it validates the pricing assumption I haven't tested yet.

For why a merchant would pay: Shopify's own data shows product pages with video convert about 65% better (4.8% vs 2.9%) and lift add-to-cart by 37%. That's the number the cold email leads with.

## North star

Videos rendered per active store per month.

I keep coming back to this one because it captures three things at once. Activation: a store that doesn't render isn't active. Revenue: renders are Shotstack API usage, which is what we make money on. Retention: the merchant who renders more is the merchant who stays.

Three leading indicators I'd track: time to first video after install (target under two minutes), render success rate (above 95%), and email-to-PDP embed rate (target 40%).

## Phase 1 — value-first outreach (live today)

This is the real bet. Every Shopify store has public product pages. We have `/api/scrape`. So I can render a finished 36-second video for any prospect using only their URL, before they hear from me.

The playbook: pull a US Shopify list from Apollo (technographic filter, 50–500 SKU range, employee count 1–50; gets me ~10k prospects per filter pass). For each prospect, hit `/api/scrape` against their best-selling product. Park the rendered MP4 on our CDN. Then cold-email through Instantly:

> *"Took your [Product Name] page and made it into a 36-second cinematic ad. Here's the link: [video]. If you want it on your store and one for every new product you add, hit reply."*

The email isn't asking for a call. It's delivering the finished asset. Industry benchmark reply rates on cold email run 1–3%. I'm targeting 8–12% because the email is worth opening. I'm not fully confident in that number. It's a guess based on outbound playbooks for products that lead with deliverables, not on measured response from this list. The first month of real outreach is the test.

The math: each pre-rendered video costs about $0.58 in Gemini, Nano Banana, and Shotstack. At 10% reply that's $5.80 per qualified conversation. If 25% of replies qualify and 30% of those close, customer acquisition cost is around $77. Annual revenue per closed deal is $348. Payback in about ten weeks. Cost went up from the original $40 CAC estimate because Nano Banana is now actually running (it wasn't yesterday, as I found out today; more on that below).

Every cold email is its own product demo. That collapses the "let me explain what we do" step that kills most cold outreach.

## Phase 1.5 — backfill (shipped today, brand new)

This wasn't in the original plan. Came out of yesterday's kickoff: the webhook only fires when a merchant creates a new product. That's great for stores in motion. It does nothing for stores with a finished catalog that aren't constantly adding inventory.

Today I shipped `/api/backfill`. Paste any public Shopify store URL, we enumerate the first five products from their `/products.json` feed, and run each through the same pipeline a paying merchant gets. No OAuth, no install.

This changes the pitch significantly. Instead of:

> "Once you install, every new product you upload gets a video."

I can now say:

> "Paste your store URL. The next 60 seconds you'll have five videos."

That's a much shorter distance from message to value. It's also what the cold email links to when the merchant clicks through. The asset they got in the inbox was one product; the landing page shows them what their catalog looks like.

There's a real limit: a few stores block public `/products.json` with anti-bot (we caught Kotn, Liquid IV, and Gymshark doing this in testing). Those need OAuth + Admin API to enumerate, which is Phase 4. The backfill UI surfaces this honestly with a heads-up box.

## Phase 2 — free tools as always-on marketing

Weekend-sized side bets that pull merchants into the funnel:

- A free Shopify product video generator. Paste a URL, get one video at no cost. Footer reads "Built by ProductReel" with an email capture. (The current `/scrape` section on the landing already does this, but isn't promoted yet as a standalone tool.)
- A conversion lift calculator. Merchant enters current CR, sees projected lift with video. Calibrated against the Shopify 65% number.

Each tool is one weekend of code. Distribution channels: X/Twitter, r/shopify, ProductHunt. The free tool is also a credibility prop for Phase 1 — the cold email can link to it.

## Phase 3 — content for AI search (GEO)

Merchants increasingly ask ChatGPT, Claude, and Perplexity things like "how do I make product videos for my Shopify store". The models recommend what they can read cleanly. What they read cleanly is markdown.

So I'd publish a `/docs` section with FAQ-style markdown pages: "How to auto-generate Shopify product videos", "Best Shopify video apps compared 2026", "Shopify product video conversion data". Structured properly, that content gets pulled into LLM answers and feeds us referral traffic from AI search. It's SEO for the next five years. Free, compounds.

## Phase 4 — Shopify App Store + AppSumo (scale)

Once Phase 1 validates pricing and ICP, ship the public OAuth app and list on the App Store. Reviews drive everything inside Shopify, and the first reviews come from Phase 1 pilots.

I'd run an AppSumo lifetime-deal listing in parallel: $59 one-time for the first 500 buyers, then graduate to subscription. That's roughly $30k upfront cash and a flood of beta users to stress-test the pipeline.

## Motion stacking

The Phase 1 outreach playbook is portable. Same email template, different connector on top.

WooCommerce: REST API plus product webhook, around 3M stores, no incumbent app store. BigCommerce: similar webhook model, smaller but more affluent merchant base. Etsy and Squarespace Commerce: creator/maker merchants, same underlying job. Adjacent: B2B SaaS with catalogs — real estate listings, job boards, marketplaces.

The wedge is "you give us a public URL, we email you back a video". It generalizes.

## What I'm not building yet

A multi-template menu at launch. One well-tested cinematic template beats five mediocre ones. New templates only after merchants say the current one doesn't fit.

An in-app video editor UI. Over-engineering before a pilot asks for it. The Director chat covers prompt-based iteration, and that section is honestly labeled as a mockup right now.

Enterprise SOC2, SSO, audit logs. Premature. Stays B2C-DTC until $25k MRR.

A custom voiceover or TTS layer. Music bed plus on-screen typography is enough. No voice licensing to manage.

## What broke today and what I fixed

This section exists because yesterday I thought the pipeline was working. Today's stress test showed me parts of it weren't.

### Nano Banana was silently broken

The image enhancement step (Gemini 2.5 Flash Image, aka Nano Banana) was returning enhanced images from the model successfully, but the upload step that puts those bytes back into something Shotstack can read was hitting the wrong URL. The code was POSTing to `/edit/stage/upload`, which returns 404. The real endpoint is `/ingest/stage/sources`, on a different base URL, with a different request shape.

Each failed enhancement was being caught and logged as a warning, then silently falling back to the original Shopify URL. So every render I'd been generating for weeks was using the original low-res images, not the enhanced ones. The output still looked OK because Allbirds and Olipop have decent product photography. It would have looked bad on a small store with 600px JPGs.

I caught this only because I built `/api/diag-enhance` to surface per-image errors. The diagnostic output had `successCount: 0` for five real images. Then it was a 30-minute fix.

### The Ingest API needed a signed-upload flow

After fixing the URL I hit a second issue. Shotstack's `/ingest/.../sources` endpoint accepts data URIs in theory but rejects anything over 400KB. Nano Banana output is 1-3MB per image. So I had to switch to their three-step signed-upload pattern: request a presigned S3 URL, PUT the bytes there, then poll a separate endpoint until the upload reports `status: ready`.

That's 10-15 extra seconds per render. Which created the next problem.

### Vercel Hobby's 60-second ceiling, twice

Once Nano Banana actually worked, the webhook flow exceeded the lambda timeout. The sequence was: Gemini analysis (10s) + Nano Banana enhancement (20s) + Shotstack submit (3s) + render polling (up to 48s) + Resend email (2s). That's 83 seconds in the worst case. The lambda was getting killed mid-poll, the render was finishing in Shotstack but the merchant never got the email.

I tested this with a real product (a washing machine) and confirmed the failure pattern. Then I rebuilt the architecture: instead of polling Shotstack inside the webhook lambda, I register a `callback` URL with the render submission. Shotstack POSTs to that URL when the render completes. The webhook lambda exits in 30 seconds. A separate lambda handles the email with its own 60-second budget. Total wall-clock to email: about 50-60 seconds, with both lambdas comfortably inside their own ceilings.

This is the right architecture, not just a hack. Polling inside the calling lambda only works when the work being polled fits the budget. Callbacks scale further.

### Template was poorly suited to Shopify data

The template I'm using was originally Shotstack's "car sale slideshow" demo. It was designed for short technical specs ("V8 Engine") and 5–7 image slots filled with car photography. Shopify products break those assumptions in several ways.

- Product titles are long. Allbirds returns "Men's Canvas Cruiser - Warm White (Natural White Sole)". The original code pushed that raw into a slot designed for "FORD F-150", and it wrapped onto two lines, colliding with the model year above. Now Gemini returns a `short_title` constrained to ≤22 chars, and the renderer hard-caps anyway as a safety net.
- White text doesn't read on white products. The template assumed a dark cinematic background everywhere. On a silver Pandora bracelet shot on white seamless, white "UPGRADES" text disappeared. Gemini now picks `text_color` as #ffffff or #111111 based on the dominant luminance of the source image, and the renderer flips every overlay clip together.
- Images can be wrong format. Shopify CDN sometimes serves `.avif` for modern browsers; Shotstack rejects it. The pipeline now filters unsupported extensions upstream, so a product with five `.jpg` + one `.avif` renders with the five `.jpg` instead of crashing.
- Shopify product pages with 10+ images blew the time budget. The pipeline now caps source images at 5, and the cyclic-pad step fills the template's 7 slots by cycling back to image 1 instead of duplicating the last image three times.
- Gemini sometimes returns `product_category: "other"` for products it doesn't recognize. The previous fallback rendered the literal word "OTHER" in the spec slot of every "other"-classified video. Now it falls back through `product_category → brandName → "NEW ARRIVAL"`, and `"other"` is intentionally skipped.

### Polling 5 parallel scrapes from one IP fails on Vercel Hobby

During a 30-product stress test I tried firing 5 scrape calls in parallel. The first 15 returned `000` after a 30-second edge timeout; the next 15 worked normally. Same code, same URLs.

This is Vercel Hobby's concurrent-execution limit kicking in. From a single IP, bursts of 5+ concurrent function invocations get queued and some hit the edge timeout before any function instance picks them up. The fix isn't in the code — it's in how the stress test runs. Production traffic from real merchants (one webhook at a time per merchant) doesn't hit this. Running parallel cold-email pre-renders for outreach does. I'll need to throttle that script to 2-3 concurrent at most, or move to Vercel Pro which lifts the cap.

## Template quality — image problem, now solved

The video is only as good as the source images, and Shopify merchants vary wildly. Big DTC brands ship clean 2000px shots. Small stores ship 600px JPGs with compression noise. If Phase 1 outreach lands a video that looks cheap, the prospect doesn't reply. So I need a quality floor I control.

Today's pipeline runs every source image through Gemini 2.5 Flash Image (Nano Banana) before Shotstack rendering. The category is detected by the existing Gemini analysis pass, so the enhancement step picks one of three prompts — portrait for fashion/beauty/jewelry, product for footwear/electronics/home/food/sports, cinematic as fallback. Prompts emphasize recovering authentic texture and edge detail rather than airbrushing.

Cost adds about $0.28 per video (5 images × ~$0.04 — went from 7 to 5 after the cap change). Latency adds 10–15 seconds when all five calls run in parallel. The render-pipeline total time stays around 30 seconds inside the webhook lambda, well below the Vercel ceiling, because the rest of the work moved to the Shotstack callback handler.

I validated this end-to-end today with a real test: a synthetic Nike t-shirt product with five 144p / 3KB source images. The pipeline ran through Gemini → Nano Banana → Shotstack with callback, the email arrived, and the final video showed visibly sharper detail on every shot. Before/after pairs are live on the landing page in the new Quality section, with an interactive slider.

## What's shipped today (Day 1)

The pipeline is live at https://product-reel.vercel.app. Concretely:

- **Webhook receiver** with HMAC validation. Reliable. Tested against real Shopify dev store payloads.
- **Gemini 2.5 Flash multi-image analysis** that returns: voiceover, background prompt, text position, text color, product category, short title, spec/interior/upgrades copy, and image-priority ranking. All used by the renderer.
- **Nano Banana enhancement** (now actually working). Five-image parallel, signed-upload to Shotstack Ingest, ~12s end-to-end.
- **Shotstack Cinematic Showcase template** rendering 36s 1080p video, with dynamic per-render text color and per-clip image opacity that adapt to the product.
- **`/api/scrape`** for one-product-from-URL. Foundation of Phase 1 cold outreach.
- **`/api/backfill`** for whole-catalog-from-URL. Foundation of Phase 1.5 conversion accelerator.
- **`/api/shotstack-callback`** that decouples email delivery from the webhook lambda's budget.
- **`/api/diag-enhance`** for surfacing Nano Banana per-image errors (mostly internal, but I'll keep it).
- **Resend email delivery, opt-in.** Visitor types their email on the landing if they want the video in their inbox. Otherwise the MP4 URL just shows up in the UI. No sender domain to register, no DKIM, no spam folder.
- **Landing page rewrite**: Connect and AI Director marked as Coming Soon (because they are), Backfill section replaces the email waitlist, Quality section with drag-to-compare before/after slider showing real Nano Banana output on real low-res images.

Per Derk's "don't oversell" rule: real OAuth and the Shopify App Store listing are Phase 4, not today. The Connect section labels itself accordingly.

### Stress test numbers from today

- 30 products via `/api/scrape` (no enhance) → 29/30 succeeded end-to-end, 1 upstream slow.
- 30 products via `/api/scrape?enhance=true` (Nano Banana on) → 30/30 succeeded.
- 5 stores via `/api/backfill` → 3/3 happy-path returned 5 renders each, 3/3 anti-bot stores returned clean error messages.
- 10 edge-case payloads (long title, $0 price, no images, avif-only, 12-image cap, unicode) → 8 succeeded, 2 failed with the intended error message.

That's 82 real renders across diverse products. The pipeline is robust enough for a Friday demo.

## Days 2–7 plan

If today was infrastructure, the rest of the week is throughput. The order matters because each step depends on the previous one being solid.

**Day 2 (tomorrow):** Pull the Apollo list. Filter: US Shopify, 50–500 SKUs, 1–50 employees. Target 200 prospects in the first batch. Manually inspect 10 to confirm they're actually in the ICP — Apollo's technographic filters are noisy.

**Day 3:** Pre-render videos for the 200. Use the `/api/scrape?enhance=true` path. Throttle to 2 parallel because of the Vercel Hobby concurrency cap I found today; that means the batch takes about 100 minutes of wall-clock to run. Store the resulting MP4 URLs in a spreadsheet next to merchant email + product handle.

**Day 4:** Warm up the Instantly cold-email account. Send 20-50 messages from the warm-up sequence so the domain has reputation. Draft the cold-email copy (one variant; we A/B later) and the follow-up sequence (3 emails over 7 days).

**Day 5:** Send the first 50 of the 200. Hold the rest as the control. Watch for delivery problems (bounces, spam folder), not for replies yet. Replies are a 7-day window.

**Day 6:** Send the next 100. Add follow-up #1 to the first batch (3 days after the initial). Start logging replies in a sheet: positive, negative, "can you also do X" (these are gold).

**Day 7:** First weekly review. Did we hit ≥3% reply rate? If yes, scale Apollo pulls to 1000/week. If no, the issue is one of: the list (wrong ICP), the email copy (not compelling), or the asset quality (the video doesn't sell). Iterate on whichever is the weakest link.

In parallel during this week, I'll work on:

- **A real Shopify dev store** with our app installed for the OAuth-flow video walkthrough. Recordings of this go into the Phase 4 App Store listing later.
- **The conversion-lift calculator** as a Phase 2 free tool. About a day of work, surfaces a number that lets the cold email link to something with a measurable claim.
- **Vercel Pro evaluation.** $20/mo for 300s maxDuration removes the parallel-burst limit and gives Nano Banana room to handle 10-image catalogs. The price is trivial compared to even one merchant who churns because the demo video timed out.

## What I still need (and what's blocking me)

For the Apollo list pull I need an Apollo account with a credit card on file. If we can get Castmill's existing one shared, day 2 happens tomorrow. If not, I'll sign up personally and expense it.

For Instantly I need the same — a paid plan and a domain we can use as the sender. ProductReel.vercel.app isn't a real domain; we want something like `reels.castmill.com` or a fresh one. Domain registration + DKIM setup is about half a day if Shotstack/Castmill IT can help with DNS.

I'm skipping the Resend sender domain for now. Verifying a real sending address is half a day of DNS work, and the demo doesn't need it. Instead the landing page will ask the visitor for their own email if they want the video by inbox. Type it in, you get it. Leave it blank, the MP4 URL just shows up in the UI. The cold-email outreach path still needs Instantly (cold emails to merchants, not transactional video delivery), so the two channels stay independent.

None of these block the demo on Friday. They block the Day 2-7 outreach plan.

## What's manual for the demo

The pipeline is automated. The wiring around it isn't, on purpose.

Anyone who wants to test the live webhook flow from a real Shopify store has to configure the webhook by hand. Shopify Admin → Settings → Notifications → Webhooks → Create. Point it at `https://product-reel.vercel.app/api/webhook`, paste the HMAC secret, save. Five clicks. That's how every Shopify integration works before OAuth, and we don't have OAuth yet. It's in Phase 4 because writing the OAuth app means a privacy review and a two-week App Store wait, and that timeline only makes sense once Phase 1 has validated pricing. The Connect section on the landing is marked as a mockup so nobody assumes the install button works yet.

Email delivery is opt-in for the same reason. Verifying a real sender domain is half a day of DNS plumbing that earns its cost once we have paying merchants, not before. The landing has an email input — type yours if you want the rendered video by inbox, skip it if you'd rather just watch the MP4 in the UI. Same pipeline either way.

Both are choices I'd reverse the moment Phase 1 hits its first paying pilots. Until then they keep the demo cheap to run and honest about what's actually shipped.

## Risks I'm watching

Shopify App Store listing requires OAuth and a two-week privacy review. Phase 1 sidesteps this entirely by living off the App Store. Phase 4 absorbs the review timeline.

Competitor pricing pressure. Provid.AI sits at $29.99. I win on automation-first vs their manual-first UX, but I can't go above $29 without losing the cold-email pitch's "one for every new product you add" line. Pricing assumption is still untested. The first 50 cold emails are the test.

Render quality across categories. Tested today on apparel, footwear, beverages, and chocolate. Beauty, jewelry, electronics, and home goods still need test renders before scaling outreach to those verticals. The image enhancement step probably covers it, but I won't know until I see the outputs at scale.

Cold-email deliverability. Scale requires warm-up and clean list hygiene. Instantly handles most of this. The first month's measured reply rate is the real verdict on whether the cold-email play works at the rates I'm assuming.

Vercel Hobby plan limits. Today's stress test showed a 5-parallel concurrency ceiling that will affect the Phase 1 batch render script. Mitigation: throttle the script to 2 concurrent, or upgrade to Pro for $20/mo. Probably the latter, once outreach starts.

Shotstack stage tier render queue. Stage renders sometimes take 200+ seconds when there's a queue. Pre-rendering is fine because it's offline. The webhook live path uses callbacks so it doesn't matter, but it does mean a merchant who just installed and sat watching for their video might wait 3-4 minutes. The email arrives whenever the render finishes. Solving this means moving to Shotstack production tier, which is a separate billing tier.

---

**Sources:** [Store Leads — The State of Shopify in 2026](https://storeleads.app/reports/shopify) · [Shopify Blog — Video Marketing Trends 2025](https://www.shopify.com/blog/video-marketing-trends) · [Shopify App Store — Product Video category](https://apps.shopify.com/categories/store-design-images-and-media-video-and-livestream/all)
