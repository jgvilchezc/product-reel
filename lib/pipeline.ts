import { analyzeProduct, type ProductInput, type GeminiAnalysis } from './gemini';
import {
  buildRenderPayload,
  // buildBoldEnergyPayload, buildCleanMinimalPayload — kept in shotstack.ts for re-enable later
  submitRender,
  getRenderStatus,
} from './shotstack';
import { enhanceImages } from './imageEnhance';

export type { ProductInput };

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  variants: Array<{ price: string }>;
  images: Array<{ src: string }>;
}

export interface ProcessOptions {
  geminiKey: string;
  // If set, fires a background poll-and-email task once renders are submitted.
  notifyEmail?: string;
  // Override Gemini's image source — used by /api/simulate where Shotstack reads from a public URL
  // but Gemini reads a base64 data URL from the local filesystem.
  geminiImageOverride?: string;
  // When true, runs each source image through Gemini 2.5 Flash Image (Nano Banana) for
  // detail recovery before submitting to Shotstack. Adds ~$0.28 cost and 3-5s latency per
  // pipeline run. Default off — turn on for offline pre-renders (Phase 1 outreach script)
  // where the latency budget is generous.
  enhanceImagesOption?: boolean;
}

export interface ProcessResult {
  renderIds: string[];
  productInput: ProductInput;
  brandName: string;
  analysis: GeminiAnalysis;
  // When `options.notifyEmail` is set, this resolves once polling + email send finish.
  // Callers running under Vercel `after()` must await this; otherwise the serverless
  // function instance can be killed before pollAndEmail completes (~30s of work).
  pollAndEmailPromise?: Promise<void>;
}

// Bold Energy + Clean Minimal builders kept in shotstack.ts but not invoked here.
// Re-add to the Promise.all + TEMPLATE_LABELS to restore the multi-template flow.
const TEMPLATE_LABELS = ['Cinematic Showcase'] as const;

