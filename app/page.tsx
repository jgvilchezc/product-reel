'use client';

import { useState, useRef, useEffect, ReactNode, FC } from 'react';

// ── Icon primitives ────────────────────────────────────────────
interface IconProps { size?: number; className?: string; }
type IconFC = FC<IconProps>;

const Icon = ({ children, size = 18, className = '' }: IconProps & { children: ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       className={`lucide ${className}`} stroke="currentColor" aria-hidden="true">
    {children}
  </svg>
);

const IPlay:     IconFC = (p) => <Icon {...p}><path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/></Icon>;
const IArrow:    IconFC = (p) => <Icon {...p}><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></Icon>;
const ICheck:    IconFC = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const ISpark:    IconFC = (p) => <Icon {...p}><path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/><path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z"/></Icon>;
const IUpload:   IconFC = (p) => <Icon {...p}><path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.4 14.5A5 5 0 0 0 18 5a7 7 0 0 0-13.4 2A4.5 4.5 0 0 0 6 16h2"/></Icon>;
const IWand:     IconFC = (p) => <Icon {...p}><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2L19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2L11 5"/></Icon>;
const ILayers:   IconFC = (p) => <Icon {...p}><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></Icon>;
const IDownload: IconFC = (p) => <Icon {...p}><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></Icon>;
const ILock:     IconFC = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>;
const IEye:      IconFC = (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>;
const IEyeOff:   IconFC = (p) => <Icon {...p}><path d="M3 3l18 18"/><path d="M10.6 6.1A10.4 10.4 0 0 1 12 6c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.2 4"/><path d="M6.5 7.6A17.5 17.5 0 0 0 2 13s3.5 7 10 7c1.4 0 2.7-.3 3.9-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></Icon>;
const IShop:     IconFC = (p) => <Icon {...p}><path d="M5 7h14l-1.2 12.1A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.9L5 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></Icon>;
const ISend:     IconFC = (p) => <Icon {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Icon>;
const IGithub:   IconFC = (p) => <Icon {...p}><path d="M9 19c-4 1.2-4-2-6-2.5"/><path d="M15 21v-3.5a3 3 0 0 0-.9-2.3c2.97-.33 6.1-1.46 6.1-6.59A5.1 5.1 0 0 0 18.6 4.6a4.7 4.7 0 0 0-.1-3.5s-1.1-.34-3.5 1.3a12 12 0 0 0-6 0C6.6.76 5.5 1.1 5.5 1.1a4.7 4.7 0 0 0-.1 3.5A5.1 5.1 0 0 0 4 8.62c0 5.1 3.13 6.26 6.1 6.59a3 3 0 0 0-.9 2.3V21"/></Icon>;
const ITerminal: IconFC = (p) => <Icon {...p}><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></Icon>;
const ICloud:    IconFC = (p) => <Icon {...p}><path d="M17 18a4 4 0 0 0 .6-7.95A6 6 0 1 0 6 12c0 .3 0 .6.07.9A4 4 0 0 0 7 18z"/></Icon>;
const ILink:     IconFC = (p) => <Icon {...p}><path d="M9 17H7a5 5 0 0 1 0-10h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><path d="M8 12h8"/></Icon>;
const IRefresh:  IconFC = (p) => <Icon {...p}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></Icon>;
const IPause:    IconFC = (p) => <Icon {...p}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></Icon>;
const IClock:    IconFC = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IMessage:  IconFC = (p) => <Icon {...p}><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 0 1 8-8h2a8 8 0 0 1 8 7z"/></Icon>;
const IBolt:     IconFC = (p) => <Icon {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="none"/></Icon>;
const IMoon:     IconFC = (p) => <Icon {...p}><path d="M21 12.8A8 8 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z"/></Icon>;
const IBook:     IconFC = (p) => <Icon {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M4 19.5V21h16"/></Icon>;
const ICopy:     IconFC = (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>;

// ── Shared ─────────────────────────────────────────────────────
const SectionEyebrow = ({ children, icon }: { children: ReactNode; icon: ReactNode }) => (
  <div className="inline-flex items-center gap-2 text-[11.5px] font-mono uppercase tracking-[0.2em] text-brand-soft">
    {icon} {children}
  </div>
);

// ── NAVBAR ─────────────────────────────────────────────────────
const Navbar = () => (
  <header className="sticky top-0 z-50 bg-ink/70 backdrop-blur-xl border-b border-line">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#top" className="flex items-center gap-2">
        <span className="relative w-6 h-6 rounded-md bg-gradient-to-br from-brand to-violet flex items-center justify-center">
          <IPlay size={11} className="translate-x-[1px] text-white"/>
          <span className="absolute -inset-0.5 rounded-md bg-brand/40 blur-md -z-10"/>
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight text-white">ProductReel</span>
      </a>
      <nav className="flex items-center gap-1 sm:gap-2">
        <a href="#how-it-works" className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">How it works</a>
        <a href="#scrape"       className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">Scrape</a>
        <a href="#quality"      className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">Quality</a>
        <a href="#connect"      className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">Connect</a>
        <a href="#chat"         className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">AI Director</a>
        <a href="#setup"        className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">Setup</a>
        <a href="#demo"         className="text-[13px] text-white/85 hover:text-white px-3 py-2 rounded-lg border border-line hover:border-line2 transition-colors">View demo</a>
        <a href="#backfill"     className="text-[13px] font-medium text-white bg-brand hover:bg-brand-hover px-3.5 py-2 rounded-lg shadow-glow-sm hover:shadow-glow transition-all">Backfill catalog</a>
      </nav>
    </div>
  </header>
);

// ── HERO ───────────────────────────────────────────────────────
const MiniReel = ({ label, accent, live }: { label: string; accent: string; live: boolean }) => (
  <div className={`relative rounded-lg overflow-hidden ${live ? 'live-border' : 'border border-line'}`}>
    <div className="relative rounded-[7px] overflow-hidden bg-[#0a0b10]">
      <div className="aspect-[9/14] relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-30`}/>
        <div className="absolute inset-0 stripes-b opacity-30"/>
        <div className="absolute inset-0 scanlines opacity-50"/>
        <div className="absolute inset-x-0 bottom-0 p-2">
          <div className="text-[10px] font-mono text-white/65 uppercase tracking-[0.18em]">{label}</div>
          <div className="mt-1 h-0.5 rounded-full bg-white/15 overflow-hidden">
            <div className={`h-full bg-white/80 ${live ? 'shimmer-bg' : ''}`} style={{ width: live ? '34%' : '12%' }}/>
          </div>
        </div>
        {live && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 text-[9.5px] font-mono uppercase text-white/85">
            <span className="w-1.5 h-1.5 rounded-full bg-rose"/>playing
          </div>
        )}
      </div>
    </div>
  </div>
);

const HeroShowcase = () => (
  <div className="relative">
    <div className="absolute -inset-6 rounded-[28px] pointer-events-none"
         style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(61,123,255,0.25), transparent 70%)', filter: 'blur(40px)' }}/>
    <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-4 sm:gap-5 rounded-2xl border border-line bg-card/80 backdrop-blur p-3 sm:p-4 shadow-glow">
      <div className="relative rounded-xl border border-line bg-panel overflow-hidden">
        <div className="px-3 h-9 border-b border-line flex items-center gap-2 bg-[#0a0b10]">
          <IShop size={13} className="text-white/50"/>
          <span className="font-mono text-[11px] text-white/45">shopify · product.created</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-mono text-ok/90">
            <span className="w-1.5 h-1.5 rounded-full bg-ok"/>webhook
          </span>
        </div>
        <div className="aspect-square relative">
          <div className="absolute inset-0 stripes-a opacity-40"/>
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-3/5 aspect-square rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 floaty grid place-items-center">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35">product image</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2.5 border-t border-line flex items-center justify-between">
          <div className="text-[12.5px] text-white/80">Air Jordan 1 Retro</div>
          <div className="text-[12px] font-mono text-white/45">$180</div>
        </div>
      </div>
      <div className="relative rounded-xl border border-line bg-panel overflow-hidden">
        <div className="px-3 h-9 border-b border-line flex items-center gap-2 bg-[#0a0b10]">
          <ISpark size={13} className="text-violet-soft"/>
          <span className="font-mono text-[11px] text-white/45">productreel · 3 reels rendered · 47s</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-mono text-brand-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-soft animate-pulse"/>live
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {([
            { label: 'Bold & Dynamic',  accent: 'from-rose to-amber',        live: false },
            { label: 'Clean & Minimal', accent: 'from-white/40 to-white/10', live: true  },
            { label: 'Story Mode',      accent: 'from-brand to-violet',      live: false },
          ] as const).map((r, i) => <MiniReel key={i} {...r}/>)}
        </div>
      </div>
    </div>
  </div>
);

const LogoStrip = () => (
  <div className="mt-14 sm:mt-16">
    <div className="text-center text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/35">
      Built for Shopify merchants of every size
    </div>
    <div className="mt-5 relative overflow-hidden">
      <div className="flex gap-12 marquee-track whitespace-nowrap text-white/35 font-display text-lg">
        {Array.from({ length: 2 }).flatMap((_, k) =>
          ['Maverick Goods', 'Atelier 24', 'Hummingbird Co.', 'North Range', 'Studio Echo', 'Pomelo', 'Half Moon', 'Saltwood'].map((n, i) => (
            <span key={`${k}-${i}`} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/20"/>{n}
            </span>
          ))
        )}
      </div>
    </div>
  </div>
);

const Hero = () => (
  <section id="top" className="relative overflow-hidden">
    <div className="absolute inset-0 hero-grain pointer-events-none"/>
    <div className="absolute inset-0 grid-bg pointer-events-none"/>
    <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-12 sm:pt-32 sm:pb-20">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet/40 bg-violet/10 backdrop-blur px-3 py-1 text-[12px] font-medium text-violet-soft">
          <ISpark size={12}/> Gemini Vision · Shotstack render pipeline
        </div>
      </div>
      <h1 className="mt-7 text-center font-display font-bold tracking-[-0.02em] text-white text-[44px] leading-[1.02] sm:text-6xl md:text-[80px] md:leading-[0.98]">
        <span className="block">Every product you upload</span>
        <span className="block text-gradient">gets a video. Automatically.</span>
      </h1>
      <p className="mt-7 mx-auto max-w-2xl text-center text-[15px] sm:text-[17px] text-white/55 leading-relaxed">
        Connect your Shopify store once. The next time you add a product, we ship a 36-second
        cinematic ad to your inbox. You go back to running your store.
      </p>
      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="#demo" className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-[14.5px] font-medium px-5 py-3 rounded-lg shadow-glow ring-1 ring-brand/40 transition-all">
          Try the demo <IArrow size={16} className="transition-transform group-hover:translate-x-0.5"/>
        </a>
        <a href="#how-it-works" className="inline-flex items-center gap-2 text-white/85 hover:text-white text-[14.5px] font-medium px-5 py-3 rounded-lg border border-line hover:border-line2 hover:bg-white/[0.02] transition-all">
          <IPlay size={13}/> 90-second tour
        </a>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-white/45">
        {['No credit card required', 'First 10 videos free', 'Setup in 3 minutes'].map(t => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <ICheck size={13} className="text-brand-soft"/> {t}
          </span>
        ))}
      </div>
      <div className="mt-16 sm:mt-20 mx-auto max-w-5xl"><HeroShowcase/></div>
      <LogoStrip/>
    </div>
  </section>
);

// ── HOW IT WORKS ───────────────────────────────────────────────
interface StepData { n: string; I: IconFC; title: string; body: string; }

const StepCard = ({ step: { n, I, title, body } }: { step: StepData }) => (
  <div className="group relative rounded-2xl border border-line bg-card p-6 sm:p-7 card-hover overflow-hidden">
    <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
         style={{ background: 'radial-gradient(closest-side, rgba(61,123,255,0.18), transparent)' }}/>
    <div className="relative flex items-center justify-between">
      <span className="font-mono text-[11px] tracking-widest text-white/35">{n}</span>
      <div className="w-9 h-9 rounded-lg border border-line bg-[#0E0F14] grid place-items-center text-brand-soft group-hover:border-brand/40 transition-colors">
        <I size={17}/>
      </div>
    </div>
    <h3 className="relative mt-8 font-display text-lg font-semibold text-white tracking-tight">{title}</h3>
    <p className="relative mt-2 text-[14px] leading-relaxed text-white/55">{body}</p>
  </div>
);

const HowItWorks = () => {
  const steps: StepData[] = [
    { n: '01', I: IUpload, title: 'Upload your product',
      body: 'Add a product to your Shopify store like you always do. The webhook fires the moment you hit save.' },
    { n: '02', I: IWand,   title: 'Gemini reads, Shotstack renders',
      body: 'Gemini analyzes the photos and writes the on-screen copy. Shotstack renders a 36-second cut at 1080p while you go make coffee.' },
    { n: '03', I: ILayers, title: 'Email lands. Done.',
      body: 'The finished MP4 shows up in your inbox in under a minute. Post it, embed it on the PDP, or describe what to change and let the Director re-cut it.' },
  ];
  return (
    <section id="how-it-works" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <SectionEyebrow icon={<ICheck size={12}/>}>How it works</SectionEyebrow>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl">
          From product upload to <span className="text-gradient-violet">finished ad</span> in under 60 seconds.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {steps.map(s => <StepCard key={s.n} step={s}/>)}
        </div>
      </div>
    </section>
  );
};

// ── DEMO SECTION ───────────────────────────────────────────────
interface TemplateConfig {
  id: string; label: string; tagline: string; palette: string[];
  accent: string; bg: string; duration: string; voice: string;
}

// Bold Energy + Clean Minimal kept in shotstack.ts/pipeline.ts but hidden from the demo UI
// while we focus on Cinematic Showcase + Shopify automation. Re-add to this array to restore.
const TEMPLATES: TemplateConfig[] = [
  { id: 'cinematicShowcase', label: 'Cinematic Showcase', tagline: 'Kinetic typography, luma transitions, accent panels — full-frame product reveal.',
    palette: ['#000000','#d96657','#FFFFFF'], accent: 'from-rose/40 to-rose/5',
    bg: 'from-rose/20 via-rose/5 to-transparent', duration: '00:36', voice: 'Music · Cinematic' },
];

type DemoStep = 'input' | 'rendering' | 'picker';
const STATUS_PROGRESS: Record<string, number> = { queued: 5, fetching: 20, rendering: 65, saving: 90, done: 100 };

const DemoInput = ({ onStart, error }: {
  onStart: () => void; error: string;
}) => (
  <div className="grid md:grid-cols-2">
    <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-line bg-[#0E0F14]">
      <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Input</div>
      <h3 className="mt-2 font-display text-2xl font-semibold text-white tracking-tight">Generate a video from one product.</h3>
      <p className="mt-2 text-[14px] text-white/55 max-w-md">
        Sample Nike product, full pipeline end-to-end — Gemini analyzes the imagery, Shotstack renders the Cinematic Showcase template, and the finished MP4 plays right here. No keys, no setup.
      </p>
      {error && <div className="mt-6 px-3 py-2.5 rounded-lg bg-rose/10 border border-rose/30 text-rose text-[12.5px]">{error}</div>}
      <button onClick={onStart}
        className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-3 rounded-lg shadow-glow ring-1 ring-brand/40 transition-all">
        <ISpark size={15}/> Generate video <IArrow size={15}/>
      </button>
      <div className="mt-3 text-[12px] text-white/40">Average run · ~30 seconds · cinematic showcase template</div>
    </div>
    <div className="p-6 sm:p-8 bg-card">
      <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Sample product</div>
      <div className="mt-3 rounded-xl border border-line bg-[#0a0b10] overflow-hidden">
        <div className="aspect-[16/10] relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nike1.jpg" alt="Nike Free Metcon 6" className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"/>
        </div>
        <div className="p-4 border-t border-line flex items-center justify-between">
          <div>
            <div className="text-[14.5px] text-white font-medium">Nike Free Metcon 6</div>
            <div className="text-[12px] text-white/45">Training shoe · Black/White</div>
          </div>
          <div className="text-[15px] font-semibold text-white">$130</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {(['/nike2.jpg', '/nike3.jpg', '/nike4.png', '/nike5.jpg'] as const).map((src, i) => (
          <div key={i} className="aspect-square rounded-lg border border-line bg-[#0a0b10] relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover"/>
            <span className="absolute bottom-1 right-1.5 text-[10px] font-mono text-white/40 drop-shadow">0{i+1}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Logline = ({ status, t, children }: { status: 'ok'|'run'|'err'; t: string; children: ReactNode }) => {
  const dot = status === 'ok' ? 'bg-ok' : status === 'run' ? 'bg-brand-soft animate-pulse' : 'bg-rose';
  return (
    <div className="flex items-center gap-3">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>
      <span className="text-white/35">[{t}]</span>
      <span>{children}</span>
    </div>
  );
};

const RenderingCard = ({ t, pct }: { t: TemplateConfig; pct: number }) => (
  <div className="rounded-xl border border-line bg-[#0a0b10] overflow-hidden">
    <div className="aspect-[9/12] relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${t.bg}`}/>
      <div className="absolute inset-0 stripes-a opacity-30"/>
      <div className="absolute inset-0 scanlines opacity-50"/>
      <div className="absolute inset-x-3 bottom-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/65">{t.label}</div>
        <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-white/85 transition-[width]" style={{ width: `${pct}%` }}/>
          <div className="absolute inset-0 shimmer-bg"/>
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-mono text-white/45">
          <span>{Math.round(pct)}%</span><span>shotstack · 1080p</span>
        </div>
      </div>
      <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase text-white/65">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-soft animate-pulse"/>rendering
      </div>
    </div>
  </div>
);

const fmtTime = (s: number) =>
  `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

const DemoRendering = ({ progress, elapsed, onCancel }: { progress: number[]; elapsed: number; onCancel: () => void }) => {
  const active = progress.filter((p) => p > 0).length || progress.length || 1;
  const total = progress.reduce((a, b) => a + (b || 0), 0) / active;
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-brand-soft animate-ping opacity-60"/>
            <span className="relative w-2.5 h-2.5 rounded-full bg-brand-soft"/>
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-white shimmer-text">Rendering your video...</h3>
        </div>
        <div className="flex items-center gap-3 text-[12.5px] font-mono">
          <span className="inline-flex items-center gap-1.5 text-white/55"><IClock size={13}/> {fmtTime(elapsed)} elapsed</span>
          <button onClick={onCancel} className="text-white/55 hover:text-white px-2.5 py-1.5 rounded-md border border-line hover:border-line2">Cancel</button>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-line bg-[#0a0b10] p-4">
        <div className="flex items-center justify-between text-[12px] font-mono text-white/45">
          <span>Master pipeline</span><span>{Math.round(total)}%</span>
        </div>
        <div className="mt-2 relative h-2 rounded-full bg-white/8 overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-violet" style={{ width: `${total}%` }}/>
          <div className="absolute inset-0 shimmer-bg mix-blend-screen opacity-80"/>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {TEMPLATES.map((t,i) => <RenderingCard key={t.id} t={t} pct={progress[i]}/>)}
      </div>
      <div className="mt-5 rounded-xl border border-line bg-[#0a0b10] overflow-hidden">
        <div className="px-4 h-9 border-b border-line flex items-center gap-2">
          <ITerminal size={13} className="text-white/45"/>
          <span className="font-mono text-[11px] text-white/45">render.log</span>
        </div>
        <div className="p-4 font-mono text-[11.5px] leading-6 text-white/55 max-h-44 overflow-hidden">
          <Logline status="ok"  t="00:00.4">sample product loaded · 5 photos</Logline>
          <Logline status="ok"  t="00:02.1">gemini-2.5-flash · image + product data analyzed</Logline>
          <Logline status="ok"  t="00:02.9">spec, features, upgrades drafted</Logline>
          <Logline status="run" t="00:03.0">shotstack · cinematic-showcase · queued</Logline>
          <Logline status="run" t="00:04.6">shotstack · render · 1080p</Logline>
        </div>
      </div>
    </div>
  );
};

const MetaPill = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between rounded-lg border border-line bg-[#0a0b10] px-3 py-2">
    <span className="font-mono text-white/40 uppercase tracking-widest text-[10.5px]">{k}</span>
    <span className="text-white/80">{v}</span>
  </div>
);

const VideoModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md"/>
    <div className="relative z-10 w-full max-w-5xl" onClick={e => e.stopPropagation()}>
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <video src={url} controls autoPlay className="w-full aspect-video bg-black block"/>
      </div>
      <button onClick={onClose}
        className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-card border border-line grid place-items-center text-white/60 hover:text-white hover:border-line2 transition-colors shadow-lg">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1l12 12M13 1L1 13"/>
        </svg>
      </button>
      <a href={url} download className="mt-4 flex items-center justify-center gap-2 text-[13px] text-white/55 hover:text-white transition-colors">
        <IDownload size={14}/> Download MP4
      </a>
    </div>
  </div>
);

const ReelCard = ({ t, live, onSelect, onExpand, videoUrl, renderError }: {
  t: TemplateConfig; live: boolean; onSelect: () => void; onExpand?: () => void; videoUrl?: string; renderError?: string;
}) => (
  <div className={`group relative rounded-2xl z-0 ${live ? 'live-border' : ''}`}>
    <div className={`relative rounded-2xl overflow-hidden border ${live ? 'border-transparent' : 'border-line'} bg-card card-hover`}>
      <div className="relative aspect-[9/13]">
        {videoUrl ? (
          <video src={videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"/>
        ) : renderError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-rose/10 p-4">
            <span className="text-rose text-[11.5px] font-mono text-center leading-relaxed">{renderError}</span>
          </div>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${t.bg}`}/>
            <div className="absolute inset-0 stripes-a opacity-25"/>
            <div className="absolute inset-0 scanlines opacity-40"/>
            {live && <div className="absolute inset-0 stage-sweep"/>}
          </>
        )}
        <div className="absolute inset-0 grid place-items-center">
          <button onClick={videoUrl && onExpand ? onExpand : onSelect} aria-label="Play"
            className={`relative w-14 h-14 rounded-full grid place-items-center transition-transform group-hover:scale-105 ring-1 ring-white/15 ${live ? 'bg-white text-ink' : 'bg-white/10 backdrop-blur text-white border border-white/20'}`}>
            {videoUrl ? <IPlay size={18} className="translate-x-[1px]"/> : live ? <IPause size={18}/> : <IPlay size={18} className="translate-x-[1px]"/>}
            {live && <span className="absolute -inset-1 rounded-full bg-white/20 blur-md -z-10"/>}
          </button>
        </div>
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/45 backdrop-blur border border-white/10 text-[10.5px] font-mono uppercase tracking-[0.18em] text-white/85">
            {t.label}
          </span>
          {live && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose/20 border border-rose/40 text-[10.5px] font-mono uppercase tracking-[0.18em] text-rose">
              <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse"/>live
            </span>
          )}
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-white/75">
            <span>00:00</span>
            <div className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-white/85" style={{ width: live ? '32%' : '0%' }}/>
            </div>
            <span className="text-white/45">{t.duration}</span>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5 border-t border-line">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[15px] font-semibold text-white tracking-tight">{t.label}</div>
            <div className="mt-1 text-[12.5px] text-white/55">{t.tagline}</div>
          </div>
          <div className="flex items-center gap-1">
            {t.palette.map((c,i) => <span key={i} className="w-3 h-3 rounded-full border border-white/15" style={{ backgroundColor: c }}/>)}
          </div>
        </div>
        <div className="mt-3 text-[11.5px] font-mono text-white/40">VOICE · {t.voice}</div>
        <div className="mt-4 flex items-center gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-[13px] font-medium px-3 py-2.5 rounded-lg shadow-glow-sm ring-1 ring-brand/40 transition-all">
            <ICheck size={14}/> Use this one
          </button>
          {videoUrl ? (
            <a href={videoUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-[13px] text-white/85 hover:text-white px-3 py-2.5 rounded-lg border border-line hover:border-line2 transition-colors">
              <IDownload size={14}/> MP4
            </a>
          ) : (
            <button className="inline-flex items-center justify-center gap-1.5 text-[13px] text-white/85 hover:text-white px-3 py-2.5 rounded-lg border border-line hover:border-line2 transition-colors">
              <IDownload size={14}/> MP4
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const DemoPicker = ({ activeReel, setActiveReel, onAgain, videoUrls, renderErrors, onExpand }: {
  activeReel: string; setActiveReel: (id: string) => void; onAgain: () => void;
  videoUrls: string[]; renderErrors: string[]; onExpand: (url: string) => void;
}) => (
  <div className="p-6 sm:p-8">
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-ok/90">
          <ICheck size={12}/> Render complete
        </div>
        <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">Your video is ready.</h3>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onAgain} className="inline-flex items-center gap-1.5 text-[12.5px] text-white/65 hover:text-white px-3 py-2 rounded-md border border-line hover:border-line2">
          <IRefresh size={13}/> Run again
        </button>
        <a href="#chat" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white px-3 py-2 rounded-md bg-violet/15 border border-violet/40 hover:bg-violet/25 transition-colors">
          <IMessage size={13}/> None of these? Describe your vision <IArrow size={13}/>
        </a>
      </div>
    </div>
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      {TEMPLATES.map((t, i) => (
        <ReelCard key={t.id} t={t} live={activeReel===t.id} onSelect={() => setActiveReel(t.id)}
          onExpand={videoUrls[i] ? () => onExpand(videoUrls[i]) : undefined}
          videoUrl={videoUrls[i] || undefined}
          renderError={renderErrors[i] || undefined}/>
      ))}
    </div>
    <div className="mt-6 grid sm:grid-cols-3 gap-3 text-[12.5px]">
      <MetaPill k="Source"   v="1 product · 5 photos"/>
      <MetaPill k="Pipeline" v="Gemini → Shotstack → email"/>
      <MetaPill k="Output"   v="1080p · 36s · MP4"/>
    </div>
  </div>
);

const DemoStepper = ({ step, onJump }: { step: DemoStep; onJump: (s: DemoStep) => void }) => (
  <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-line bg-panel">
    {(['input','rendering','picker'] as DemoStep[]).map((id,i) => (
      <button key={id} type="button" onClick={() => onJump(id)}
        className={`px-3 py-1.5 rounded-lg text-[12.5px] font-mono transition-colors ${step===id ? 'bg-brand/15 text-white border border-brand/40' : 'text-white/55 hover:text-white border border-transparent'}`}>
        {String.fromCharCode(65+i)} · {id.charAt(0).toUpperCase()+id.slice(1)}
      </button>
    ))}
  </div>
);

const DemoSection = () => {
  const [step, setStep]             = useState<DemoStep>('input');
  const [progress, setProgress]     = useState([0,0,0]);
  const [elapsed, setElapsed]       = useState(0);
  const [activeReel, setActiveReel] = useState('cinematicShowcase');
  const [videoUrls, setVideoUrls]   = useState(['','','']);
  const [renderErrors, setRenderErrors] = useState(['','','']);
  const [error, setError]           = useState('');
  const [modalUrl, setModalUrl]     = useState('');
  const pollRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const stopAll = () => {
    if (pollRef.current)  { clearInterval(pollRef.current);  pollRef.current  = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => stopAll(), []);

  const start = async () => {
    stopAll();
    setStep('rendering'); setProgress([0,0,0]); setElapsed(0); setError('');
    setVideoUrls(['','','']); setRenderErrors(['','','']);
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed((Date.now()-t0)/1000), 100);

    try {
      const res  = await fetch('/api/simulate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.renderIds) throw new Error(data.error || 'Failed to start render');

      const ids: string[] = data.renderIds;

      pollRef.current = setInterval(async () => {
        try {
          const results = await Promise.allSettled(
            ids.map(id => fetch(`/api/status/${id}`).then(r => r.json()))
          );

          setProgress(results.map(r =>
            r.status === 'fulfilled' ? (STATUS_PROGRESS[r.value.status] ?? 5) : 5
          ));

          const allSettled = results.every(r =>
            r.status === 'fulfilled' && (r.value.status === 'done' || r.value.status === 'failed')
          );

          if (allSettled) {
            const newUrls = results.map(r =>
              r.status === 'fulfilled' && r.value.status === 'done' ? (r.value.url ?? '') : ''
            );
            const newErrors = results.map(r => {
              if (r.status !== 'fulfilled' || r.value.status !== 'failed') return '';
              const e = r.value.error;
              return typeof e === 'object' ? (e as {message?:string})?.message || 'Render failed' : e || 'Render failed';
            });
            stopAll(); setVideoUrls(newUrls); setRenderErrors(newErrors); setStep('picker');
          }
        } catch { /* keep polling */ }
      }, 3000);
    } catch (err) {
      stopAll(); setError(err instanceof Error ? err.message : String(err)); setStep('input');
    }
  };

  const reset = () => { stopAll(); setStep('input'); setProgress([0,0,0]); setElapsed(0); setVideoUrls(['','','']); setRenderErrors(['','','']); setError(''); };
  const handleJump = (s: DemoStep) => { stopAll(); setStep(s); if (s==='rendering') { setProgress([18,42,8]); setElapsed(2.4); } };

  return (
    <>
    <section id="demo" className="relative border-t border-line">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(60% 50% at 50% 0%,rgba(61,123,255,0.18),transparent 60%),radial-gradient(40% 40% at 80% 30%,rgba(124,92,255,0.12),transparent 60%)' }}/>
      <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <SectionEyebrow icon={<IBolt size={12}/>}>Live demo</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl">
              Watch one product become <span className="text-gradient">a cinematic ad</span>.
            </h2>
            <p className="mt-4 text-white/55 max-w-xl">Real Shopify-style run. One product, the same pipeline a paying merchant gets. Watch it actually render.</p>
          </div>
          <DemoStepper step={step} onJump={handleJump}/>
        </div>
        <div className="relative mt-10">
          <div className="absolute -inset-1 rounded-[28px] pointer-events-none"
               style={{ background: 'radial-gradient(60% 60% at 50% 50%,rgba(61,123,255,0.22),transparent 70%)', filter: 'blur(40px)' }}/>
          <div className="relative rounded-2xl border border-brand/30 bg-card overflow-hidden shadow-[0_0_60px_rgba(61,123,255,0.18)]">
            <div className="px-4 h-10 border-b border-line bg-[#0A0B10] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="ml-2 font-mono text-[11px] text-white/40">productreel · /demo</span>
              <span className="ml-auto inline-flex items-center gap-2 font-mono text-[10.5px] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-ok"/>POST /api/simulate
              </span>
            </div>
            {step==='input'     && <DemoInput onStart={start} error={error}/>}
            {step==='rendering' && <DemoRendering progress={progress} elapsed={elapsed} onCancel={reset}/>}
            {step==='picker'    && <DemoPicker activeReel={activeReel} setActiveReel={setActiveReel} onAgain={reset} videoUrls={videoUrls} renderErrors={renderErrors} onExpand={setModalUrl}/>}
          </div>
        </div>
      </div>
    </section>
    {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl('')}/>}
    </>
  );
};

// ── AI DIRECTOR CHAT ───────────────────────────────────────────
interface ChatMessage { role: 'ai'|'user'; body: string; }

const INITIAL_MESSAGES: ChatMessage[] = [
  { role: 'ai',   body: "What kind of video are you after? Describe the vibe, drop a reference, anything." },
  { role: 'user', body: "Dark cinematic with a luxury feel. Slow product shots, deep voiceover. Almost like a fragrance ad." },
  { role: 'ai',   body: "Got it. Moody luxury, slow camera, low voice, gold accents. Product stays center-frame. Hit Generate." },
];

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="px-1.5 py-0.5 rounded bg-violet/15 border border-violet/30 text-violet-soft normal-case tracking-normal">#{children}</span>
);

const ChatBubble = ({ role, body }: ChatMessage) => {
  const isAi = role==='ai';
  return (
    <div className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
      <div className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center ${isAi ? 'bg-gradient-to-br from-violet to-brand' : 'bg-white/10 border border-white/15'}`}>
        {isAi ? <ISpark size={14}/> : <span className="text-[11px] font-mono text-white/80">you</span>}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${isAi ? 'bg-[#16122B] border border-violet/30 text-white/90 rounded-tl-md' : 'bg-white/95 text-ink rounded-tr-md'}`}>
        {body}
      </div>
    </div>
  );
};

const ThinkingBubble = () => (
  <div className="flex gap-3">
    <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-brand grid place-items-center"><ISpark size={14}/></div>
    <div className="rounded-2xl px-4 py-3 bg-[#16122B] border border-violet/30 rounded-tl-md inline-flex items-center gap-1.5">
      {[0,120,240].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-soft animate-bounce" style={{ animationDelay: `${d}ms` }}/>)}
    </div>
  </div>
);

const ChatSection = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ready = messages[messages.length-1]?.role==='ai' && messages.length>=3;

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, thinking]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = input.trim(); if (!v) return;
    setMessages(m => [...m, { role: 'user', body: v }]);
    setInput(''); setThinking(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', body: 'Locked in. Hit Generate when you want it.' }]);
      setThinking(false);
    }, 1200);
  };

  return (
    <section id="chat" className="relative border-t border-line chat-surface">
      <div className="absolute inset-0 chat-grid pointer-events-none"/>
      <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-10 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2">
              <SectionEyebrow icon={<IMessage size={12}/>}>AI Director</SectionEyebrow>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet/15 border border-violet/40 text-violet-soft font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse"/>coming soon
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              None of the templates feel right?{' '}
              <span className="text-gradient-violet">Just describe it.</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-md">
              Brief the video like you&apos;d brief a producer. Tell it the mood you want, films it should feel like. The chat below is a mockup right now. The part that actually reads what you wrote and re-cuts the video is what we&apos;re building next.
            </p>
            <ul className="mt-6 space-y-2 text-[13.5px] text-white/65">
              {['Talk like you would to a producer.','Reference moods or films, not effects.','One brief, one re-render. Try again if it misses.'].map(x => (
                <li key={x} className="flex items-start gap-2"><ICheck size={14} className="text-violet-soft mt-0.5"/> {x}</li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-[28px] pointer-events-none"
                 style={{ background: 'radial-gradient(60% 60% at 30% 30%,rgba(124,92,255,0.30),transparent 70%)', filter: 'blur(40px)' }}/>
            <div className="relative rounded-2xl border border-violet/30 bg-[#0F0D1A]/90 backdrop-blur shadow-violet overflow-hidden">
              <div className="px-4 h-11 border-b border-violet/20 flex items-center gap-2 bg-[#0B091A]">
                <span className="w-7 h-7 rounded-md bg-gradient-to-br from-violet to-brand grid place-items-center"><ISpark size={13}/></span>
                <div className="leading-tight">
                  <div className="font-display text-[13.5px] font-semibold text-white">Director</div>
                  <div className="font-mono text-[10.5px] text-violet-soft/80 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ok"/>online · gemini-2.5-flash
                  </div>
                </div>
                <span className="ml-auto font-mono text-[10.5px] text-white/35">/api/director</span>
              </div>
              <div ref={scrollRef} className="px-4 sm:px-6 py-6 max-h-[440px] overflow-y-auto space-y-4">
                {messages.map((m,i) => <ChatBubble key={i} {...m}/>)}
                {thinking && <ThinkingBubble/>}
              </div>
              <form onSubmit={send} className="px-3 sm:px-4 py-3 border-t border-violet/20 bg-[#0B091A]">
                <div className="flex items-end gap-2">
                  <div className="flex-1 rounded-xl bg-[#13102a] border border-violet/30 focus-within:border-violet/60 transition-colors">
                    <textarea rows={1} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder="Describe the mood, pacing, palette..."
                      className="w-full bg-transparent text-[14px] text-white placeholder:text-white/35 px-3.5 py-3 outline-none resize-none"/>
                    <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-mono text-white/35">
                      <div className="inline-flex items-center gap-3"><Tag>moody</Tag><Tag>cinematic</Tag><Tag>slow-motion</Tag></div>
                      <span>↵ to send · ⇧↵ for newline</span>
                    </div>
                  </div>
                  <button type="submit"
                    className="h-11 px-3.5 rounded-xl bg-violet hover:bg-violet-soft hover:text-violet-deep text-white inline-flex items-center gap-2 ring-1 ring-violet/40 shadow-violet transition-colors">
                    <ISend size={15}/>
                  </button>
                </div>
              </form>
              {ready && (
                <div className="px-4 sm:px-6 pb-5 -mt-1">
                  <button className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet to-brand hover:brightness-110 text-white text-[14px] font-medium px-4 py-3 rounded-xl shadow-violet ring-1 ring-violet/40 transition-all">
                    <ISpark size={16}/> Generate custom video <IArrow size={16}/>
                  </button>
                  <div className="mt-2 text-center text-[11.5px] font-mono text-white/40">approx 22s · single cut · matches your brief</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SETUP ──────────────────────────────────────────────────────
interface SetupStepData { n: string; I: IconFC; title: string; body: string; kind: 'cmd'|'url'|'note'; code: string; }

const SetupStepCard = ({ s: { n, I, title, body, kind, code } }: { s: SetupStepData }) => (
  <div className="rounded-2xl border border-line bg-card overflow-hidden card-hover">
    <div className="p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-widest text-white/35">{n}</span>
        <div className="w-9 h-9 rounded-lg border border-line bg-[#0E0F14] grid place-items-center text-brand-soft"><I size={17}/></div>
      </div>
      <h3 className="mt-7 font-display text-lg font-semibold text-white tracking-tight">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-white/55">{body}</p>
    </div>
    <div className="border-t border-line bg-[#0a0b10] px-4 py-3 flex items-center gap-2">
      <span className="font-mono text-[11px] text-white/35">{kind==='cmd'?'$':kind==='url'?'GET':'//'}</span>
      <code className="flex-1 font-mono text-[12px] text-white/80 truncate">{code}</code>
      <button className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/5"><ICopy size={13}/></button>
    </div>
  </div>
);

const SetupSection = () => {
  const steps: SetupStepData[] = [
    { n:'01', I:ICloud,  title:'Deploy to Vercel',
      body:'One click. We provision Shotstack and Gemini env vars and ship a webhook endpoint.',
      kind:'cmd', code:'npx productreel deploy --target vercel' },
    { n:'02', I:ILink,   title:'Add the Shopify webhook',
      body:'Paste the generated URL into Shopify · Settings · Notifications · Webhooks.',
      kind:'url', code:'https://yourstore.productreel.app/api/hooks/product-created' },
    { n:'03', I:ISpark,  title:'Add a product. Get the video.',
      body:'Hit save on a new Shopify product. A 36-second cinematic ad lands in your inbox before you finish your coffee.',
      kind:'note', code:'avg time-to-inbox · 45 seconds' },
  ];
  return (
    <section id="setup" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <SectionEyebrow icon={<ITerminal size={12}/>}>Setup</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl">Three minutes from clone to live.</h2>
          </div>
          <a href="#" className="inline-flex items-center gap-2 text-[13px] text-white/70 hover:text-white px-3 py-2 rounded-lg border border-line hover:border-line2">
            <IBook size={14}/> Read the docs <IArrow size={13}/>
          </a>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(s => <SetupStepCard key={s.n} s={s}/>)}
        </div>
      </div>
    </section>
  );
};

// ── WAITLIST ───────────────────────────────────────────────────
// ── BACKFILL ───────────────────────────────────────────────────
// Replaces the legacy Waitlist email form. Calls POST /api/backfill which enumerates
// the store's public products.json and submits the first 5 to the render pipeline.
// After submit, polls each renderId in parallel for status. Surfaces the JSON-required
// limitation upfront so the user understands why some stores will reject.
type BackfillStep = 'input' | 'submitting' | 'rendering' | 'error';
type RenderState = 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed';
interface BackfillProduct { title: string; handle: string; renderId: string; productUrl: string; }
interface BackfillResponse {
  success: boolean;
  store?: string;
  totalInCatalog?: number;
  submitted?: number;
  failed?: number;
  products?: BackfillProduct[];
  errors?: Array<{ reason: string }>;
  error?: string;
}

const STATE_BADGE: Record<RenderState, { label: string; cls: string }> = {
  queued:    { label: 'queued',    cls: 'bg-white/8 text-white/55 border-white/15' },
  fetching:  { label: 'fetching',  cls: 'bg-amber/10 text-amber border-amber/40' },
  rendering: { label: 'rendering', cls: 'bg-brand/10 text-brand-soft border-brand/40' },
  saving:    { label: 'saving',    cls: 'bg-violet/10 text-violet-soft border-violet/40' },
  done:      { label: 'ready',     cls: 'bg-ok/10 text-ok border-ok/40' },
  failed:    { label: 'failed',    cls: 'bg-red-500/10 text-red-400 border-red-500/40' },
};

const SAMPLE_STORES = ['https://drinkolipop.com', 'https://www.allbirds.com', 'https://feastables.com'];

const BackfillSection = () => {
  const [storeUrl, setStoreUrl] = useState(SAMPLE_STORES[0]);
  const [step, setStep] = useState<BackfillStep>('input');
  const [products, setProducts] = useState<BackfillProduct[]>([]);
  const [statuses, setStatuses] = useState<Record<string, RenderState>>({});
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState<{ store: string; total: number; failed: number; errors: Array<{ reason: string }> } | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const start = async () => {
    const trimmed = storeUrl.trim();
    if (!trimmed) { setError('Paste a Shopify store URL'); return; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setStep('submitting'); setError(''); setProducts([]); setStatuses({}); setVideoUrls({}); setMeta(null);

    try {
      const res = await fetch('/api/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl: trimmed, limit: 5 }),
      });
      const data = (await res.json()) as BackfillResponse;
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Backfill failed');
      }
      const items = data.products ?? [];
      setProducts(items);
      setMeta({ store: data.store ?? trimmed, total: data.totalInCatalog ?? items.length, failed: data.failed ?? 0, errors: data.errors ?? [] });
      setStatuses(Object.fromEntries(items.map((p) => [p.renderId, 'rendering' as RenderState])));
      setStep('rendering');

      // Poll each renderId in parallel until done/failed. One interval, all renderIds.
      pollRef.current = setInterval(async () => {
        const pending = items.filter((p) => {
          const s = statuses[p.renderId];
          return s !== 'done' && s !== 'failed';
        });
        if (pending.length === 0 && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; return; }
        await Promise.all(items.map(async (p) => {
          try {
            const r = await fetch(`/api/status/${p.renderId}`).then((rr) => rr.json());
            const st = (r.status as RenderState) ?? 'queued';
            setStatuses((prev) => ({ ...prev, [p.renderId]: st }));
            if (st === 'done' && r.url) setVideoUrls((prev) => ({ ...prev, [p.renderId]: r.url as string }));
          } catch { /* keep polling */ }
        }));
      }, 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg); setStep('error');
    }
  };

  const reset = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setStep('input'); setProducts([]); setStatuses({}); setVideoUrls({}); setMeta(null); setError('');
  };

  const allDone = products.length > 0 && products.every((p) => statuses[p.renderId] === 'done' || statuses[p.renderId] === 'failed');

  return (
    <section id="backfill" className="relative border-t border-line">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(60% 80% at 50% 0%,rgba(61,123,255,0.20),transparent 60%),radial-gradient(40% 60% at 50% 100%,rgba(124,92,255,0.18),transparent 60%)' }}/>
      <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center">
          <SectionEyebrow icon={<ILayers size={12}/>}>Backfill existing catalog</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto">
            Already have a store? <span className="text-gradient">Render your catalog right now</span>.
          </h2>
          <p className="mt-4 text-white/55 max-w-xl mx-auto">
            Paste any Shopify store URL. We grab the first 5 products from the public catalog and run them through the same pipeline a paying merchant gets. You don&apos;t have to install anything or hand over OAuth.
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-line bg-card overflow-hidden">
            <div className="px-4 h-10 border-b border-line bg-[#0A0B10] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="ml-2 font-mono text-[11px] text-white/40">productreel · /backfill</span>
              <span className="ml-auto font-mono text-[10.5px] text-white/40">POST /api/backfill</span>
            </div>

            <div className="p-5 sm:p-6">
              {step !== 'rendering' && (
                <>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-white/40 mb-2">Shopify store URL</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="url" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://your-store.com"
                           className="flex-1 bg-[#0E0F14] border border-line focus:border-brand/60 focus-ring text-sm text-white placeholder:text-white/30 px-4 py-3 rounded-lg transition-colors"/>
                    <button onClick={start} disabled={step === 'submitting'}
                            className="bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-3 rounded-lg shadow-glow-sm hover:shadow-glow ring-1 ring-brand/40 transition-all whitespace-nowrap inline-flex items-center justify-center gap-2">
                      {step === 'submitting' ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/> Enumerating...</> : <><ILayers size={14}/> Backfill 5 products</>}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-mono text-white/35 mr-1">try:</span>
                    {SAMPLE_STORES.map((s) => (
                      <button key={s} onClick={() => setStoreUrl(s)}
                              className="text-[11px] font-mono text-white/55 hover:text-white px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                        {s.replace(/^https?:\/\//, '')}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg bg-amber/8 border border-amber/30 text-amber/90 text-[12.5px] px-3.5 py-2.5 leading-relaxed">
                    <strong className="font-semibold">Heads up:</strong> works on most Shopify stores. A few (Kotn, Liquid IV, Gymshark) block the public <code className="font-mono text-amber bg-amber/10 px-1 rounded">/products.json</code> with anti-bot. Those need the Admin API + OAuth route, which is on the way.
                  </div>
                  {error && <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[13px] px-3.5 py-2.5">{error}</div>}
                </>
              )}

              {step === 'rendering' && meta && (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-[13px] text-white/65">Backfilling <span className="text-white font-medium">{meta.store.replace(/^https?:\/\//, '')}</span></div>
                      <div className="mt-0.5 font-mono text-[11px] text-white/40">{products.length} submitted · {meta.failed} skipped · {meta.total} total in catalog</div>
                    </div>
                    <button onClick={reset} className="text-[12px] font-mono text-white/50 hover:text-white inline-flex items-center gap-1.5">
                      <IRefresh size={13}/> Try another store
                    </button>
                  </div>

                  <ul className="mt-5 space-y-2">
                    {products.map((p) => {
                      const st = statuses[p.renderId] ?? 'queued';
                      const badge = STATE_BADGE[st];
                      const vurl = videoUrls[p.renderId];
                      return (
                        <li key={p.renderId} className="rounded-lg border border-line bg-[#0a0b10] px-3.5 py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-[13.5px] text-white truncate">{p.title}</div>
                            <div className="font-mono text-[10.5px] text-white/35 truncate">{p.renderId.slice(0, 8)} · /{p.handle}</div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono text-[10px] uppercase tracking-[0.15em] ${badge.cls}`}>
                            {st !== 'done' && st !== 'failed' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>}
                            {badge.label}
                          </span>
                          {vurl ? (
                            <a href={vurl} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-soft hover:text-white px-3 py-1.5 rounded-md bg-brand/10 hover:bg-brand/20 border border-brand/30 transition-colors whitespace-nowrap">
                              <IDownload size={13}/> Download
                            </a>
                          ) : (
                            <span className="w-[100px] text-right font-mono text-[10.5px] text-white/30 whitespace-nowrap">—</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {meta.errors.length > 0 && (
                    <details className="mt-4 rounded-lg border border-red-500/25 bg-red-500/5 text-[12.5px] text-red-300/90 px-3.5 py-2.5">
                      <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest">{meta.errors.length} product(s) skipped — show why</summary>
                      <ul className="mt-2 space-y-1 font-mono text-[11.5px] text-red-300/80">
                        {meta.errors.map((er, i) => <li key={i}>• {er.reason}</li>)}
                      </ul>
                    </details>
                  )}

                  {allDone && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-ok/40 bg-ok/10 text-ok px-3.5 py-2 text-[13px]">
                      <ICheck size={14}/> All {products.length} renders finished
                    </div>
                  )}
                </>
              )}

              {step === 'error' && (
                <>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[13px] px-3.5 py-3 leading-relaxed">{error}</div>
                  <button onClick={reset} className="mt-4 text-[12px] font-mono text-white/55 hover:text-white inline-flex items-center gap-1.5">
                    <IRefresh size={13}/> Try a different store
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 text-center text-[11.5px] font-mono text-white/35">free during pilot · no credit card · built on Shotstack</div>
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ─────────────────────────────────────────────────────
type FooterLink = { label: string; href: string; external?: boolean };

const FooterCol = ({ title, items }: { title: string; items: FooterLink[] }) => (
  <div>
    <div className="text-[12px] font-mono uppercase tracking-widest text-white/35">{title}</div>
    <ul className="mt-3 space-y-2">
      {items.map(({ label, href, external }) => (
        <li key={label}>
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-[13px] text-white/70 hover:text-white transition-colors"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="border-t border-line">
    <div className="max-w-6xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-3 items-start">
      <div>
        <a href="#top" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-brand to-violet grid place-items-center"><IPlay size={11} className="translate-x-[1px]"/></span>
          <span className="font-display text-[15px] font-semibold tracking-tight">ProductReel</span>
        </a>
        <p className="mt-3 text-[13px] text-white/50 max-w-xs">AI video ads for Shopify, on autopilot. Built on Shotstack &amp; Gemini.</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FooterCol title="Product" items={[
          { label: 'Demo',        href: '#demo' },
          { label: 'AI Director', href: '#chat' },
        ]}/>
        <FooterCol title="Company" items={[
          { label: 'Docs',      href: 'https://github.com/jgvilchezc/product-reel/tree/main/docs', external: true },
          { label: 'GitHub',    href: 'https://github.com/jgvilchezc/product-reel',                external: true },
          { label: 'Changelog', href: 'https://github.com/jgvilchezc/product-reel/commits/main',   external: true },
          { label: 'Contact',   href: 'mailto:josegabrielvilchezc@gmail.com' },
        ]}/>
      </div>
      <div className="md:text-right">
        <div className="text-[12px] font-mono uppercase tracking-widest text-white/35">Status</div>
        <div className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse"/> All systems operational
        </div>
        <div className="mt-3 inline-flex items-center gap-3 text-white/55 text-[13px]">
          <a
            href="https://github.com/jgvilchezc/product-reel"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white inline-flex items-center gap-1.5"
          >
            <IGithub size={14}/> GitHub
          </a>
        </div>
      </div>
    </div>
    <div className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-5 text-[12px] text-white/35 flex items-center justify-between flex-wrap gap-2">
        <span>© 2026 ProductReel</span>
        <span className="font-mono">v0.1 · early access</span>
      </div>
    </div>
  </footer>
);

// ── PAGE ───────────────────────────────────────────────────────
// ── Shared helpers (consumed by ScrapeSection log panel) ───────
type WebhookLogEntry = { t: string; level: 'sys' | 'ok' | 'err'; msg: string };

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}


// ── SCRAPE SECTION ─────────────────────────────────────────────
type ScrapeStep = 'input' | 'rendering' | 'done';

interface ScrapedProduct {
  title: string;
  vendor: string;
  price: string;
  imageCount: number;
  sourceUrl: string;
}

// Verified live before each presentation — Gymshark and the death-wish-ground-coffee
// handle stopped working (anti-bot / handle change) so they were swapped May 12 for
// drinkolipop and a different Death Wish handle that returns 200 on .json. If you
// rotate these, hit /api/scrape end-to-end on each one before shipping.
const SAMPLE_SCRAPE_URLS = [
  'https://www.allbirds.com/products/mens-tree-runners',
  'https://drinkolipop.com/products/strawberry-vanilla',
  'https://www.deathwishcoffee.com/products/classic-cold-brew-latte',
];

const ScrapeSection = () => {
  const [step, setStep] = useState<ScrapeStep>('input');
  const [url, setUrl] = useState(SAMPLE_SCRAPE_URLS[0]);
  const [product, setProduct] = useState<ScrapedProduct | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<WebhookLogEntry[]>([]);
  const [modalUrl, setModalUrl] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };
  useEffect(() => () => stopAll(), []);

  const log = (level: WebhookLogEntry['level'], msg: string) =>
    setLogs((l) => [...l, { t: nowStamp(), level, msg }]);

  const start = async () => {
    const trimmed = url.trim();
    if (!trimmed) { setError('Paste a Shopify product URL'); return; }
    stopAll();
    setStep('rendering'); setProgress(5); setElapsed(0); setError('');
    setVideoUrl(''); setProduct(null); setLogs([]);
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100);
    log('sys', `POST /api/scrape · ${trimmed}`);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUrl: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.renderIds) throw new Error(data.error || 'Scrape failed');

      const scraped: ScrapedProduct = data.product;
      setProduct(scraped);
      log('ok', `Scraped ${scraped.title} · ${scraped.imageCount} images · $${scraped.price}`);
      const renderId: string = data.renderIds[0];
      log('sys', `Polling Shotstack render ${renderId.slice(0, 8)}...`);

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/status/${renderId}`).then((rr) => rr.json());
          setProgress(STATUS_PROGRESS[r.status] ?? 5);
          if (r.status === 'done') {
            stopAll(); setVideoUrl(r.url); setStep('done');
            log('ok', `Render complete (${fmtTime((Date.now() - t0) / 1000)})`);
          } else if (r.status === 'failed') {
            stopAll(); setError(r.error || 'Render failed'); setStep('input');
            log('err', `Render failed: ${r.error || 'unknown'}`);
          }
        } catch { /* keep polling */ }
      }, 3000);
    } catch (e) {
      stopAll();
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg); setStep('input');
      log('err', msg);
    }
  };

  const reset = () => {
    stopAll();
    setStep('input'); setProgress(0); setElapsed(0); setVideoUrl(''); setProduct(null); setError(''); setLogs([]);
  };

  return (
    <>
    <section id="scrape" className="relative border-t border-line">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(60% 50% at 50% 0%,rgba(217,102,87,0.18),transparent 60%)' }}/>
      <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <SectionEyebrow icon={<IShop size={12}/>}>Scrape any Shopify URL</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl">
              Paste a Shopify product URL — <span className="text-gradient-violet">get a finished video</span> in 30 seconds.
            </h2>
            <p className="mt-4 text-white/55 max-w-xl">
              Works with any public Shopify store. We hit <span className="font-mono text-white/75">/products/&lt;handle&gt;.json</span>, run Gemini on the product, then render the Cinematic Showcase template. You don&apos;t need to log in or install anything.
            </p>
          </div>
        </div>

        <div className="relative mt-10">
          <div className="absolute -inset-1 rounded-[28px] pointer-events-none"
               style={{ background: 'radial-gradient(60% 60% at 50% 50%,rgba(217,102,87,0.22),transparent 70%)', filter: 'blur(40px)' }}/>
          <div className="relative rounded-2xl border border-rose/30 bg-card overflow-hidden shadow-[0_0_60px_rgba(217,102,87,0.15)]">
            <div className="px-4 h-10 border-b border-line bg-[#0A0B10] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="ml-2 font-mono text-[11px] text-white/40">productreel · /scrape</span>
              <span className="ml-auto inline-flex items-center gap-2 font-mono text-[10.5px] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose"/>POST /api/scrape
              </span>
            </div>

            <div className="grid md:grid-cols-2">
              {/* LEFT — URL form / status */}
              <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-line bg-[#0E0F14]">
                <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Product URL</div>

                <div className="mt-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><ILink size={14}/></span>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                    disabled={step === 'rendering'}
                    placeholder="https://store.example.com/products/handle"
                    className="w-full bg-[#0a0b10] border border-line focus:border-rose/60 focus-ring text-[13.5px] text-white placeholder:text-white/25 font-mono pl-9 pr-3 py-3 rounded-lg transition-colors disabled:opacity-60"/>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SAMPLE_SCRAPE_URLS.map((u) => (
                    <button key={u} type="button" onClick={() => setUrl(u)}
                      disabled={step === 'rendering'}
                      className="text-[10.5px] font-mono text-white/50 hover:text-white px-2 py-1 rounded border border-line hover:border-line2 transition-colors disabled:opacity-40">
                      {new URL(u).hostname.replace(/^www\./, '')}
                    </button>
                  ))}
                </div>

                {error && step === 'input' && (
                  <div className="mt-4 px-3 py-2.5 rounded-lg bg-rose/10 border border-rose/30 text-rose text-[12.5px]">{error}</div>
                )}

                {step === 'input' && (
                  <button onClick={start}
                    className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose hover:opacity-90 text-white text-sm font-medium px-5 py-3 rounded-lg shadow-glow ring-1 ring-rose/40 transition-all">
                    <ISpark size={15}/> Scrape & generate <IArrow size={15}/>
                  </button>
                )}

                {step === 'rendering' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-[12px] font-mono text-white/45">
                      <span className="inline-flex items-center gap-1.5"><IClock size={13}/> {fmtTime(elapsed)} elapsed</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 relative h-2 rounded-full bg-white/8 overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose to-violet transition-all" style={{ width: `${progress}%` }}/>
                      <div className="absolute inset-0 shimmer-bg mix-blend-screen opacity-80"/>
                    </div>
                    <button onClick={reset} className="mt-4 text-[12px] text-white/55 hover:text-white px-2.5 py-1.5 rounded-md border border-line hover:border-line2">Cancel</button>
                  </div>
                )}

                {step === 'done' && (
                  <button onClick={reset}
                    className="mt-6 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2.5 rounded-lg border border-line transition-all">
                    <IRefresh size={14}/> Try another URL
                  </button>
                )}

                <div className="mt-6 rounded-xl border border-line bg-[#0a0b10] overflow-hidden">
                  <div className="px-4 h-9 border-b border-line flex items-center gap-2">
                    <ITerminal size={13} className="text-white/45"/>
                    <span className="font-mono text-[11px] text-white/45">scrape.log</span>
                  </div>
                  <div className="p-4 font-mono text-[11.5px] leading-6 text-white/55 max-h-44 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="text-white/30">Waiting for input…</div>
                    ) : logs.map((l, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-white/30 shrink-0">{l.t}</span>
                        <span className={`shrink-0 w-1.5 h-1.5 mt-2 rounded-full ${l.level==='ok'?'bg-ok':l.level==='err'?'bg-rose':'bg-brand-soft'}`}/>
                        <span className={l.level==='err'?'text-rose':'text-white/70'}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — preview / video */}
              <div className="p-6 sm:p-8 bg-card">
                {!product && step !== 'done' && (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-white/40">
                    <IShop size={36} className="text-white/20 mb-4"/>
                    <div className="text-[13.5px] text-white/55">Product preview will appear here</div>
                    <div className="mt-1 text-[11.5px] text-white/35">After we fetch the storefront JSON</div>
                  </div>
                )}

                {product && (
                  <>
                    <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Scraped product</div>
                    <div className="mt-3 rounded-xl border border-line bg-[#0a0b10] p-4">
                      <div className="text-[15px] text-white font-medium">{product.title}</div>
                      <div className="mt-1 text-[12.5px] text-white/55">{product.vendor}</div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11.5px] font-mono">
                        <div className="p-2 rounded-md bg-white/5">
                          <div className="text-white/45">price</div>
                          <div className="text-white mt-0.5">${product.price}</div>
                        </div>
                        <div className="p-2 rounded-md bg-white/5">
                          <div className="text-white/45">images</div>
                          <div className="text-white mt-0.5">{product.imageCount}</div>
                        </div>
                        <div className="p-2 rounded-md bg-white/5">
                          <div className="text-white/45">source</div>
                          <div className="text-white mt-0.5 truncate">{new URL(product.sourceUrl).hostname.replace(/^www\./,'')}</div>
                        </div>
                      </div>
                    </div>

                    {step === 'done' && videoUrl && (
                      <div className="mt-4">
                        <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45 mb-2">Result</div>
                        <div className="relative rounded-xl border border-rose/40 overflow-hidden bg-black">
                          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                          <video src={videoUrl} controls playsInline className="w-full aspect-video bg-black"/>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button onClick={() => setModalUrl(videoUrl)}
                            className="inline-flex items-center gap-1.5 text-[12px] text-white/70 hover:text-white px-3 py-2 rounded-md border border-line hover:border-line2">
                            <IPlay size={12}/> Fullscreen
                          </button>
                          <a href={videoUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] text-white/70 hover:text-white px-3 py-2 rounded-md border border-line hover:border-line2">
                            <IDownload size={12}/> Download MP4
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    {modalUrl && <VideoModal url={modalUrl} onClose={() => setModalUrl('')}/>}
    </>
  );
};

// ── CONNECT SHOPIFY SECTION ────────────────────────────────────
const HealthRow = ({ ok, label, value }: { ok: boolean; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[13px] text-white/65">{label}</span>
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-mono ${ok ? 'text-ok' : 'text-rose'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-ok' : 'bg-rose'}`}/>
      {value}
    </span>
  </div>
);

type InstallState = 'idle' | 'input' | 'authorizing' | 'connected';

const fmtRelative = (ms: number) => {
  const diff = Math.max(0, Date.now() - ms);
  if (diff < 60_000) return 'just now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} d ago`;
};

// ── BEFORE / AFTER (NANO BANANA QUALITY DEMO) ─────────────────
// Live demo of the Nano Banana enhancement step. Each card is a drag-to-reveal
// slider — the right side starts visible (enhanced), drag left to see the original.
// The 4 pairs are real merchant images (the 144px Nike t-shirt JPEGs the user
// tested with) and their Nano Banana outputs, downloaded once and committed to
// /public/test/enhanced/ so the page loads instantly without hitting the API on
// every visit. Visual consistency claim: each enhancement was a separate call;
// none used the same source.

interface BeforeAfterPair { before: string; after: string; label: string; }

const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  { before: '/test/f1.jpeg', after: '/test/enhanced/f1.jpg', label: 'Black Performance Tee · 148px source' },
  { before: '/test/f2.jpeg', after: '/test/enhanced/f2.jpg', label: 'White Swoosh Tee · 216px source' },
  { before: '/test/f3.jpeg', after: '/test/enhanced/f3.jpg', label: 'Black Logo Tee · 194px source' },
  { before: '/test/f4.jpeg', after: '/test/enhanced/f4.jpg', label: 'Performance Front · 148px source' },
];

const BeforeAfterCard = ({ pair }: { pair: BeforeAfterPair }) => {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const p = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(p);
  };

  return (
    <div>
      <div
        ref={ref}
        onMouseDown={(e) => { dragging.current = true; updatePos(e.clientX); }}
        onMouseMove={(e) => { if (dragging.current) updatePos(e.clientX); }}
        onMouseUp={() => { dragging.current = false; }}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchStart={(e) => { dragging.current = true; updatePos(e.touches[0].clientX); }}
        onTouchMove={(e) => { if (dragging.current) updatePos(e.touches[0].clientX); }}
        onTouchEnd={() => { dragging.current = false; }}
        className="relative aspect-square overflow-hidden rounded-xl cursor-ew-resize select-none bg-[#0a0b10] border border-line"
      >
        {/* AFTER fills the box */}
        <img src={pair.after} alt="enhanced" className="absolute inset-0 w-full h-full object-cover" draggable={false}/>
        <span className="absolute top-2.5 right-2.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white bg-violet/70 backdrop-blur px-1.5 py-0.5 rounded">enhanced</span>

        {/* BEFORE clipped to the left of the slider */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img src={pair.before} alt="original" className="absolute inset-0 w-full h-full object-cover" draggable={false}/>
          <span className="absolute top-2.5 left-2.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white bg-black/60 backdrop-blur px-1.5 py-0.5 rounded">before</span>
        </div>

        {/* Drag handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none shadow-[0_0_12px_rgba(124,92,255,0.65)]"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
              <polyline points="9 18 15 12 9 6" transform="translate(-2 0)"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-2.5 text-[12px] font-mono text-white/45 text-center">{pair.label}</div>
    </div>
  );
};

const BeforeAfterSection = () => (
  <section id="quality" className="relative border-t border-line">
    <div className="absolute inset-0 pointer-events-none"
         style={{ background: 'radial-gradient(60% 50% at 50% 0%,rgba(124,92,255,0.20),transparent 60%),radial-gradient(40% 40% at 80% 30%,rgba(61,123,255,0.14),transparent 60%)' }}/>
    <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
      <div className="text-center max-w-3xl mx-auto">
        <SectionEyebrow icon={<IWand size={12}/>}>Image quality, automatic</SectionEyebrow>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Bad source photos make bad video ads.{' '}
          <span className="text-gradient-violet">So we fix the photos first.</span>
        </h2>
        <p className="mt-4 text-white/55 max-w-xl mx-auto">
          A lot of merchants upload low-res product photos. Some pull them off Google at 144p. Before we render anything, each image goes through Nano Banana (Gemini 2.5 Flash Image) for a quality pass. Same shot, sharper pixels.
        </p>
        <p className="mt-2 text-[13px] font-mono text-violet-soft/80">drag the slider to compare</p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BEFORE_AFTER_PAIRS.map((p) => <BeforeAfterCard key={p.before} pair={p}/>)}
      </div>

      <div className="mt-10 max-w-2xl mx-auto rounded-xl border border-line bg-card/60 px-5 py-4">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-widest text-white/40">Source</div>
            <div className="mt-1 font-display text-lg text-white">140–216 px</div>
            <div className="text-[11px] text-white/45">avg 3 KB JPEG</div>
          </div>
          <div className="sm:border-x sm:border-line">
            <div className="font-mono text-[10.5px] uppercase tracking-widest text-white/40">Model</div>
            <div className="mt-1 font-display text-lg text-white">Nano Banana</div>
            <div className="text-[11px] text-white/45">gemini-2.5-flash-image</div>
          </div>
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-widest text-white/40">Output</div>
            <div className="mt-1 font-display text-lg text-white">~1 MP PNG</div>
            <div className="text-[11px] text-white/45">~10s per image (parallel)</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ConnectShopifySection = () => {
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [shop, setShop] = useState('');
  const [authStep, setAuthStep] = useState('');
  const [installedAt, setInstalledAt] = useState<number | null>(null);
  const [endpointStatus, setEndpointStatus] = useState<'checking' | 'ok' | 'err'>('checking');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('productreel:shopify_install');
      if (stored) {
        const parsed = JSON.parse(stored) as { shop?: string; installedAt?: number };
        if (parsed.shop && parsed.installedAt) {
          setShop(parsed.shop);
          setInstalledAt(parsed.installedAt);
          setInstallState('connected');
        }
      }
    } catch { /* corrupt entry — ignore */ }

    fetch('/api/webhook', { method: 'OPTIONS' })
      .then((r) => setEndpointStatus(r.status >= 200 && r.status < 500 ? 'ok' : 'err'))
      .catch(() => setEndpointStatus('err'));
  }, []);

  const startInstall = () => {
    setShop('');
    setInstallState('input');
  };

  const submitShop = async () => {
    let domain = shop.trim().toLowerCase();
    if (!domain) return;
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!domain.endsWith('.myshopify.com')) {
      domain = domain.replace(/\.myshopify\.com$/, '') + '.myshopify.com';
    }
    setShop(domain);
    setInstallState('authorizing');

    // Synthetic OAuth-style sequence — visual demo of what a real Shopify OAuth install
    // would feel like. Real OAuth would 302 to Shopify, callback to /api/install, then
    // register webhooks via Admin API. This sequence mirrors those phases visually.
    const phases = [
      'Redirecting to Shopify Admin…',
      'Authorizing scopes (read_products, write_themes)…',
      'Registering products/create webhook…',
      'Verifying connection…',
    ];
    for (const phase of phases) {
      setAuthStep(phase);
      await new Promise((r) => setTimeout(r, 700));
    }

    const now = Date.now();
    setInstalledAt(now);
    setInstallState('connected');
    try {
      localStorage.setItem(
        'productreel:shopify_install',
        JSON.stringify({ shop: domain, installedAt: now })
      );
    } catch { /* storage blocked — UI still updates */ }
  };

  const disconnect = () => {
    try { localStorage.removeItem('productreel:shopify_install'); } catch {}
    setShop('');
    setInstalledAt(null);
    setAuthStep('');
    setInstallState('idle');
  };

  const cancelInput = () => {
    setShop('');
    setInstallState('idle');
  };

  return (
    <section id="connect" className="relative border-t border-line">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(60% 50% at 50% 0%,rgba(61,123,255,0.18),transparent 60%),radial-gradient(40% 40% at 80% 30%,rgba(124,92,255,0.12),transparent 60%)' }}/>
      <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2">
              <SectionEyebrow icon={<ICloud size={12}/>}>Real Shopify automation</SectionEyebrow>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber/15 border border-amber/40 text-amber font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse"/>coming soon
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl">
              Install once. <span className="text-gradient">Every new product auto-renders</span>.
            </h2>
            <p className="mt-4 text-white/55 max-w-xl">
              The pipeline (webhook, Gemini, Shotstack, email) is already running in production. The one-click install on this card isn&apos;t. That part is a mockup. We onboard pilot merchants manually for now. If you have a catalog and want videos today, the <a href="#backfill" className="underline decoration-brand/50 hover:decoration-brand text-white/80">backfill section</a> below works without install.
            </p>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="rounded-2xl border border-brand/30 bg-card overflow-hidden shadow-[0_0_60px_rgba(61,123,255,0.18)]">
            <div className="px-4 h-10 border-b border-line bg-[#0A0B10] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A2D38]"/>
              <span className="ml-2 font-mono text-[11px] text-white/40">productreel · /connect</span>
              <span className="ml-auto inline-flex items-center gap-2 font-mono text-[10.5px] text-white/40">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  installState === 'connected' ? 'bg-ok' :
                  installState === 'authorizing' ? 'bg-amber animate-pulse' :
                  'bg-white/25'
                }`}/>
                {installState === 'connected' ? 'connected' :
                 installState === 'authorizing' ? 'authorizing…' :
                 installState === 'input' ? 'awaiting shop' :
                 'not connected'}
              </span>
            </div>

            {installState === 'idle' && (
              <div className="p-8 sm:p-10">
                <div className="flex flex-col items-center text-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ok/30 to-ok/10 border border-ok/40 flex items-center justify-center mb-5">
                    <IShop size={26} className="text-ok"/>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white tracking-tight">
                    Preview the install flow
                  </h3>
                  <p className="mt-2 text-[13.5px] text-white/55 leading-relaxed">
                    Click through what the real install will feel like once we ship the public Shopify App. Pilot merchants today get onboarded manually via Slack.
                  </p>
                  <button onClick={startInstall}
                    className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ok hover:bg-ok/90 text-black text-sm font-semibold px-5 py-3 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-all">
                    <IShop size={15}/> Preview install flow <IArrow size={14}/>
                  </button>
                  <div className="mt-5 flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-[11.5px] text-white/45">
                    <span className="inline-flex items-center gap-1.5"><ILock size={11}/> OAuth 2.0 · planned</span>
                    <span className="inline-flex items-center gap-1.5"><ICheck size={11}/> Free during pilot</span>
                    <span className="inline-flex items-center gap-1.5"><IBolt size={11}/> ~30s install</span>
                  </div>
                </div>
              </div>
            )}

            {installState === 'input' && (
              <div className="p-8 sm:p-10">
                <div className="max-w-md mx-auto">
                  <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Your Shopify store</div>
                  <h3 className="mt-2 font-display text-xl font-semibold text-white tracking-tight">
                    Which store should we install on?
                  </h3>
                  <p className="mt-2 text-[13px] text-white/55">
                    You&apos;ll be redirected to Shopify to approve the install. Read-only access to products.
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); void submitShop(); }} className="mt-5">
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-[#0a0b10] focus-within:border-brand/60 transition-colors">
                      <span className="pl-3 text-white/35"><IShop size={14}/></span>
                      <input
                        type="text"
                        value={shop}
                        onChange={(e) => setShop(e.target.value)}
                        autoFocus
                        placeholder="yourstore"
                        className="flex-1 bg-transparent text-[13.5px] text-white placeholder:text-white/25 font-mono py-3 outline-none"/>
                      <span className="pr-3 text-[12.5px] text-white/35 font-mono">.myshopify.com</span>
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <button type="submit"
                        disabled={!shop.trim()}
                        className="inline-flex items-center gap-2 bg-ok hover:bg-ok/90 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-semibold px-5 py-3 rounded-lg transition-all">
                        Continue to Shopify <IArrow size={14}/>
                      </button>
                      <button type="button" onClick={cancelInput}
                        className="text-[13px] text-white/55 hover:text-white px-3 py-3 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {installState === 'authorizing' && (
              <div className="p-8 sm:p-10">
                <div className="flex flex-col items-center text-center max-w-md mx-auto py-6">
                  <div className="relative w-14 h-14 mb-5">
                    <span className="absolute inset-0 rounded-full border-2 border-brand/20"/>
                    <span className="absolute inset-0 rounded-full border-2 border-brand border-r-transparent animate-spin"/>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white tracking-tight">
                    Installing on <span className="font-mono text-brand-soft">{shop}</span>
                  </h3>
                  <p className="mt-3 text-[13px] text-white/65 font-mono min-h-[1.5em]">
                    {authStep}
                  </p>
                  <div className="mt-6 text-[11.5px] text-white/35 font-mono">
                    Don&apos;t close this window…
                  </div>
                </div>
              </div>
            )}

            {installState === 'connected' && (
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Connected</div>
                    <h3 className="mt-2 font-display text-xl font-semibold text-white tracking-tight break-all">
                      {shop}
                    </h3>
                    {installedAt && (
                      <div className="mt-1 text-[12px] text-white/45">
                        Installed {fmtRelative(installedAt)}
                      </div>
                    )}
                  </div>
                  <button onClick={disconnect}
                    className="inline-flex items-center gap-1.5 text-[12px] text-white/55 hover:text-rose px-3 py-2 rounded-md border border-line hover:border-rose/30 transition-colors">
                    <IRefresh size={12}/> Disconnect
                  </button>
                </div>

                <div className="mt-6 space-y-2.5">
                  {[
                    { label: 'OAuth scopes authorized', detail: 'read_products · write_themes' },
                    { label: 'Webhook subscribed', detail: 'products/create · HMAC verified' },
                    { label: 'Pipeline armed', detail: 'Gemini → Shotstack → email' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3 rounded-lg border border-ok/20 bg-ok/5 px-3.5 py-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-ok/20 flex items-center justify-center mt-0.5">
                        <ICheck size={12} className="text-ok"/>
                      </span>
                      <div className="flex-1">
                        <div className="text-[13.5px] text-white font-medium">{row.label}</div>
                        <div className="mt-0.5 text-[12px] text-white/55 font-mono">{row.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-brand/30 bg-brand/5 p-4">
                  <div className="flex items-start gap-2">
                    <ISpark size={14} className="text-brand-soft shrink-0 mt-0.5"/>
                    <div className="text-[12.5px] text-white/75 leading-relaxed">
                      <span className="text-white font-medium">You&apos;re live.</span> Add a product in Shopify Admin → finished video lands in your inbox in ~30 seconds.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-6 sm:p-8 lg:sticky lg:top-24 self-start">
            <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Stack health</div>
            <div className="mt-5 space-y-3">
              <HealthRow ok={endpointStatus === 'ok'} label="Webhook endpoint" value={endpointStatus === 'ok' ? 'reachable' : endpointStatus === 'err' ? 'unreachable' : 'checking…'}/>
              <HealthRow ok={true} label="HMAC validation" value="enabled"/>
              <HealthRow ok={true} label="Cinematic Showcase" value="ready"/>
              <HealthRow ok={true} label="Resend email delivery" value="ready"/>
            </div>

            <div className="mt-6 pt-6 border-t border-line">
              <div className="text-[11.5px] font-mono uppercase tracking-[0.2em] text-white/45">Don&apos;t have a Shopify store?</div>
              <p className="mt-2 text-[12.5px] text-white/55 leading-relaxed">
                Paste any public Shopify product URL into the{' '}
                <a href="#scrape" className="text-brand-soft hover:text-white underline underline-offset-2">Scrape</a>{' '}
                section to see the pipeline run on a real product.
              </p>
            </div>

            <div className="mt-6 rounded-lg border border-violet/30 bg-violet/5 p-4">
              <div className="flex items-start gap-2">
                <IBolt size={14} className="text-violet-soft shrink-0 mt-0.5"/>
                <div className="text-[12.5px] text-white/70 leading-relaxed">
                  Free to install. <span className="text-white font-medium">No subscription</span> while in beta. Cancel anytime from Shopify Admin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar/>
      <main>
        <Hero/>
        <HowItWorks/>
        <DemoSection/>
        <ScrapeSection/>
        <BeforeAfterSection/>
        <ConnectShopifySection/>
        <ChatSection/>
        <SetupSection/>
        <BackfillSection/>
      </main>
      <Footer/>
    </div>
  );
}
