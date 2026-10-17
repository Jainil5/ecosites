'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SECTIONS } from './sections';
import { IndexStrip, INDEX_SYMBOLS } from './IndexStrip';
import { useLiveTicks } from './useLiveTicks';
import { navigateWithViewTransition } from './motion/navigate';

/**
 * The site chrome every Market Pulse page rides on: ambient stage, masthead,
 * section tabs, live index band and the credit footer. It lives in the route
 * layout, so switching tabs never restarts the index stream.
 */
export function MarketShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ticks, live, lastTickAt } = useLiveTicks(INDEX_SYMBOLS);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const agoTick = lastTickAt ? Math.max(0, Math.round((clock - lastTickAt) / 1000)) : null;

  return (
    <div className="relative min-h-screen bg-[#04060B] text-[#E7EEF9]">
      <div aria-hidden className="mp-bg">
        <div className="mp-bg-grid" />
        <div
          className="mp-glow mp-glow-a"
          style={{ left: '-12rem', top: '-10rem', background: 'radial-gradient(circle, rgba(22,199,132,0.55), transparent 65%)' }}
        />
        <div
          className="mp-glow mp-glow-b"
          style={{ right: '-16rem', top: '30%', background: 'radial-gradient(circle, rgba(77,163,255,0.45), transparent 65%)' }}
        />
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <header className="mp-scene mb-5">
          <div className="mp-rise mp-lift mp-lift-soft relative flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#1C2740]/70 bg-[#0A0F1A]/60 px-5 py-4 backdrop-blur-sm">
            <div>
              <h1 className="flex items-center gap-3 font-mono text-2xl tracking-tight">
                <span className="relative flex h-3 w-3" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16C784] opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#16C784]" />
                </span>
                <span className="slice">
                  <span className="slice-inner">Market Pulse</span>
                </span>
              </h1>
              <p className="mt-1 font-mono text-xs text-[#5B6B85]">
                NSE market terminal · live prices, news, analysis and trends
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2 font-mono text-[11px] text-[#8A98B0]">
              {live ? (
                <span className="relative flex h-2.5 w-2.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16C784] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16C784]" />
                </span>
              ) : (
                <RefreshCw aria-hidden className="h-3.5 w-3.5 text-[#16C784]" />
              )}
              {live
                ? agoTick == null
                  ? 'live feed connecting…'
                  : `LIVE · ticked ${agoTick}s ago`
                : 'NSE closed · last session data'}
            </div>
          </div>

          <nav aria-label="Market Pulse sections" className="mps-tabs mp-rise" style={{ '--d': '120ms' } as React.CSSProperties}>
            {SECTIONS.map((section) => {
              const active = section.exact
                ? pathname === section.href
                : pathname === section.href || pathname.startsWith(`${section.href}/`);
              return (
                <Link
                  key={section.key}
                  href={section.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateWithViewTransition(() => router.push(section.href));
                  }}
                  className={`mps-tab${active ? ' mps-tab-on' : ''}`}
                  title={section.blurb}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <IndexStrip ticks={ticks} />

        {children}

        <footer className="mt-8 border-t border-[#131C2E] pt-5 font-mono text-[10px] leading-relaxed text-[#3D4C68]">
          <p>
            Prices stream from Yahoo Finance’s public endpoints; fundamentals (P/E, market cap, dividend,
            EPS) are reference data refreshed on a schedule. Not investment advice.
          </p>
          <p className="mt-2">
            <Link
              href="/"
              className="focus-ring rounded transition-colors hover:text-[#16C784]"
            >
              Market Pulse · a live terminal built by Website IN
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
