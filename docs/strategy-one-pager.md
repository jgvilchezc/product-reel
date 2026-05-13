# ProductReel — GTM

**Jose Vilchez** · 13 May 2026 · live at https://product-reel.vercel.app

The build is the easy part. With Claude Code and a weekend, anyone can wire a webhook to Gemini and Shotstack. The hard part is getting any merchant to ever see it. The advantage I actually have is mechanical: I can render a real cinematic video for any Shopify store from their public product URL, before they hear from me. That changes outreach from "buy a meeting" to "here's the asset, want it on your store?".

**Segment.** Shopify DTC stores with no in-house creative team. There are five video apps on the Shopify App Store today (Shhots, Vidify, Typito, Provid.AI, Vimeo Create) and they're all manual: log in, pick product, pick template, hit generate. That works at one SKU per week and breaks at fifty. Shotstack itself serves upstream (API customers, agencies, enterprise), so the merchant who'd actually benefit from programmatic video can't reach the API directly. Wrong abstraction, wrong pricing, wrong onboarding. That gap is the wedge.

**Market.** Roughly 2.83M live Shopify stores in 2026. So call it ~700k stores, 39% in the US (~275k addressable). At $29/mo and 80 renders a year per store, that's $348 annual revenue per store. The why-they-pay number: Shopify's own data shows product pages with video convert 65% better (4.8% vs 2.9%) and lift add-to-cart 37%. That's the line the cold email leads with.

**North star.** Videos rendered per active store per month. It captures activation (a store that doesn't render isn't active), revenue (renders are Shotstack API usage), and retention in one number.

**Phases.**

1. Pull 200 US Shopify prospects from Apollo. Pre-render one video per store via `/api/scrape`. Cold-email through Instantly: *"Took your {{Product}} page and made it a 36-second cinematic ad. Here's the link."* The email is the demo. Industry cold-email reply runs 1–3%; I'm aiming for 8–12% because this email is worth opening. That number is a guess. The first month could be the test.

1.5. Paste any store URL → five renders from the first five products in their catalog. No OAuth, no install. The cold email links to this, so the merchant who clicks through sees what their whole catalog looks like, not just the one product I picked.

2. *Content for AI search (GEO).* Publish FAQ-style markdown so ChatGPT, Claude, and Perplexity can pull us when merchants ask how to make product videos. SEO that compounds over years.

3. *Shopify App Store + AppSumo.* Public OAuth app plus a $59 lifetime listing for the first 500 buyers. Only after Phase 1 validates pricing, because OAuth means a two-week privacy review.

4. *Free tools as marketing.* Standalone scrape generator, conversion-lift calculator. Weekend bets that pull merchants into the funnel.

**Unit economics.** $0.58 per pre-rendered video (Gemini + Nano Banana + Shotstack). Pricing is the open question; the first 50 emails decide it.

**Shipped.** End-to-end pipeline live in production. Validated Shopify webhook, Gemini 2.5 Flash multi-image analysis, Nano Banana image enhancement with signed-upload to Shotstack Ingest, Cinematic Showcase render with dynamic text color, Shotstack callback that decouples email delivery from the lambda budget. Three public endpoints: `/api/scrape` (one product URL), `/api/backfill` (whole catalog), `/api/shotstack-callback` (async email). Stress test today: 82 real renders, ~95% success. Landing page rewrite with a drag-to-compare quality slider showing real Nano Banana output on 144p source images.

**Risks I'm watching.** Pricing ($29) is untested; first 50 emails decide. Render quality already tested across categories: apparel, footwear, and beverages tested today, beauty/jewelry/electronics, others need verification before scaling outreach to those verticals. Cold-email deliverability: Instantly handles warm-up, but the measured reply rate is the verdict on whether the playbook works at the rates I'm assuming.
