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
        <a href="#webhook"      className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">Webhook</a>
        <a href="#chat"         className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">AI Director</a>
        <a href="#setup"        className="hidden md:inline text-[13px] text-white/60 hover:text-white px-3 py-2 transition-colors">Setup</a>
        <a href="#demo"         className="text-[13px] text-white/85 hover:text-white px-3 py-2 rounded-lg border border-line hover:border-line2 transition-colors">View demo</a>
        <a href="#waitlist"     className="text-[13px] font-medium text-white bg-brand hover:bg-brand-hover px-3.5 py-2 rounded-lg shadow-glow-sm hover:shadow-glow transition-all">Get early access</a>
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
        Connect your Shopify store once. The next time you add a product, ProductReel
        ships a 20-second cinematic ad — no editor, no template hunting, no effort.
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
      body: 'Add a product to your Shopify store like you always do. The webhook fires the moment the listing goes live.' },
    { n: '02', I: IWand,   title: 'AI picks templates & generates',
      body: 'Gemini Vision reads your photos, writes a voiceover script, and Shotstack renders three cinematic 20-second cuts in parallel.' },
    { n: '03', I: ILayers, title: 'Choose your favorite or customize',
      body: 'Pick the cut that fits your brand, download the MP4, or describe a new vision in plain language and let the AI Director re-cut it.' },
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
        {(['/nike2.avif', '/nike3.avif', '/nike4.png', '/nike5.jpg'] as const).map((src, i) => (
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
          <Logline status="ok"  t="00:00.4">connected · sample product loaded</Logline>
          <Logline status="ok"  t="00:01.1">gemini · vision · 3 frames analyzed</Logline>
          <Logline status="ok"  t="00:02.8">script · voiceover drafted (167 words)</Logline>
          <Logline status="run" t="00:03.0">shotstack · render · bold-dynamic — queued</Logline>
          <Logline status="run" t="00:03.0">shotstack · render · clean-minimal — queued</Logline>
          <Logline status="run" t="00:03.0">shotstack · render · story-mode — queued</Logline>
          <Logline status="run" t="00:04.6">tts · elevenlabs · synthesis · 3 voices</Logline>
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
          <ICheck size={12}/> Render complete · 3 cuts ready
        </div>
        <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">Pick your favorite, or describe your own.</h3>
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
      <MetaPill k="Pipeline" v="Gemini → Shotstack → MP4"/>
      <MetaPill k="Output"   v="1080p · 20s · MP4"/>
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
            <p className="mt-4 text-white/55 max-w-xl">We&apos;ll simulate a real Shopify run end-to-end. One product, full pipeline, in real time.</p>
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
  { role: 'ai',   body: "Tell me how you want your video to look and feel. What's the vibe? Bold and energetic? Calm and premium? Funny?" },
  { role: 'user', body: "I want something dark and cinematic with a luxury feel — slow-motion product shots, deep voiceover, almost like a fragrance ad." },
  { role: 'ai',   body: "Got it — moody luxury, deep grain, slow camera, low-end voice, gold accents. I'll keep the product center-frame and let the silence breathe. Hit Generate when you're ready." },
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
      setMessages(m => [...m, { role: 'ai', body: 'Locked in. Adjusting palette and pacing toward that direction. Ready when you are.' }]);
      setThinking(false);
    }, 1200);
  };

  return (
    <section id="chat" className="relative border-t border-line chat-surface">
      <div className="absolute inset-0 chat-grid pointer-events-none"/>
      <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-10 items-start">
          <div className="lg:sticky lg:top-24">
            <SectionEyebrow icon={<IMessage size={12}/>}>AI Director</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              None of the templates feel right?{' '}
              <span className="text-gradient-violet">Just describe it.</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-md">
              Tell the Director the mood, pace, and palette you have in mind. Plain language — no template jargon. We&apos;ll re-cut your video to match.
            </p>
            <ul className="mt-6 space-y-2 text-[13.5px] text-white/65">
              {['Talk like you would to a creative producer.','Reference moods, films, or feelings — not effects.','One brief, one re-render. Iterate freely.'].map(x => (
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
                    <span className="w-1.5 h-1.5 rounded-full bg-ok"/>online · gemini-2.0-flash
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
    { n:'03', I:ISpark,  title:'Watch the magic',
      body:'Add a product. Three videos arrive in your inbox before the listing finishes saving.',
      kind:'note', code:'avg time-to-inbox · 47 seconds' },
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
const Waitlist = () => {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!email.includes('@')) return; setSubmitted(true); setEmail(''); };
  return (
    <section id="waitlist" className="border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-card px-6 sm:px-12 py-14 sm:py-20 text-center">
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(60% 80% at 50% 0%,rgba(61,123,255,0.22),transparent 60%),radial-gradient(40% 60% at 50% 100%,rgba(124,92,255,0.20),transparent 60%)' }}/>
          <div className="relative">
            <SectionEyebrow icon={<IMoon size={12}/>}>Early access</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto">
              The next product you upload could come with a video.
            </h2>
            <p className="mt-4 text-white/55 max-w-xl mx-auto">First 10 videos are free. We&apos;ll email you the moment your store is in.</p>
            {!submitted ? (
              <form onSubmit={submit} className="mt-8 mx-auto max-w-md flex flex-col sm:flex-row items-stretch gap-2">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@store.com"
                       className="flex-1 bg-[#0E0F14] border border-line focus:border-brand/60 focus-ring text-sm text-white placeholder:text-white/30 px-4 py-3 rounded-lg transition-colors"/>
                <button type="submit" className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-3 rounded-lg shadow-glow-sm hover:shadow-glow ring-1 ring-brand/40 transition-all whitespace-nowrap">
                  Notify me
                </button>
              </form>
            ) : (
              <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-ok/40 bg-ok/10 text-ok px-4 py-3 text-sm">
                <ICheck size={15}/> You&apos;re on the list. We&apos;ll be in touch.
              </div>
            )}
            <div className="mt-4 text-[12px] text-white/40 font-mono">no credit card · cancel anytime · 100% built on Shotstack</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ─────────────────────────────────────────────────────
const FooterCol = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <div className="text-[12px] font-mono uppercase tracking-widest text-white/35">{title}</div>
    <ul className="mt-3 space-y-2">
      {items.map(x => <li key={x}><a href="#" className="text-[13px] text-white/70 hover:text-white transition-colors">{x}</a></li>)}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="border-t border-line">
    <div className="max-w-6xl mx-auto px-6 py-10 grid gap-6 md:grid-cols-3 items-start">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-brand to-violet grid place-items-center"><IPlay size={11} className="translate-x-[1px]"/></span>
          <span className="font-display text-[15px] font-semibold tracking-tight">ProductReel</span>
        </div>
        <p className="mt-3 text-[13px] text-white/50 max-w-xs">AI video ads for Shopify, on autopilot. Built on Shotstack &amp; Gemini.</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FooterCol title="Product" items={['Demo','Templates','AI Director','Pricing']}/>
        <FooterCol title="Company" items={['Docs','GitHub','Changelog','Contact']}/>
      </div>
      <div className="md:text-right">
        <div className="text-[12px] font-mono uppercase tracking-widest text-white/35">Status</div>
        <div className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse"/> All systems operational
        </div>
        <div className="mt-3 inline-flex items-center gap-3 text-white/55 text-[13px]">
          <a href="#" className="hover:text-white inline-flex items-center gap-1.5"><IGithub size={14}/> GitHub</a>
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
// ── WEBHOOK TESTER ─────────────────────────────────────────────
type WebhookProduct = {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  variants: Array<{ price: string }>;
  images: Array<{ src: string }>;
};

type WebhookFormState = {
  title: string;
  vendor: string;
  price: string;
  description: string;
  image1: string;
  image2: string;
  image3: string;
};

type WebhookLogEntry = { t: string; level: 'sys' | 'ok' | 'err'; msg: string };
type WebhookRenderState = {
  renderId: string;
  status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed' | 'pending';
  url?: string;
  error?: string;
};

// Picsum delivers a stable JPG with `.jpg` in the path — Shotstack accepts these
// directly. Real production traffic from Shopify uses cdn.shopify.com URLs which
// always have an extension, so the same code path serves both cases.
const SAMPLE_PRODUCT: WebhookFormState = {
  title: 'Air Jordan 1 Retro High OG',
  vendor: 'Test Store',
  price: '180.00',
  description:
    'The iconic sneaker that changed basketball forever. Premium leather upper with classic colorblocking.',
  image1: 'https://picsum.photos/seed/jordan1-front/1280/720.jpg',
  image2: 'https://picsum.photos/seed/jordan1-side/1280/720.jpg',
  image3: 'https://picsum.photos/seed/jordan1-detail/1280/720.jpg',
};

const EMPTY_FORM: WebhookFormState = {
  title: '', vendor: '', price: '', description: '', image1: '', image2: '', image3: '',
};

const TEMPLATE_LABELS = ['Cinematic Showcase', 'Bold Energy', 'Clean Minimal'] as const;

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const StatusDot = ({ state }: { state: 'idle' | 'send' | 'wait' | 'done' | 'err' }) => {
  const cls = {
    idle: 'bg-white/25',
    send: 'bg-brand pulse-ring',
    wait: 'bg-amber',
    done: 'bg-ok',
    err: 'bg-rose',
  }[state];
  return <span className={`w-2 h-2 rounded-full ${cls}`}/>;
};

const RenderStatusPill = ({ status }: { status: WebhookRenderState['status'] }) => {
  const map: Record<WebhookRenderState['status'], { label: string; cls: string }> = {
    pending:   { label: 'PENDING',    cls: 'text-white/40 border-white/15' },
    queued:    { label: 'QUEUED',     cls: 'text-brand-soft border-brand/25' },
    fetching:  { label: 'FETCHING',   cls: 'text-brand-soft border-brand/35' },
    rendering: { label: 'RENDERING',  cls: 'text-amber border-amber/35' },
    saving:    { label: 'SAVING',     cls: 'text-amber border-amber/35' },
    done:      { label: 'DONE',       cls: 'text-ok border-ok/40' },
    failed:    { label: 'FAILED',     cls: 'text-rose border-rose/40' },
  };
  const v = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${v.cls}`}>
      {status !== 'pending' && <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'done' ? 'bg-ok' : status === 'failed' ? 'bg-rose' :
        status === 'rendering' || status === 'saving' ? 'bg-amber' : 'bg-brand'
      }`}/>}
      {v.label}
    </span>
  );
};

const FieldLabel = ({ idx, children, hint }: { idx: string; children: ReactNode; hint?: string }) => (
  <div className="flex items-center gap-2 mb-1.5">
    <span className="font-mono text-[10px] text-white/30 tabular-nums">{idx}</span>
    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/55">{children}</span>
    {hint && <span className="ml-auto font-mono text-[10px] text-white/30">{hint}</span>}
  </div>
);

const inputCls =
  'w-full bg-[#0a0b10] border border-line rounded-md px-3 py-2 text-[13px] text-white placeholder:text-white/25 font-sans focus-ring transition-colors hover:border-line2';

const WebhookTester = () => {
  const [form, setForm] = useState<WebhookFormState>(EMPTY_FORM);
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [logs, setLogs] = useState<WebhookLogEntry[]>([
    { t: nowStamp(), level: 'sys', msg: 'standby. fill payload, dispatch when ready.' },
  ]);
  const [renders, setRenders] = useState<WebhookRenderState[]>([]);
  const [phase, setPhase] = useState<'idle' | 'sending' | 'polling' | 'done' | 'error'>('idle');
  const [topError, setTopError] = useState<string | null>(null);
  const logScrollRef = useRef<HTMLDivElement>(null);

  const update = (k: keyof WebhookFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const append = (level: WebhookLogEntry['level'], msg: string) =>
    setLogs((l) => [...l, { t: nowStamp(), level, msg }]);

  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (phase !== 'polling' || renders.length === 0) return;
    if (renders.every((r) => r.status === 'done' || r.status === 'failed')) {
      setPhase('done');
      const okCount = renders.filter((r) => r.status === 'done').length;
      append('ok', `pipeline complete · ${okCount}/${renders.length} renders ready`);
      return;
    }
    const interval = window.setInterval(async () => {
      const next = await Promise.all(
        renders.map(async (r, idx) => {
          if (r.status === 'done' || r.status === 'failed') return r;
          try {
            const res = await fetch(`/api/status/${r.renderId}`);
            const j = await res.json();
            if (j.error && !j.status) return { ...r, status: 'failed' as const, error: j.error };
            const updated: WebhookRenderState = { ...r, status: j.status, url: j.url, error: j.error };
            if (j.status === 'done') {
              setTimeout(() => append('ok', `${TEMPLATE_LABELS[idx] || 'render'} → done`), 0);
            } else if (j.status === 'failed') {
              setTimeout(() => append('err', `${TEMPLATE_LABELS[idx] || 'render'} → failed: ${j.error || 'unknown'}`), 0);
            }
            return updated;
          } catch (e) {
            return { ...r, status: 'failed' as const, error: e instanceof Error ? e.message : String(e) };
          }
        })
      );
      setRenders(next);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [phase, renders]);

  const useSample = () => {
    setForm(SAMPLE_PRODUCT);
    append('sys', `sample payload loaded · ${SAMPLE_PRODUCT.title}`);
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setRenders([]);
    setPhase('idle');
    setTopError(null);
    setLogs([{ t: nowStamp(), level: 'sys', msg: 'reset. ready for next dispatch.' }]);
  };

  const dispatch = async () => {
    setTopError(null);
    if (!form.title.trim()) { setTopError('Title is required.'); return; }
    const images = [form.image1, form.image2, form.image3].map((s) => s.trim()).filter(Boolean);
    if (images.length === 0) { setTopError('At least one image URL is required.'); return; }

    const payload: WebhookProduct = {
      id: Math.floor(Math.random() * 1_000_000_000),
      title: form.title.trim(),
      body_html: form.description.trim() ? `<p>${form.description.trim()}</p>` : '',
      vendor: form.vendor.trim() || 'Test Store',
      variants: [{ price: form.price.trim() || '0' }],
      images: images.map((src) => ({ src })),
    };

    setPhase('sending');
    setRenders([]);
    append('sys', `POST /api/webhook · payload ${images.length} image${images.length > 1 ? 's' : ''} · id ${payload.id}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-test-mode': '1',
      };
      if (geminiKey.trim()) headers['x-gemini-key'] = geminiKey.trim();

      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPhase('error');
        const msg = data.error || `HTTP ${res.status}`;
        append('err', msg);
        setTopError(msg);
        return;
      }
      append('ok', `200 OK · renders submitted: ${(data.renderIds as string[]).join(', ')}`);
      if (data.emailQueued) append('sys', 'background email task queued (Resend)');
      else append('sys', 'no MERCHANT_EMAIL configured — email skipped');

      const initial: WebhookRenderState[] = (data.renderIds as string[]).map((renderId) => ({
        renderId,
        status: 'queued',
      }));
      setRenders(initial);
      setPhase('polling');
      append('sys', 'polling /api/status every 2.5s …');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setPhase('error');
      append('err', `network error: ${msg}`);
      setTopError(msg);
    }
  };

  const indicator: 'idle' | 'send' | 'wait' | 'done' | 'err' =
    phase === 'idle' ? 'idle' :
    phase === 'sending' ? 'send' :
    phase === 'polling' ? 'wait' :
    phase === 'done' ? 'done' : 'err';

  const phaseLabel = {
    idle: 'standby',
    sending: 'dispatching',
    polling: 'rendering',
    done: 'complete',
    error: 'error',
  }[phase];

  const placeholderRenders: Array<WebhookRenderState | null> = renders.length > 0
    ? renders
    : [null, null, null];

  return (
    <section id="webhook" className="relative border-t border-line">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-[0.5]"/>
      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <SectionEyebrow icon={<IBolt size={13} className="text-brand-soft"/>}>
              Manual dispatch
            </SectionEyebrow>
            <h2 className="mt-3 font-display text-[34px] sm:text-[42px] leading-[1.05] tracking-tight">
              Fire a webhook. <span className="text-gradient-violet">Watch it land.</span>
            </h2>
            <p className="mt-3 text-[14px] text-white/60 max-w-xl">
              Post a synthetic Shopify <span className="font-mono text-brand-soft">product.created</span> payload
              straight to <span className="font-mono text-white/85">/api/webhook</span> and observe the pipeline in real time.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/45 uppercase tracking-[0.2em]">
            <ITerminal size={13} className="text-brand-soft"/> dev console
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 rounded-2xl border border-line bg-card/80 backdrop-blur p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-line">
              <span className="inline-flex items-center font-mono text-[10.5px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-md bg-brand/10 text-brand-soft border border-brand/25">
                POST
              </span>
              <span className="font-mono text-[12.5px] text-white/85">/api/webhook</span>
              <button
                type="button"
                onClick={useSample}
                className="ml-auto text-[11.5px] font-mono text-white/55 hover:text-brand-soft transition-colors"
              >
                use sample ↺
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel idx="01">Product title</FieldLabel>
                <input className={inputCls} value={form.title} onChange={update('title')} placeholder="Air Jordan 1 Retro High OG"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel idx="02">Vendor</FieldLabel>
                  <input className={inputCls} value={form.vendor} onChange={update('vendor')} placeholder="Test Store"/>
                </div>
                <div>
                  <FieldLabel idx="03" hint="number">Price</FieldLabel>
                  <input className={inputCls} value={form.price} onChange={update('price')} placeholder="180.00" inputMode="decimal"/>
                </div>
              </div>

              <div>
                <FieldLabel idx="04">Description</FieldLabel>
                <textarea
                  className={`${inputCls} resize-none h-[88px] py-2.5`}
                  value={form.description}
                  onChange={update('description')}
                  placeholder="The iconic sneaker that changed basketball forever…"
                />
              </div>

              <div>
                <FieldLabel idx="05" hint="must end in .jpg / .png / .webp">Image URLs · up to 3</FieldLabel>
                <div className="space-y-2">
                  <input className={inputCls} value={form.image1} onChange={update('image1')} placeholder="https://…/photo-1.jpg"/>
                  <input className={inputCls} value={form.image2} onChange={update('image2')} placeholder="https://…/photo-2.jpg"/>
                  <input className={inputCls} value={form.image3} onChange={update('image3')} placeholder="https://…/photo-3.jpg"/>
                </div>
              </div>

              <div>
                <FieldLabel idx="06" hint="optional · overrides server env">Gemini API key</FieldLabel>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-10`}
                    type={showKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza…"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/45 hover:text-white"
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <IEyeOff size={14}/> : <IEye size={14}/>}
                  </button>
                </div>
              </div>
            </div>

            {topError && (
              <div className="mt-5 flex items-start gap-2 rounded-md border border-rose/40 bg-rose/10 px-3 py-2 text-[12.5px] text-rose">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] mt-0.5">err</span>
                <span className="flex-1">{topError}</span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={dispatch}
                disabled={phase === 'sending' || phase === 'polling'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-medium text-white bg-brand hover:bg-brand-hover shadow-glow-sm hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ISend size={14}/>
                {phase === 'sending' ? 'Dispatching…' : phase === 'polling' ? 'Rendering…' : 'Dispatch webhook'}
                {phase !== 'sending' && phase !== 'polling' && <IArrow size={14} className="-mr-0.5"/>}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] text-white/60 hover:text-white border border-line hover:border-line2 transition-colors"
              >
                <IRefresh size={13}/> Reset
              </button>
              <span className="ml-auto inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                <StatusDot state={indicator}/> {phaseLabel}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-line bg-panel overflow-hidden">
              <div className="px-4 h-10 border-b border-line bg-[#0a0b10] flex items-center gap-2">
                <ITerminal size={13} className="text-brand-soft"/>
                <span className="font-mono text-[11.5px] text-white/55 tracking-[0.18em] uppercase">telemetry</span>
                <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] text-white/45">
                  <StatusDot state={indicator}/>
                  {phase === 'polling' ? `${renders.filter((r) => r.status === 'done').length}/${renders.length} ready` : phaseLabel}
                </span>
              </div>
              <div
                ref={logScrollRef}
                className="max-h-[220px] overflow-y-auto p-4 font-mono text-[12px] leading-[1.65] scanlines"
              >
                {logs.map((l, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-white/30 select-none tabular-nums">{l.t}</span>
                    <span className={
                      l.level === 'ok'  ? 'text-ok' :
                      l.level === 'err' ? 'text-rose' :
                                          'text-white/70'
                    }>
                      {l.level === 'sys' ? '·' : l.level === 'ok' ? '✓' : '✕'} {l.msg}
                    </span>
                  </div>
                ))}
                {phase === 'polling' && (
                  <div className="flex gap-3 pt-1">
                    <span className="text-white/30 select-none tabular-nums">{nowStamp()}</span>
                    <span className="shimmer-text">awaiting render completion…</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {placeholderRenders.map((r, i) => {
                const label = TEMPLATE_LABELS[i];
                if (!r) {
                  return (
                    <div key={i} className="rounded-xl border border-line bg-card/60 p-4 min-h-[150px] flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-display text-[13.5px] text-white/55">{label}</span>
                      </div>
                      <div className="mt-auto pt-4">
                        <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                          <div className="h-full bg-white/15" style={{ width: '4%' }}/>
                        </div>
                        <div className="mt-2 font-mono text-[10px] text-white/30 uppercase tracking-[0.18em]">awaiting dispatch</div>
                      </div>
                    </div>
                  );
                }
                const pct = r.status === 'done' ? 100 :
                  r.status === 'failed' ? 100 :
                  STATUS_PROGRESS[r.status] ?? 8;
                const barCls = r.status === 'failed' ? 'bg-rose' : r.status === 'done' ? 'bg-ok' : 'bg-gradient-to-r from-brand to-violet';
                return (
                  <div key={r.renderId} className={`rounded-xl border bg-card p-4 min-h-[150px] flex flex-col card-hover ${
                    r.status === 'done' ? 'border-ok/30' : r.status === 'failed' ? 'border-rose/35' : 'border-line'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-white/40 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-[13.5px] text-white">{label}</span>
                      <span className="ml-auto"><RenderStatusPill status={r.status}/></span>
                    </div>
                    <div className="mt-3 font-mono text-[10px] text-white/30 break-all">id · {r.renderId.slice(0, 8)}…{r.renderId.slice(-4)}</div>
                    <div className="mt-auto pt-4">
                      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className={`h-full ${barCls} transition-[width] duration-700 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {r.status === 'done' && r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-soft hover:text-white transition-colors"
                        >
                          <IDownload size={12}/> open video
                        </a>
                      )}
                      {r.status === 'failed' && (
                        <div className="mt-3 font-mono text-[10.5px] text-rose/85 line-clamp-2">
                          {r.error || 'render failed'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-line bg-[#0a0b10]/60 px-4 py-3 flex items-start gap-3">
              <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber/15 text-amber border border-amber/30">
                <IBolt size={11}/>
              </span>
              <div className="text-[12px] text-white/55 leading-relaxed">
                The UI uses <span className="font-mono text-white/80">x-test-mode: 1</span> so the route returns
                <span className="font-mono text-white/80"> renderIds</span> for live polling. Real Shopify webhooks
                hit the same endpoint without that header — they get a fast 200 and the email lands when the
                renders finish in the background.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── SCRAPE SECTION ─────────────────────────────────────────────
type ScrapeStep = 'input' | 'rendering' | 'done';

interface ScrapedProduct {
  title: string;
  vendor: string;
  price: string;
  imageCount: number;
  sourceUrl: string;
}

const SAMPLE_SCRAPE_URLS = [
  'https://www.allbirds.com/products/mens-tree-runners',
  'https://us.gymshark.com/products/gymshark-arrival-shorts-black-ss22',
  'https://www.deathwishcoffee.com/products/death-wish-ground-coffee',
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
              Works with any public Shopify store. We hit the storefront <span className="font-mono text-white/75">/products/&lt;handle&gt;.json</span> endpoint, run Gemini analysis on the product, then render the Cinematic Showcase template. No auth, no setup.
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

export default function Home() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar/>
      <main>
        <Hero/>
        <HowItWorks/>
        <DemoSection/>
        <ScrapeSection/>
        <WebhookTester/>
        <ChatSection/>
        <SetupSection/>
        <Waitlist/>
      </main>
      <Footer/>
    </div>
  );
}
