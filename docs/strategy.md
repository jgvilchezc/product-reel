# ProductReel — GTM

**Jose Vilchez** · 11 May 2026

I'll skip the deck voice. Here's how I'd actually run this.

## The advantage

The build isn't the moat. With a weekend and Claude Code anyone can wire a webhook to Gemini and call Shotstack. What's hard isn't shipping the pipeline. What's hard is getting any merchant to ever see it.

The advantage I actually have is mechanical: I can render a real cinematic video for any Shopify store using only their public product URL, before they hear from me. That changes outreach from "buy a meeting" to "here's the asset, want it on your store?". That's the whole strategy. The rest of this is downstream of that one move.

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

The email isn't asking for a call. It's delivering the finished asset. Industry benchmark reply rates on cold email run 1–3%. I'm targeting 8–12% because the email is worth opening. I'm not fully confident in that number — it's a guess based on outbound playbooks for products that lead with deliverables, not on measured response from this list. The first month of real outreach is the test.

The math: each pre-rendered video costs about $0.30 in Gemini and Shotstack. At 10% reply that's $3 per qualified conversation. If 25% of replies qualify and 30% of those close, I'm at $40 customer acquisition cost. Annual revenue per closed deal is $348. Payback in six weeks.

Every cold email is its own product demo. That collapses the "let me explain what we do" step that kills most cold outreach.

## Phase 2 — free tools as always-on marketing

Weekend-sized side bets that pull merchants into the funnel:

- A free Shopify product video generator. Paste a URL, get one video at no cost. Footer reads "Built by ProductReel" with an email capture.
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

An in-app video editor UI. Over-engineering before a pilot asks for it. The Director chat covers prompt-based iteration.

Enterprise SOC2, SSO, audit logs. Premature. Stays B2C-DTC until $25k MRR.

A custom voiceover or TTS layer. Music bed plus on-screen typography is enough. No voice licensing to manage.

## Template quality — the image problem I haven't fully solved

The video is only as good as the source images, and Shopify merchants vary wildly. Big DTC brands ship clean 2000px shots. Small stores ship 600px JPGs with compression noise. If Phase 1 outreach lands a video that looks cheap, the prospect doesn't reply. So I need a quality floor I control.

The plan: insert a step between Gemini analysis and Shotstack submit that enhances each source image using Gemini 2.5 Flash Image (Nano Banana). The category is already detected by the existing Gemini pass, so the enhancement step picks one of three prompts based on it — a portrait prompt for fashion, beauty, and jewelry; a product prompt for footwear, electronics, home, food, and sports; a cinematic prompt as fallback. Prompts emphasize recovering authentic texture and edge detail rather than airbrushing.

Cost adds about $0.28 per video (7 images × ~$0.04). Latency adds 3–5 seconds when all seven calls run in parallel. So per-video cost lands around $0.58 instead of $0.30, and end-to-end pipeline time stays under 60s, which is the Vercel maxDuration ceiling.

I'd turn this on by default for Phase 1 outreach. Pre-renders are offline so there's no latency pressure. For the Phase 2 webhook flow it stays off until I have real measurements. If Nano Banana ever spikes to 8s per image even in parallel, I blow the 60s budget and the email never sends.

I haven't called the image-preview model from this codebase yet, so first-call surprises are possible. Worst case, the enhancement step falls back to the original URL on error, and the pipeline never crashes.

## Risks

Shopify App Store listing requires OAuth and a two-week privacy review. Phase 1 sidesteps this entirely by living off the App Store. Phase 4 absorbs the review timeline.

Competitor pricing pressure. Provid.AI sits at $29.99. I win on automation-first vs their manual-first UX, but I can't go above $29 without losing the cold-email pitch's "one for every new product you add" line.

Render quality across categories. Tested on apparel and footwear. Beauty, food, and electronics still need test renders before scaling outreach to those verticals. The image enhancement step above probably covers it, but I won't know until I see the outputs.

Cold-email deliverability. Scale requires warm-up and clean list hygiene. Instantly handles most of this. The first month's measured reply rate is the real verdict on whether the cold-email play works at the rates I'm assuming.

## What's shipped today

The pipeline is live at https://product-reel.vercel.app. That covers the webhook receiver with HMAC validation, Gemini 2.5 vision analysis with structured copy generation, the Shotstack Cinematic Showcase template at 36s and 1080p, Resend email delivery, and `/api/scrape` — which is the foundation of the Phase 1 outreach play and means I can start pre-rendering for prospects tomorrow with no additional code.

Per Derk's "don't oversell" rule: real OAuth and the Shopify App Store listing are Phase 4, not today. The Connect section on the landing page labels itself as a pilot preview, not a shipped install flow.

---

**Sources:** [Store Leads — The State of Shopify in 2026](https://storeleads.app/reports/shopify) · [Shopify Blog — Video Marketing Trends 2025](https://www.shopify.com/blog/video-marketing-trends) · [Shopify App Store — Product Video category](https://apps.shopify.com/categories/store-design-images-and-media-video-and-livestream/all)