export function shopifyToProductInput(product: ShopifyProduct): {
  productInput: ProductInput;
  brandName: string;
} {
  const description = (product.body_html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const rawPrice = product.variants?.[0]?.price ?? '0';
  const price = parseFloat(rawPrice).toFixed(0);

  // Source images are capped at 5 before they reach Gemini OR Shotstack. Reasons:
  //   1. Vercel Hobby's 60s maxDuration on /api/webhook. Each extra source image adds
  //      ~1-2s of Gemini latency (multi-image analysis) and ~0.5-1s of Shotstack
  //      submit latency (CDN fetch). At 10 source images we routinely blew the
  //      budget — render completed but Vercel killed the lambda before pollAndEmail
  //      could send the merchant their video. (User-flagged, May 12.)
  //   2. The Cinematic Showcase template has 7 image slots. cyclicPadToSeven fills
  //      them from the 5 unique sources: [a,b,c,d,e,a,b] — visually 7 distinct
  //      scenes since the cycle wraps to the hero shot, not a closeup detail.
  //   3. Merchant order on Shopify is usually best-first, so the first 5 cover the
  //      most important angles. Gemini still ranks within those 5 via image_priority.
  // Bump to 10 if we ever move to Vercel Pro (300s maxDuration).
  //
  // We also filter unsupported extensions HERE rather than letting normalizeImageUrl
  // throw downstream. AVIF in particular is rejected by Shotstack ("format not
  // supported"), and Shopify CDN serves whatever format the merchant uploaded —
  // so a single .avif in the source array used to kill the whole render and leave
  // the webhook silently failing inside Vercel's after() callback. (User-flagged,
  // May 12: Nike test product with mixed jpg/avif images never produced a video.)
  const SHOTSTACK_SUPPORTED = /\.(jpe?g|png|gif|webp|bmp|tiff)(\?|#|$)/i;
  const allUrls = (product.images || [])
    .map((i) => i.src)
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
  const supportedUrls = allUrls.filter((u) => SHOTSTACK_SUPPORTED.test(u));
  const dropped = allUrls.length - supportedUrls.length;
  if (dropped > 0) {
    console.warn(
      `[shopifyToProductInput] dropped ${dropped}/${allUrls.length} image(s) with ` +
      `unsupported format (likely .avif/.heic). ${supportedUrls.length} valid remaining.`
    );
  }
  const imageUrls = supportedUrls.slice(0, 5);

  if (imageUrls.length === 0) {
    if (allUrls.length > 0) {
      throw new Error(
        `Product has ${allUrls.length} image(s) but none are in a Shotstack-supported ` +
        `format (jpg/png/webp/gif/bmp/tiff). Avif and Heic are NOT supported. ` +
        `Re-upload at least one image in a supported format and retry.`
      );
    }
    throw new Error('No product images found');
  }

  return {
    productInput: { title: product.title, body_html: description, price, images: imageUrls },
    brandName: product.vendor || 'Your Store',
  };
}

// Reorder images per Gemini's ad-priority ranking. Returns natural order when the
// priority array is missing or length-mismatched (e.g. /api/simulate's geminiImageOverride
// path, where Gemini sees fewer images than the renderer uses).
function reorderByPriority(images: string[], priority: number[] | undefined): string[] {
  if (!priority || priority.length !== images.length) return images;
  const reordered = priority.map((i) => images[i]).filter((url): url is string => !!url);
  return reordered.length === images.length ? reordered : images;
}

// Fill `images` up to 7 slots by cycling through the unique inputs. With 4 inputs
// [a, b, c, d] we get [a, b, c, d, a, b, c] instead of the legacy [a, b, c, d, d, d, d]
// which made 3 consecutive Scene 4-7 frames identical (the user-flagged "sole repeats
// from second 12 onward" bug).
function cyclicPadToSeven(images: string[]): string[] {
  if (images.length === 0) throw new Error('cyclicPadToSeven: empty image list');
  const out = [...images];
  let i = 0;
  while (out.length < 7) {
    out.push(images[i % images.length]);
    i++;
  }
  return out;
}

export async function processProduct(
  product: ShopifyProduct,
  options: ProcessOptions
): Promise<ProcessResult> {
  const { productInput, brandName } = shopifyToProductInput(product);

  const geminiInput: ProductInput = options.geminiImageOverride
    ? { ...productInput, images: [options.geminiImageOverride] }
    : productInput;

  const analysis = await analyzeProduct(geminiInput, options.geminiKey);

  // 1. Reorder by ad-priority. Gemini picks the strongest hero shot for slot 0 and
  //    pushes detail/closeup shots toward the end.
  let unique = reorderByPriority(productInput.images, analysis.image_priority);

  // 2. Optional Nano Banana enhancement. Run on UNIQUE images only (not the padded 7)
  //    so we don't pay 2-3x the cost enhancing duplicates of the same source.
  if (options.enhanceImagesOption) {
    unique = await enhanceImages(unique, analysis.product_category, options.geminiKey);
  }

  // 3. Cycle-pad to 7 slots. Repeats happen at the END of the video (Scenes 6-7) and
  //    cycle from the top, so the visible repetition is the HERO shot — never a sole
  //    closeup three times in a row.
  const finalImages = cyclicPadToSeven(unique);
  const renderInput: ProductInput = { ...productInput, images: finalImages };

  const renderId = await submitRender(
    buildRenderPayload(renderInput, analysis, undefined, brandName)
  );
  const renderIds: string[] = [renderId];

  let pollAndEmailPromise: Promise<void> | undefined;
  if (options.notifyEmail) {
    const email = options.notifyEmail;
    pollAndEmailPromise = pollAndEmail(renderIds, productInput.title, brandName, email).catch(
      (err) => {
        console.error('[processProduct] poll/email task failed:', err);
      }
    );
  }

  return { renderIds, productInput, brandName, analysis, pollAndEmailPromise };
}

const POLL_INTERVAL_MS = 3000;
// Total poll budget must fit inside the webhook route's maxDuration (60s on Vercel),
// leaving headroom for Gemini analysis + Shotstack submit + Resend email send. Cinematic
// Showcase renders typically complete in 20-30s, so 48s is comfortable.
const POLL_MAX_ATTEMPTS = 16; // 48 seconds

async function pollUntilDone(renderId: string): Promise<{ url?: string; error?: string }> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    try {
      const status = await getRenderStatus(renderId);
      if (status.status === 'done') return { url: status.url };
      if (status.status === 'failed') return { error: status.error || 'render failed' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[pollUntilDone ${renderId}] status check failed:`, message);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return { error: 'render timed out after 2 minutes' };
}

async function pollAndEmail(
  renderIds: string[],
  productName: string,
  brandName: string,
  recipient: string
): Promise<void> {
  const results = await Promise.all(renderIds.map(pollUntilDone));
  const okCount = results.filter((r) => r.url).length;
  const total = results.length;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[pollAndEmail] RESEND_API_KEY not set — skipping email send');
    return;
  }

  let subject: string;
  let headline: string;
  let intro: string;

  if (okCount === total) {
    subject = `Your product video is ready — ${productName}`;
    headline = `Your videos are ready, ${brandName}!`;
    intro = `ProductReel automatically generated ${total} video styles for <strong>${productName}</strong>. Pick your favorite and post it to Instagram, TikTok, or embed it on your product page.`;
  } else if (okCount === 0) {
    subject = `Could not generate videos — ${productName}`;
    headline = `We couldn't generate your videos, ${brandName}.`;
    intro = `All ${total} renders failed for <strong>${productName}</strong>. The most common cause is image URLs that don't return an image (e.g. a 404 or a redirect). Try again with public, direct image links.`;
  } else {
    subject = `${okCount} of ${total} videos ready — ${productName}`;
    headline = `Some of your videos are ready, ${brandName}.`;
    intro = `ProductReel finished ${okCount} of ${total} renders for <strong>${productName}</strong>. The failed templates are flagged below — usually an image URL issue.`;
  }

  const sections = results.map((r, i) => {
    const label = TEMPLATE_LABELS[i];
    if (r.url) {
      return `<h3 style="margin-top:24px;">🎬 ${label}</h3>
      <a href="${r.url}" style="background:#1A56DB;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">Download Video</a>`;
    }
    return `<h3 style="margin-top:24px;color:#b91c1c;">⚠ ${label}</h3>
      <p style="color:#b91c1c;margin:6px 0 0;">Render failed: ${r.error || 'unknown error'}</p>`;
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:${okCount === 0 ? '#b91c1c' : '#1A56DB'};">${headline}</h2>
      <p>${intro}</p>
      ${sections.join('\n')}
      <hr style="margin:30px 0;border:none;border-top:1px solid #eee;">
      <p style="color:#888;font-size:13px;">Powered by ProductReel × Shotstack API</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: 'ProductReel <onboarding@resend.dev>',
      to: recipient,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[pollAndEmail] resend failed ${res.status}: ${text}`);
    return;
  }

  console.log(`[pollAndEmail] email sent to ${recipient} (${okCount}/${total} ok)`);
}
