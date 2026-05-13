import { NextRequest, NextResponse } from 'next/server';

// Shotstack render completion callback. When a render finishes (or fails),
// Shotstack POSTs the result here so the merchant gets emailed without us
// having to poll inside the original webhook lambda — that polling was
// pushing us past Vercel Hobby's 60s ceiling once Nano Banana actually
// started working. (User-flagged May 12, Lavadora test product.)
//
// Lifecycle:
//   1. /api/webhook submits the render with callback=<this-url>?email=X&product=Y&brand=Z
//      and returns 200 OK to Shopify immediately. No pollAndEmail in that flow.
//   2. Shotstack renders the video (~30-60s).
//   3. Shotstack POSTs here with the render result; we look up the merchant
//      context from the query string and dispatch the Resend email.
//
// We don't HMAC-verify the callback yet — Shotstack's Edit API doesn't expose
// a signing secret in their stage tier docs. For now we trust the source if
// the body has a recognizable render-result shape. Future hardening: store
// renderId → email mapping in Vercel KV at submit time so this handler can
// validate against a known render before sending.
export const maxDuration = 60;

interface ShotstackCallbackBody {
  type?: string;
  action?: string;
  id?: string;
  // Different Shotstack tiers wrap the payload differently. We accept any of:
  //   { id, status, url }                            (top-level)
  //   { response: { id, status, url } }              (older edit API)
  //   { data: { id, attributes: { status, url } } }  (json:api style)
  response?: { id?: string; status?: string; url?: string; error?: string };
  data?: {
    id?: string;
    attributes?: { status?: string; url?: string; source?: string; error?: string };
  };
  status?: string;
  url?: string;
  error?: string;
}

function extractRenderResult(body: ShotstackCallbackBody): {
  renderId?: string;
  status?: string;
  url?: string;
  error?: string;
} {
  // Try every plausible shape; pick whichever has values.
  const fromTop = { renderId: body.id, status: body.status, url: body.url, error: body.error };
  const fromResp = body.response
    ? { renderId: body.response.id, status: body.response.status, url: body.response.url, error: body.response.error }
    : {};
  const fromData = body.data
    ? {
        renderId: body.data.id,
        status: body.data.attributes?.status,
        url: body.data.attributes?.url || body.data.attributes?.source,
        error: body.data.attributes?.error,
      }
    : {};
  return {
    renderId: fromResp.renderId || fromData.renderId || fromTop.renderId,
    status: fromResp.status || fromData.status || fromTop.status,
    url: fromResp.url || fromData.url || fromTop.url,
    error: fromResp.error || fromData.error || fromTop.error,
  };
}

// Resend sandbox restriction: with the unverified `onboarding@resend.dev` FROM,
// Resend only delivers to the email tied to the account that owns the API key.
// Anything else returns 403 with "You can only send testing emails to your own
// email address (X). To send emails to other recipients, please verify a domain
// at resend.com/domains".
// We detect that response and re-send to the OWNER with a forwarded-note banner,
// so the rendered MP4 reaches an inbox we control instead of being lost. The user
// is told upfront in the UI that email delivery is best-effort during the demo.
const RESEND_SANDBOX_OWNER = 'josegabrielvilchezc@gmail.com';

