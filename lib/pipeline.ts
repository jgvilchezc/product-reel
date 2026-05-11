import { analyzeProduct, type ProductInput, type GeminiAnalysis } from './gemini';
import {
  buildRenderPayload,
  // buildBoldEnergyPayload, buildCleanMinimalPayload — kept in shotstack.ts for re-enable later
  submitRender,
  getRenderStatus,
} from './shotstack';

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
}

export interface ProcessResult {
  renderIds: string[];
  productInput: ProductInput;
  brandName: string;
  analysis: GeminiAnalysis;
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

  // Cinematic Showcase uses up to 7 images; Bold Energy & Clean Minimal cap at 5 internally.
  const imageUrls = (product.images || [])
    .map((i) => i.src)
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
    .slice(0, 7);

  if (imageUrls.length === 0) {
    throw new Error('No product images found');
  }
  while (imageUrls.length < 7) {
    imageUrls.push(imageUrls[imageUrls.length - 1]);
  }

  return {
    productInput: { title: product.title, body_html: description, price, images: imageUrls },
    brandName: product.vendor || 'Your Store',
  };
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

  const renderId = await submitRender(
    buildRenderPayload(productInput, analysis, undefined, brandName)
  );
  const renderIds: string[] = [renderId];

  if (options.notifyEmail) {
    const email = options.notifyEmail;
    void pollAndEmail(renderIds, productInput.title, brandName, email).catch((err) => {
      console.error('[processProduct] poll/email task failed:', err);
    });
  }

  return { renderIds, productInput, brandName, analysis };
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
    console.log('[pollAndEmail] would have sent:', { recipient, productName, results });
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
