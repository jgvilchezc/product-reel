'use client';

import { useState, useRef } from 'react';

type DemoState = 'idle' | 'submitting' | 'rendering' | 'done' | 'error';

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued...',
  fetching: 'Fetching assets...',
  rendering: 'Rendering video...',
  saving: 'Saving...',
  done: 'Done!',
  failed: 'Failed',
};

export default function Home() {
  const [geminiKey, setGeminiKey] = useState('');
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [renderStatus, setRenderStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function handleDemo() {
    if (demoState === 'rendering' || demoState === 'submitting') return;

    setDemoState('submitting');
    setErrorMsg('');
    setVideoUrl('');
    setRenderStatus('');
    setElapsed(0);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiKey: geminiKey.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok || !data.renderId) {
        throw new Error(data.error || 'Failed to start render');
      }

      setDemoState('rendering');
      startPolling(data.renderId);
    } catch (err) {
      setDemoState('error');
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  function startPolling(renderId: string) {
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${renderId}`);
        const data = await res.json();
        setRenderStatus(data.status);

        if (data.status === 'done' && data.url) {
          stopPolling();
          setVideoUrl(data.url);
          setDemoState('done');
        } else if (data.status === 'failed') {
          stopPolling();
          setDemoState('error');
          setErrorMsg(data.error || 'Render failed');
        }
      } catch {
        // transient network error — keep polling
      }
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium tracking-wide">
            Powered by Shotstack + Gemini AI
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Every product you upload<br />
            <span className="text-blue-400">gets a video. Automatically.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Connect your Shopify store once. Every new product triggers an AI-generated
            advertising video — professional voiceover, lifestyle background, animated text —
            delivered in under 2 minutes.
          </p>
          <a
            href="#demo"
            className="inline-block px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-colors"
          >
            Try the demo →
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload your product',
                desc: 'Add a product to Shopify as you normally would. ProductReel listens via webhook — nothing extra needed.',
              },
              {
                step: '02',
                title: 'AI generates the video',
                desc: 'Gemini analyzes your product images and writes the ad script. Shotstack renders the MP4 with TTS voiceover, lifestyle background, and animated text.',
              },
              {
                step: '03',
                title: 'Video is ready',
                desc: 'Your professional 20-second product ad is ready to download and share on any platform.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="text-4xl font-black text-blue-500/40">{step}</span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Try the demo</h2>
          <p className="text-gray-400 text-center mb-10">
            Generates a real Air Jordan 1 product video end-to-end. Takes ~60 seconds.
          </p>

          <div className="bg-gray-900 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gemini API Key{' '}
                <span className="text-gray-500 font-normal">(optional if set server-side)</span>
              </label>
              <input
                type="password"
                placeholder="AIza..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                disabled={demoState === 'submitting' || demoState === 'rendering'}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleDemo}
              disabled={demoState === 'submitting' || demoState === 'rendering'}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors"
            >
              {demoState === 'submitting' && 'Starting pipeline...'}
              {demoState === 'rendering' && `Rendering... ${elapsed}s`}
              {(demoState === 'idle' || demoState === 'done' || demoState === 'error') &&
                'Generate demo video'}
            </button>

            {demoState === 'rendering' && (
              <div className="flex flex-col gap-3">
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 90) * 100, 95)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  {STATUS_LABELS[renderStatus] ?? 'Processing...'} — {elapsed}s elapsed
                </p>
              </div>
            )}

            {demoState === 'done' && videoUrl && (
              <div className="flex flex-col gap-4">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full rounded-xl bg-black"
                />
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center py-3 rounded-xl border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors font-medium"
                >
                  Download MP4 ↗
                </a>
              </div>
            )}

            {demoState === 'error' && errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Setup instructions */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14">
            Connect your Shopify store in 3 minutes
          </h2>
          <ol className="flex flex-col gap-8">
            {[
              {
                n: 1,
                title: 'Deploy ProductReel to Vercel',
                body: 'Fork this repo, click Deploy to Vercel, and set your environment variables: SHOTSTACK_API_KEY and GEMINI_API_KEY.',
              },
              {
                n: 2,
                title: 'Add the webhook in Shopify',
                body: 'Go to Shopify Admin → Settings → Notifications → Webhooks → Create webhook. Select "Product creation" and enter your Vercel URL: https://your-app.vercel.app/api/webhook',
              },
              {
                n: 3,
                title: 'Upload a product and watch the magic',
                body: 'Add any product to your Shopify store. Within 2 minutes a professional advertising video is generated automatically.',
              },
            ].map(({ n, title, body }) => (
              <li key={n} className="flex gap-6">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                  {n}
                </span>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Early access CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Get early access</h2>
          <p className="text-gray-400 mb-8">
            Be the first to know when ProductReel launches on the Shopify App Store.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
              if (input.value) {
                input.value = '';
                alert("Thanks! We'll be in touch.");
              }
            }}
            className="flex gap-3"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-colors"
            >
              Notify me
            </button>
          </form>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-gray-800 text-center text-gray-600 text-sm">
        ProductReel — Automated product videos for Shopify merchants
      </footer>
    </main>
  );
}