function buildEmailHtml(opts: {
  productName: string;
  brandName: string;
  videoUrl?: string;
  error?: string;
  forwardedFrom?: string;
}): { subject: string; html: string } {
  const success = !!opts.videoUrl;
  const subject = success
    ? `Your product video is ready — ${opts.productName}`
    : `Could not generate video — ${opts.productName}`;
  const headline = success
    ? `Your video is ready, ${opts.brandName}!`
    : `We couldn't generate your video, ${opts.brandName}.`;
  const intro = success
    ? `ProductReel automatically generated a video for <strong>${opts.productName}</strong>. Pick your favorite and post it to Instagram, TikTok, or embed it on your product page.`
    : `The render failed for <strong>${opts.productName}</strong>. ${opts.error || 'Try again with public, direct image links.'}`;
  const cta = success
    ? `<a href="${opts.videoUrl}" style="background:#1A56DB;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">Download Video</a>`
    : `<p style="color:#b91c1c;margin:6px 0 0;">Render failed: ${opts.error || 'unknown error'}</p>`;
  const forwardedBanner = opts.forwardedFrom
    ? `<div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:10px 14px;border-radius:6px;margin-bottom:18px;font-size:13px;">Demo note: this video was requested by <strong>${opts.forwardedFrom}</strong>. Resend sandbox blocked direct delivery to that address, so we routed it here.</div>`
    : '';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      ${forwardedBanner}
      <h2 style="color:${success ? '#1A56DB' : '#b91c1c'};">${headline}</h2>
      <p>${intro}</p>
      <h3 style="margin-top:24px;">🎬 Cinematic Showcase</h3>
      ${cta}
      <hr style="margin:30px 0;border:none;border-top:1px solid #eee;">
      <p style="color:#888;font-size:13px;">Powered by ProductReel × Shotstack API</p>
    </div>
  `;
  return { subject, html };
}

async function postResend(opts: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; status: number; bodyText: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
    body: JSON.stringify({
      from: 'ProductReel <onboarding@resend.dev>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  });
  const bodyText = await res.text();
  return { ok: res.ok, status: res.status, bodyText };
}

async function sendEmail(opts: {
  to: string;
  productName: string;
  brandName: string;
  videoUrl?: string;
  error?: string;
}): Promise<{ ok: boolean; reason?: string; forwarded?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'RESEND_API_KEY not set' };

  const base = buildEmailHtml({
    productName: opts.productName,
    brandName: opts.brandName,
    videoUrl: opts.videoUrl,
    error: opts.error,
  });

  const first = await postResend({ apiKey, to: opts.to, subject: base.subject, html: base.html });
  if (first.ok) return { ok: true };

  const sandboxBlocked = first.status === 403 && /verify a domain|own email address/i.test(first.bodyText);
  if (!sandboxBlocked) {
    return { ok: false, reason: `resend ${first.status}: ${first.bodyText.slice(0, 200)}` };
  }

  const owner = process.env.MERCHANT_EMAIL || RESEND_SANDBOX_OWNER;
  if (opts.to.toLowerCase() === owner.toLowerCase()) {
    return { ok: false, reason: `resend ${first.status} on owner address: ${first.bodyText.slice(0, 200)}` };
  }

  const fallback = buildEmailHtml({
    productName: opts.productName,
    brandName: opts.brandName,
    videoUrl: opts.videoUrl,
    error: opts.error,
    forwardedFrom: opts.to,
  });
  const second = await postResend({
    apiKey, to: owner,
    subject: `[forwarded] ${fallback.subject}`,
    html: fallback.html,
  });
  if (second.ok) return { ok: true, forwarded: owner };
  return { ok: false, reason: `resend retry ${second.status}: ${second.bodyText.slice(0, 200)}` };
}

export async function POST(req: NextRequest) {
  // Aggressive logging FIRST so we see every incoming POST even if parsing fails.
  // Used to diagnose whether Shotstack stage tier even fires callbacks.
  const rawBody = await req.text();
  const headersList: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headersList[key] = value;
  });
  console.log('[shotstack-callback] RAW INCOMING', JSON.stringify({
    url: req.nextUrl.toString(),
    headers: headersList,
    bodyLen: rawBody.length,
    bodyPreview: rawBody.slice(0, 500),
  }));

  let body: ShotstackCallbackBody = {};
  try {
    body = JSON.parse(rawBody) as ShotstackCallbackBody;
  } catch {
    console.warn('[shotstack-callback] body was not JSON, returning 400');
    return NextResponse.json({ error: 'Body must be JSON', received: rawBody.slice(0, 200) }, { status: 400 });
  }

  const result = extractRenderResult(body);
  console.log('[shotstack-callback] parsed', JSON.stringify({ ...result, action: body.action, type: body.type }));

  // Merchant context comes from the query string we set on the callback URL.
  const email = req.nextUrl.searchParams.get('email');
  const productName = req.nextUrl.searchParams.get('product') || 'your product';
  const brandName = req.nextUrl.searchParams.get('brand') || 'your store';

  if (!email) {
    // No email param means we can't deliver to anyone; ack so Shotstack doesn't retry.
    console.warn('[shotstack-callback] no email in query string, skipping send');
    return NextResponse.json({ ok: true, skipped: 'no email' });
  }

  // Only fire emails on terminal states. Shotstack pings on intermediate
  // status changes (rendering/fetching/saving) — ignore those.
  if (result.status !== 'done' && result.status !== 'failed') {
    console.log(`[shotstack-callback] non-terminal status "${result.status}", ignoring`);
    return NextResponse.json({ ok: true, skipped: `status ${result.status}` });
  }

  const send = await sendEmail({
    to: email,
    productName,
    brandName,
    videoUrl: result.status === 'done' ? result.url : undefined,
    error: result.status === 'failed' ? result.error : undefined,
  });

  // Always 200 to Shotstack, regardless of email outcome — a 500 here triggers
  // Shotstack to retry the callback aggressively (we saw 5-10 retries per render
  // before this fix), which spams the logs and doesn't help anything. The render
  // MP4 is already available via /api/status/<renderId> on the calling lambda.
  if (!send.ok) {
    console.error('[shotstack-callback] email send failed:', send.reason);
    return NextResponse.json({ ok: true, emailDelivered: false, reason: send.reason });
  }

  if (send.forwarded) {
    console.warn(`[shotstack-callback] sandbox blocked ${email}; forwarded to ${send.forwarded} for render ${result.renderId}`);
    return NextResponse.json({ ok: true, emailDelivered: true, forwardedTo: send.forwarded });
  }

  console.log(`[shotstack-callback] email sent to ${email} for render ${result.renderId} (${result.status})`);
  return NextResponse.json({ ok: true, emailDelivered: true });
}
