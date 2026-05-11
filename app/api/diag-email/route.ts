import { NextRequest, NextResponse } from 'next/server';
import { processProduct, type ShopifyProduct } from '../../../lib/pipeline';

// Diagnostic-only endpoint. Runs the FULL pipeline (Gemini + Shotstack render polling +
// Resend email) SYNCHRONOUSLY and returns detailed timing/error info as JSON. Use to
// distinguish "Vercel killed after() callback" from "Resend/Shotstack/Gemini failed".
//
// curl -X POST https://product-reel.vercel.app/api/diag-email
//
// Returns:
//   { success: true, renderIds, timing: { submitMs, pollAndEmailMs, totalMs },
//     env: { hasGemini, hasShotstack, hasResend, merchantEmail } }
// or
//   { success: false, error, stack, partialTiming }

export const maxDuration = 60;

const DIAG_PRODUCT: ShopifyProduct = {
  id: Date.now(),
  title: 'Diagnostic Email Test',
  body_html: '<p>Synchronous pipeline run to isolate after() vs Resend bug.</p>',
  vendor: 'ExpandCast',
  variants: [{ price: '5.00' }],
  images: [
    {
      src: 'https://cdn.shopify.com/s/files/1/1104/4168/files/TR3MJBW080_SHOE_LEFT_GLOBAL_MENS_TREE_RUNNER_JET_BLACK_WHITE.png',
    },
    {
      src: 'https://cdn.shopify.com/s/files/1/1104/4168/files/TR3MJBW080_SHOE_BACK_GLOBAL_MENS_TREE_RUNNER_JET_BLACK_WHITE.png',
    },
    {
      src: 'https://cdn.shopify.com/s/files/1/1104/4168/files/TR3MJBW080_SHOE_LEFT_GLOBAL_MENS_TREE_RUNNER_JET_BLACK_WHITE.png',
    },
  ],
};

export async function POST(_req: NextRequest) {
  const env = {
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasShotstack: !!process.env.SHOTSTACK_API_KEY,
    hasResend: !!process.env.RESEND_API_KEY,
    resendLength: process.env.RESEND_API_KEY?.length ?? 0,
    merchantEmail: process.env.MERCHANT_EMAIL || '(fallback to josegabrielvilchezc@gmail.com)',
  };

  if (!env.hasGemini) {
    return NextResponse.json({ success: false, error: 'GEMINI_API_KEY missing', env }, { status: 500 });
  }
  if (!env.hasShotstack) {
    return NextResponse.json({ success: false, error: 'SHOTSTACK_API_KEY missing', env }, { status: 500 });
  }

  const t0 = Date.now();
  let submittedAt = 0;

  try {
    const result = await processProduct(DIAG_PRODUCT, {
      geminiKey: process.env.GEMINI_API_KEY!,
      notifyEmail: process.env.MERCHANT_EMAIL || 'josegabrielvilchezc@gmail.com',
    });
    submittedAt = Date.now();

    if (!result.pollAndEmailPromise) {
      return NextResponse.json({
        success: false,
        stage: 'no-poll-promise',
        error: 'processProduct did not return pollAndEmailPromise — notifyEmail must be empty',
        renderIds: result.renderIds,
        timing: { submitMs: submittedAt - t0 },
        env,
      });
    }

    await result.pollAndEmailPromise;
    const completedAt = Date.now();

    return NextResponse.json({
      success: true,
      renderIds: result.renderIds,
      timing: {
        submitMs: submittedAt - t0,
        pollAndEmailMs: completedAt - submittedAt,
        totalMs: completedAt - t0,
      },
      env,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack?.split('\n').slice(0, 6).join('\n') : undefined;
    return NextResponse.json(
      {
        success: false,
        stage: submittedAt === 0 ? 'process-product' : 'poll-and-email',
        error: errorMessage,
        stack,
        partialTiming: {
          submitMs: submittedAt ? submittedAt - t0 : 0,
          elapsedMs: Date.now() - t0,
        },
        env,
      },
      { status: 500 }
    );
  }
}
