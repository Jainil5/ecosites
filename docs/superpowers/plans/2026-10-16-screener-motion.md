# Market Pulse motion redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a motion-designed per-stock page at `/stock-screener/[symbol]` and a full animation pass (framer-motion + CSS 3D + View Transitions) to the Market Pulse screener.

**Architecture:** Three shared motion primitives (`Tilt3D`, `AnimatedNumber`, `Reveal`) built on a central easing-token file drive all animation; a new static per-symbol route reuses the existing client hooks and API routes; the main screener's inline expand and chart selection are replaced by navigation, with the heatmap cell morphing into the detail hero via the View Transitions API.

**Tech Stack:** Next.js 15 App Router (static params), React 19, Tailwind, framer-motion v12 (only new dependency), lightweight-charts (unchanged), vitest (node environment — no jsdom, no @testing-library; component behavior is verified via build + browser).

**Spec:** `docs/superpowers/specs/2026-10-16-screener-motion-design.md`

## Global Constraints

- Add exactly one dependency: `framer-motion@^12`. No three.js, no new API routes, no jsdom/testing-library.- Never use library-default easings. Every animation pulls timing from `motion/tokens.ts` (values below are verbatim from the spec's easing table).
- `prefers-reduced-motion` collapses: springs → direct sets, entrances → 120ms fades, layout reorder → instant, view transitions → `animation: none`.
- All same-kind content stays visible — no tab controls anywhere on the new page.
- No "Pune" or local-venue wording in any rendered string (project positioning rule).
- Keep the existing `mp-*` CSS keyframes (grid crawl, price flash, sheen, ping dot) — do not port them to JS.
- `view-transition-name` values must be unique within a page: the **heatmap cell** owns `stock-<slug>` on the screener; table price cells deliberately do NOT (duplicate names break the morph).
- Two deliberate deviations from the spec: (a) spec §4 gave table price cells a `view-transition-name` too — dropped here because a row and a heatmap cell for the same symbol would collide on one page; (b) spec §4 said "hover tilt" on rows — `transform` on `<tr>` is unreliable across browsers, so rows get hover background elevation only and the tilt budget goes to cards/cells.
- Test command is `npm test` (vitest run, node env). Typecheck: `npx tsc --noEmit`.

## File Structure

```
components/sites/stock-screener/
  motion/
    tokens.ts                    CREATE  easing/spring/duration constants (spec §5)
    AnimatedNumber.tsx           CREATE  spring price counter w/ direction flash
    Reveal.tsx                   CREATE  staggered whileInView entrance
    Tilt3D.tsx                   CREATE  pointer-parallax perspective + glow
    navigate.ts                  CREATE  startViewTransition-aware router.push
  data.ts                        MODIFY  + symbolToSlug / stockBySlug / peersFor
  indicators.ts                  MODIFY  + spark1M (moved out of ScreenerTable)
  StockPage.tsx                  CREATE  detail-page client composition root
  StockHero.tsx                  CREATE  hero card (view-transition target)
  Fundamentals.tsx               CREATE  stat-card grid + animated RangeBar
  PeersStrip.tsx                 CREATE  same-sector movers, navigable
  StockNewsSection.tsx           CREATE  per-stock + market news, staggered list
  RangeBar.tsx                   CREATE  extracted from StockDetail
  StockDetail.tsx                DELETE  replaced by the detail page
  ScreenerTable.tsx              MODIFY  rows navigate; AnimatePresence/layout
  Heatmap.tsx                    MODIFY  cells navigate; view-transition-name
  IndexStrip.tsx                 MODIFY  AnimatedNumber prices, Reveal wrapper
  StockScreener.tsx              MODIFY  remove expand/chart state; Reveal + AnimatedNumber on StatCards
app/(sites)/stock-screener/
  page.tsx                       unchanged
  [symbol]/page.tsx              CREATE  server route: static params, metadata, notFound
app/globals.css                  MODIFY  view-transition timing + reduced-motion guards
test/screener-motion.test.ts     CREATE  slugs, peers, spark1M, token values
```

---

### Task 1: Dependency + pure helpers + motion tokens

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `components/sites/stock-screener/data.ts` (append after `capTier`, line ~73)
- Modify: `components/sites/stock-screener/indicators.ts` (append `spark1M`)
- Create: `components/sites/stock-screener/motion/tokens.ts`
- Test: `test/screener-motion.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `symbolToSlug(symbol: string): string` — lowercase, keeps the `.ns` suffix (`RELIANCE.NS` → `reliance.ns`).
  - `stockBySlug(slug: string): StockMeta | undefined`.
  - `peersFor(symbol: string, count?: number): StockMeta[]` — same-sector first, then by descending mcap; never includes `symbol`; default `count = 6`.
  - `spark1M(quote?: ChartPoint): number[]` — moved verbatim from ScreenerTable.tsx:37-48.
  - `SPRINGS`, `EASE`, `DUR` from `motion/tokens.ts` (exact shapes in Step 3).

- [ ] **Step 1: Install framer-motion**

```bash
npm install framer-motion@^12
```
Expected: package.json `dependencies` gains `"framer-motion"`. No other changes.

- [ ] **Step 2: Write the failing tests**

```ts
// test/screener-motion.test.ts
import { describe, expect, it } from 'vitest';
import {
  STOCKS,
  symbolToSlug,
  stockBySlug,
  peersFor,
} from '../components/sites/stock-screener/data';
import { spark1M } from '../components/sites/stock-screener/indicators';
import { SPRINGS, EASE, DUR } from '../components/sites/stock-screener/motion/tokens';

describe('slug helpers', () => {
  it('round-trips every stock symbol', () => {
    for (const s of STOCKS) {
      expect(stockBySlug(symbolToSlug(s.symbol))?.symbol).toBe(s.symbol);
    }
  });
  it('maps BAJAJ-AUTO.NS to bajaj-auto.ns', () => {
    expect(symbolToSlug('BAJAJ-AUTO.NS')).toBe('bajaj-auto.ns');
  });
  it('returns undefined for unknown slugs', () => {
    expect(stockBySlug('NOPE.NS')).toBeUndefined();
  });
});

describe('peersFor', () => {
  it('excludes the symbol itself', () => {
    expect(peersFor('TCS.NS').every((p) => p.symbol !== 'TCS.NS')).toBe(true);
  });
  it('leads with same-sector stocks (IT)', () => {
    const peers = peersFor('TCS.NS', 4);
    expect(peers[0].sector).toBe('IT');
  });
  it('fills up to count when the sector is small', () => {
    expect(peersFor('TCS.NS', 6)).toHaveLength(6);
  });
});

describe('spark1M', () => {
  it('returns [] without closes', () => {
    expect(spark1M(undefined)).toEqual([]);
    expect(spark1M({ symbol: 'X', ok: true })).toEqual([]);
  });
  it('keeps only the last ~31 days and drops null holes', () => {
    const day = 86_400;
    const now = 1_700_000_000;
    const quote = {
      symbol: 'X',
      ok: true,
      timestamps: [now - 40 * day, now - 20 * day, now - day, now],
      closes: [10, null, 12, 13],
    };
    expect(spark1M(quote)).toEqual([12, 13]);
  });
});

describe('motion tokens (spec §5 — keep verbatim if the spec changes)', () => {
  it('springs match the spec table', () => {
    expect(SPRINGS.number).toEqual({ type: 'spring', stiffness: 260, damping: 30, mass: 0.9 });
    expect(SPRINGS.tiltFollow).toEqual({ type: 'spring', stiffness: 120, damping: 14 });
    expect(SPRINGS.tiltReturn).toEqual({ type: 'spring', stiffness: 300, damping: 25 });
    expect(SPRINGS.layout).toEqual({ type: 'spring', stiffness: 350, damping: 34 });
  });
  it('easing + durations match the spec', () => {
    expect(EASE.enter).toEqual([0.16, 1, 0.3, 1]);
    expect(EASE.exit).toEqual([0.4, 0, 1, 1]);
    expect(DUR).toMatchObject({ enter: 0.5, exit: 0.2, fadeLead: 0.18, stagger: 0.05 });
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npm test -- screener-motion` → Expected: FAIL (imports of `symbolToSlug`, `spark1M` from indicators, `motion/tokens` don't resolve).

- [ ] **Step 4: Implement**

`motion/tokens.ts` (durations in **seconds**, framer-motion convention; the CSS morph hardcodes 420ms separately in Task 3):

```ts
// components/sites/stock-screener/motion/tokens.ts
// Single source of truth for timing. No component may hardcode a duration.
export const SPRINGS = {
  /** Price counters — settles ~350ms, no overshoot (prices must never bounce past the true value). */
  number: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  /** Tilt3D while the pointer tracks. */
  tiltFollow: { type: 'spring', stiffness: 120, damping: 14 },
  /** Tilt3D on pointer-leave: snaps back without wobble. */
  tiltReturn: { type: 'spring', stiffness: 300, damping: 25 },
  /** Table row reorder on sort/filter. */
  layout: { type: 'spring', stiffness: 350, damping: 34 },
} as const;

/** framer-motion accepts bezier arrays; CSS strings live in globals.css (keep them in sync). */
export const EASE = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const DUR = {
  enter: 0.5,
  exit: 0.2,
  fadeLead: 0.18,
  stagger: 0.05,
} as const;

/** Shared-element morph target naming: heatmap cell ⇄ detail hero. */
export const vtName = (symbol: string) => `stock-${symbol.toLowerCase()}`;
```

`data.ts` append:

```ts
export function symbolToSlug(symbol: string): string {
  return symbol.toLowerCase();
}

export function stockBySlug(slug: string): StockMeta | undefined {
  const upper = slug.toUpperCase();
  return STOCKS.find((s) => s.symbol === upper);
}

/** Same-sector stocks first (by mcap desc), filled with the largest others. Never includes `symbol`. */
export function peersFor(symbol: string, count = 6): StockMeta[] {
  const self = STOCKS.find((s) => s.symbol === symbol);
  if (!self) return [];
  const byMcap = (a: StockMeta, b: StockMeta) => b.mcapCr - a.mcapCr;
  const same = STOCKS.filter((s) => s.sector === self.sector && s.symbol !== self.symbol).sort(byMcap);
  const rest = STOCKS.filter((s) => s.sector !== self.sector && s.symbol !== self.symbol).sort(byMcap);
  return [...same, ...rest].slice(0, count);
}
```

`indicators.ts` append (needs `import type { ChartPoint } from './types';` at the top):

```ts
/** 1-month daily closes for the sparkline; moved out of ScreenerTable so the detail hero can reuse it. */
export function spark1M(quote?: ChartPoint): number[] {
  const closes = quote?.closes;
  const timestamps = quote?.timestamps;
  if (!closes || !timestamps) return [];
  const lastTs = timestamps[timestamps.length - 1];
  const cutoff = lastTs - 31 * 24 * 3600;
  const out: number[] = [];
  closes.forEach((c, i) => {
    if (c != null && timestamps[i] >= cutoff) out.push(c);
  });
  return out;
}
```

- [ ] **Step 5: Run tests + typecheck**

Run: `npm test -- screener-motion && npx tsc --noEmit` → Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json components/sites/stock-screener/data.ts components/sites/stock-screener/indicators.ts components/sites/stock-screener/motion/tokens.ts test/screener-motion.test.ts
git commit -m "feat(screener): add framer-motion, slug/peers helpers and motion easing tokens"
```

---

### Task 2: Motion primitives (AnimatedNumber, Reveal, Tilt3D, navigate)

**Files:**
- Create: `components/sites/stock-screener/motion/AnimatedNumber.tsx`
- Create: `components/sites/stock-screener/motion/Reveal.tsx`
- Create: `components/sites/stock-screener/motion/Tilt3D.tsx`
- Create: `components/sites/stock-screener/motion/navigate.ts`

**Interfaces:**
- Consumes: `SPRINGS`, `EASE`, `DUR` (Task 1); `inr`, `inrPlain`, `pct`, `compact` from `../format`.
- Produces (used by Tasks 4–6):
  - `<AnimatedNumber value={number|null|undefined} kind={'inrPlain'|'inr'|'compact'|'pct'|'plain'} decimals={2} className? flash />` — renders a formatted string; interpolates with `SPRINGS.number`; applies `mp-flash-up`/`mp-flash-down` class pulse on direction change when `flash` is set.
  - `<Reveal delay={seconds} className? as? >` — wraps children in a `motion.div` with the spec entrance (translate ≤16px, scale 0.98→1, opacity leads), `viewport={{ once: true, amount: 0.25 }}`.
  - `<Tilt3D intensity={deg} glow className?>{children}</Tilt3D>` — perspective wrapper; rotateX/rotateY springs; specular glow follows pointer.
  - `navigateWithViewTransition(push: () => void): void` — wraps `router.push` in `document.startViewTransition` when available and motion is allowed; else calls directly. No Next config flag needed.

- [ ] **Step 1: AnimatedNumber**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useSpring } from 'framer-motion';
import { SPRINGS } from './tokens';
import { compact, inr, inrPlain, pct } from '../format';

export type NumberKind = 'inrPlain' | 'inr' | 'compact' | 'pct' | 'plain';

export interface AnimatedNumberProps {
  value: number | null | undefined;
  kind?: NumberKind;
  decimals?: number;
  className?: string;
  /** Pulse mp-flash-up/down on direction change. Off for derived stats like counts. */
  flash?: boolean;
}

function fmt(v: number, kind: NumberKind, decimals: number): string {
  switch (kind) {
    case 'inrPlain': return inrPlain(v, decimals);
    case 'inr': return inr(v);
    case 'compact': return compact(v);
    case 'pct': return pct(v);
    default: return v.toFixed(decimals);
  }
}

export function AnimatedNumber({ value, kind = 'plain', decimals = 2, className, flash }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const spring = useSpring(value ?? 0, SPRINGS.number);
  const [shown, setShown] = useState(value ?? 0);
  const prevTarget = useRef<number | null>(value ?? null);
  const [dir, setDir] = useState<'up' | 'down' | 'flat'>('flat');

  useEffect(() => {
    if (value == null) return;
    if (prevTarget.current != null && value !== prevTarget.current) {
      setDir(value > prevTarget.current ? 'up' : 'down');
    }
    prevTarget.current = value;
    if (reduced) setShown(value);
    else spring.set(value);
  }, [value, reduced, spring]);

  useEffect(() => spring.on('change', (v) => setShown(v)), [spring]);

  if (value == null) return <span className={className}>—</span>;
  const flashClass = flash && dir !== 'flat' ? (dir === 'up' ? 'mp-flash-up' : 'mp-flash-down') : '';
  return (
    <span aria-hidden={false} key={flash ? value : undefined} className={`${flashClass} rounded ${className ?? ''}`}>
      {fmt(shown, kind, decimals)}
    </span>
  );
}
```

Note: `key={flash ? value : undefined}` restarts the CSS flash animation on each tick — same trick the existing table uses (`ScreenerTable.tsx:159`).

- [ ] **Step 2: Reveal**

```tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE } from './tokens';

export interface RevealProps {
  children: React.ReactNode;
  /** Seconds. Use i * DUR.stagger for sibling rhythm — nothing larger. */
  delay?: number;
  className?: string;
  y?: number;
}

export function Reveal({ children, delay = 0, className, y = 16 }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: DUR.enter,
        ease: EASE.enter,
        delay,
        opacity: { duration: DUR.fadeLead, ease: 'linear' },
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Tilt3D**

```tsx
'use client';

import { useRef } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { SPRINGS } from './tokens';

export interface Tilt3DProps {
  children: React.ReactNode;
  /** Max rotation in degrees. Keep ≤ 8 — data panels must not feel like toys. */
  intensity?: number;
  glow?: boolean;
  className?: string;
}

export function Tilt3D({ children, intensity = 7, glow = true, className }: Tilt3DProps) {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, SPRINGS.tiltFollow);
  const sry = useSpring(ry, SPRINGS.tiltFollow);
  const glowBg = useMotionTemplate`radial-gradient(240px circle at ${gx}% ${gy}%, rgba(77,163,255,0.10), transparent 65%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * intensity * 2);
    rx.set((0.5 - py) * intensity * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const settle = (mv: MotionValue<number>) => animate(mv, 0, SPRINGS.tiltReturn);
  const onLeave = () => {
    settle(rx);
    settle(ry);
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative [perspective:900px] ${className ?? ''}`}
    >
      <motion.div
        style={reduced ? undefined : { rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        className="relative h-full"
      >
        {children}
        {glow && !reduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ backgroundImage: glowBg }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </div>
  );
}
```

The glow uses `useMotionTemplate` (top-level hook) so it tracks the pointer — a `gx.get()`-at-render shortcut would freeze the gradient; do not replace it.

- [ ] **Step 4: navigate.ts**

```ts
export function navigateWithViewTransition(push: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof doc.startViewTransition === 'function' && !reduced) {
    doc.startViewTransition(push);
  } else {
    push();
  }
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint` → Expected: clean. (No DOM test env exists; Tasks 5–6 exercise these in the browser.)

- [ ] **Step 6: Commit**

```bash
git add components/sites/stock-screener/motion/
git commit -m "feat(screener): add Tilt3D, AnimatedNumber, Reveal and view-transition navigation primitives"
```

---

### Task 3: View-transition CSS + hover elevation in globals.css

**Files:**
- Modify: `app/globals.css` (append after the existing `.mp-*` block, ~line 860)

**Interfaces:**
- Consumes: `vtName` naming convention `stock-<lowercase-symbol>` (Task 1).
- Produces: CSS that makes any pair of elements sharing a `view-transition-name` morph at 420ms expo-out; disabled under reduced motion. `.mp-cell-lift` hover treatment for heatmap cells.

- [ ] **Step 1: Append CSS**

```css
/* ---- Screener motion pass: shared-element page morph (View Transitions API) ---- */
::view-transition-group(*) {
  animation-duration: 420ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
::view-transition-old(*),
::view-transition-new(*) {
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}

/* Heatmap cell hover — fake-3D lift, matches .mp-lift energy on smaller targets */
.mp-cell-lift {
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 260ms cubic-bezier(0.16, 1, 0.3, 1);
}
.mp-cell-lift:hover {
  transform: perspective(600px) translate3d(0, -3px, 6px) rotateX(4deg);
  box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.7);
}
```

The `cubic-bezier(0.16,1,0.3,1)` strings here are the CSS mirror of `EASE.enter` from `motion/tokens.ts` — if a future change touches one, touch both. (CSS cannot import the TS token; that is why both exist.)

- [ ] **Step 2: Verify**

Run: `npm run build` → Expected: build succeeds (Tailwind/PostCSS accepts plain CSS additions).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(screener): add view-transition timing and heatmap cell lift CSS"
```

---

### Task 4: The per-stock page — `/stock-screener/[symbol]`

**Files:**
- Create: `app/(sites)/stock-screener/[symbol]/page.tsx`
- Create: `components/sites/stock-screener/RangeBar.tsx` (extract from `StockDetail.tsx:16-38`)
- Create: `components/sites/stock-screener/StockHero.tsx`
- Create: `components/sites/stock-screener/Fundamentals.tsx`
- Create: `components/sites/stock-screener/StockNewsSection.tsx`
- Create: `components/sites/stock-screener/PeersStrip.tsx`
- Create: `components/sites/stock-screener/StockPage.tsx`

**Interfaces:**
- Consumes: `StockMeta`, `peersFor`, `symbolToSlug`, `stockBySlug`, `vtName` (Task 1); `Tilt3D`, `AnimatedNumber`, `Reveal`, `navigateWithViewTransition` (Task 2); existing `ChartPanel`, `Sparkline`, `NewsList`, `useStocks`, `useLiveTicks`, `useStockNews`, `useMarketNews`, `indicators` (`rsi`, `rsiLabel`, `lastSma`, `trendSignal`, `spark1M`), `format`.
- Produces: route `/stock-screener/<lowercase-symbol>` (statically generated for all 52 stocks) and `<StockPage meta={StockMeta} />` used by Task 6 only as a navigation target.

- [ ] **Step 1: Server route**

```tsx
// app/(sites)/stock-screener/[symbol]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { STOCKS, stockBySlug, symbolToSlug } from '@/components/sites/stock-screener/data';
import { StockPage } from '@/components/sites/stock-screener/StockPage';

export function generateStaticParams() {
  return STOCKS.map((s) => ({ symbol: symbolToSlug(s.symbol) }));
}

type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const meta = stockBySlug(symbol);
  if (!meta) return { title: 'Stock not found — Market Pulse' };
  return {
    title: `${meta.name} — Market Pulse`,
    description: `Live ${meta.name} (${meta.symbol.replace('.NS', '')}) price, chart, fundamentals, news and sector peers on the Market Pulse NSE screener.`,
  };
}

export default async function StockRoute({ params }: Props) {
  const { symbol } = await params;
  const meta = stockBySlug(symbol);
  if (!meta) notFound();
  return <StockPage meta={meta} />;
}
```

Also add `export const dynamicParams = false;` (only our 52 stocks exist; unknown slugs hit notFound at build-time param check).

- [ ] **Step 2: Extract RangeBar into its own file**

Copy `RangeBar` verbatim from `StockDetail.tsx:16-38` into `RangeBar.tsx` (add `'use client';` and export). Then extend it with the entrance animation: wrap the marker div in framer-motion `motion.div` whose `initial={{ left: '0%' }}` animates to the computed `left` with `SPRINGS.number` when `useInView` (framer-motion) first reports visible; reduced motion skips to the final position immediately. Do NOT delete `StockDetail.tsx` yet (Task 6 removes it together with its caller).

- [ ] **Step 3: StockHero**

```tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ChartPoint } from './types';
import type { StockMeta } from './data';
import type { LiveTick } from './useLiveTicks';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { Tilt3D } from './motion/Tilt3D';
import { vtName } from './motion/tokens';
import { spark1M } from './indicators';
import { changePct, inr, pct } from './format';
import { Sparkline } from './Sparkline';

export function StockHero({ meta, quote, live }: { meta: StockMeta; quote?: ChartPoint; live?: LiveTick }) {
  const price = live?.price ?? quote?.price;
  const change = changePct(price, quote?.prevClose);
  const tone = change == null ? 'flat' : change >= 0 ? 'up' : 'down';
  const spark = spark1M(quote);
  return (
    <Tilt3D intensity={5} className="mb-5">
      <div
        style={{ viewTransitionName: vtName(meta.symbol) }}
        className="relative overflow-hidden rounded-2xl border border-[#1C2740]/70 bg-[#0A0F1A]/80 px-6 py-6 backdrop-blur-sm"
      >
        {spark.length > 1 && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 opacity-25">
            <Sparkline values={spark} width={960} height={112} />
          </div>
        )}
        <Link href="/stock-screener" className="focus-ring mb-3 inline-flex items-center gap-2 rounded font-mono text-xs text-[#5B6B85] transition-colors hover:text-[#16C784]">
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back to screener
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5B6B85]">{meta.sector} · NSE</p>
        <h1 className="mt-1 font-mono text-3xl tracking-tight">{meta.symbol.replace('.NS', '')}</h1>
        <p className="text-sm text-[#8A98B0]">{meta.name}</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
          <p className="font-mono text-4xl">
            <AnimatedNumber value={price} kind="plain" decimals={2} flash className={tone === 'down' ? 'text-[#EA3943]' : tone === 'up' ? 'text-[#16C784]' : ''} />
          </p>
          <p className={`font-mono text-sm ${tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#5B6B85]'}`}>
            {quote ? pct(change) : '—'}
          </p>
          {quote?.prevClose != null && <p className="font-mono text-[11px] text-[#5B6B85]">prev close {inr(quote.prevClose)}</p>}
        </div>
      </div>
    </Tilt3D>
  );
}
```

`Sparkline` must accept optional `width`/`height` props — if it doesn't yet, add them with defaults matching its current hardcoded size (check `Sparkline.tsx` before editing; keep its existing behavior for table callers).

- [ ] **Step 4: Fundamentals**

`Fundamentals.tsx`: grid of `Reveal`-wrapped stat cards (delay `i * DUR.stagger`) showing P/E, P/B, EPS, dividend yield, market cap (`mcapLabel`), day range (low–high), 52-week `RangeBar`, trend + RSI readouts computed exactly like `StockDetail.tsx:60-68` (`lastSma`, `rsi`, `rsiLabel`, `trendSignal` on `quote.closes`). Card chrome and copy style: reuse the `Stat` markup from `StockDetail.tsx:40-53` inside `<Tilt3D intensity={4}>`. Props: `{ meta: StockMeta; quote?: ChartPoint; live?: LiveTick; loading: boolean }` (render skeleton rows while `loading` and `quote` is undefined).

- [ ] **Step 5: StockNewsSection + PeersStrip**

`StockNewsSection.tsx` — props `{ meta: StockMeta }`; two blocks, both always visible (no tabs): per-stock via `useStockNews(meta.symbol, meta.name)`, market-wide via `useMarketNews()` (brief + list, same markup as `NewsDesk.tsx:36-47`). Render items with `<Reveal delay={i * DUR.stagger} className="mb-2">` wrappers; loading keeps the existing skeleton shimmer pattern (`animate-pulse` rows).

`PeersStrip.tsx` — props `{ meta: StockMeta }`; `peersFor(meta.symbol, 6)`; each peer a `<Tilt3D intensity={6}>` card showing ticker, mcap label, and today's change from a single `useStocks(peerSymbols)` call (memoized array constant to avoid effect loops — same pattern as `SYMBOLS` in `StockScreener.tsx:16`). Click → `navigateWithViewTransition(() => router.push(\`/stock-screener/${symbolToSlug(peer.symbol)}\`))`; card root carries `style={{ viewTransitionName: vtName(peer.symbol) }}`.

- [ ] **Step 6: StockPage composition root**

```tsx
'use client';

import { useMemo } from 'react';
import type { StockMeta } from './data';
import { useStocks } from './useStocks';
import { useLiveTicks } from './useLiveTicks';
import { ChartPanel } from './ChartPanel';
import { StockHero } from './StockHero';
import { Fundamentals } from './Fundamentals';
import { StockNewsSection } from './StockNewsSection';
import { PeersStrip } from './PeersStrip';
import { Reveal } from './motion/Reveal';

export function StockPage({ meta }: { meta: StockMeta }) {
  const symbols = useMemo(() => [meta.symbol], [meta.symbol]);
  const { quotes, loading, failed } = useStocks(symbols);
  const { ticks } = useLiveTicks(symbols);
  const quote = quotes[meta.symbol]?.ok ? quotes[meta.symbol] : undefined;
  const live = ticks[meta.symbol];
  return (
    <div className="relative min-h-screen bg-[#04060B] text-[#E7EEF9]">
      <div aria-hidden className="mp-bg">
        <div className="mp-bg-grid" />
      </div>
      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {failed && (
          <p className="mb-4 rounded-xl border border-[#EA3943]/40 bg-[#EA3943]/10 px-4 py-3 font-mono text-xs text-[#EA3943]">
            Market data is temporarily unavailable from the public feed. Retrying automatically.
          </p>
        )}
        <StockHero meta={meta} quote={quote} live={live} />
        <Reveal><ChartPanel meta={meta} quote={quote} live={live} /></Reveal>
        <Reveal><Fundamentals meta={meta} quote={quote} live={live} loading={loading} /></Reveal>
        <Reveal><StockNewsSection meta={meta} /></Reveal>
        <Reveal><PeersStrip meta={meta} /></Reveal>
      </div>
    </div>
  );
}
```

Note on `refreshKey`: omit it — `ChartPanel` refetches because `useOhlc(meta.symbol, …)` depends on the symbol; inventing a refresh signal (e.g. `Date.now()`) would re-fetch on every render.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm run lint && npm test` → clean/green.
Then `npm run dev -- -p 3001` (his `:3000` is a stale `npm start` build — keep using 3001) and load `http://localhost:3001/stock-screener/reliance.ns`: hero renders with live price animating, chart loads, all five sections visible, peers links work. Check console has no hydration warnings.

- [ ] **Step 8: Commit**

```bash
git add "app/(sites)/stock-screener/[symbol]" components/sites/stock-screener/StockPage.tsx components/sites/stock-screener/StockHero.tsx components/sites/stock-screener/Fundamentals.tsx components/sites/stock-screener/StockNewsSection.tsx components/sites/stock-screener/PeersStrip.tsx components/sites/stock-screener/RangeBar.tsx components/sites/stock-screener/Sparkline.tsx
git commit -m "feat(screener): add animated per-stock page with hero, chart, fundamentals, news and peers"
```

---

### Task 5: Screener table + heatmap navigate (remove expand and main-page chart)

**Files:**
- Modify: `components/sites/stock-screener/ScreenerTable.tsx`
- Modify: `components/sites/stock-screener/Heatmap.tsx`
- Modify: `components/sites/stock-screener/StockScreener.tsx`
- Delete: `components/sites/stock-screener/StockDetail.tsx`

**Interfaces:**
- Consumes: `symbolToSlug` + `vtName` (Task 1), `navigateWithViewTransition` (Task 2).
- Produces: `ScreenerTable` props WITHOUT `expandedSymbol`/`onToggle` (callers must stop passing them); `Heatmap` props `onSelect` renamed to `onNavigate: (symbol: string) => void` semantics unchanged, name applied inside.

- [ ] **Step 1: ScreenerTable navigates**

- Row `<tr onClick>`: replace `onToggle(meta.symbol)` with `navigateWithViewTransition(() => router.push(\`/stock-screener/${symbolToSlug(meta.symbol)}\`))` (`useRouter` from `next/navigation`). Watchlist star keeps `e.stopPropagation()`.
- Delete: the `expandedSymbol`/`onToggle` props, the `expanded` logic, the `Fragment`/expanded `StockDetail` `<tr>` block (lines 122-188 collapse), imports of `StockDetail` and `Fragment`.
- Move `spark1M` usage to the `indicators.ts` import from Task 1 (delete the local copy).
- Add keyboard/reachability: make the symbol cell a real `<Link href={…}>` around the ticker text (rows stay clickable with the link as the focusable affordance; `aria-label="{ticker} — open detail page"`).

- [ ] **Step 2: Heatmap navigates + view-transition-name**

- `onSelect` → same `router.push` pattern; add `style={{ ..., viewTransitionName: vtName(meta.symbol) }}` to each cell button (merge with existing `tileStyle` object). Keep `mp-heat`; add `mp-cell-lift` class (Task 3).
- Remove `selectedSymbol` prop + its border-highlight logic (nothing selects on this page anymore).

- [ ] **Step 3: StockScreener cleanup**

Delete: `expandedSymbol` state, `chartSymbol` state + `focusChart` + `selectForChart` + the localStorage `marketpulse.chart` restore/save block, `ChartPanel` import/usage (the chart now lives per-stock), `ScreenerTable`'s removed props, `Heatmap`'s `selectedSymbol`. Update Heatmap comment/heading if it references chart selection. Do not touch watchlist localStorage.

- [ ] **Step 4: Delete StockDetail.tsx and verify**

```bash
git rm components/sites/stock-screener/StockDetail.tsx
```
`npx tsc --noEmit && npm run lint && npm test` → clean (tsc catches stragglers importing StockDetail).
Browser (dev :3001): table row click AND heatmap click land on `/stock-screener/<slug>`; star toggles don't navigate; `No stocks match` state intact.

- [ ] **Step 5: Commit**

```bash
git add components/sites/stock-screener/ScreenerTable.tsx components/sites/stock-screener/Heatmap.tsx components/sites/stock-screener/StockScreener.tsx
git commit -m "feat(screener): rows and heatmap cells navigate to the per-stock page"
```

---

### Task 6: Motion pass on the main screener

**Files:**
- Modify: `components/sites/stock-screener/ScreenerTable.tsx` (AnimatePresence/layout)
- Modify: `components/sites/stock-screener/IndexStrip.tsx` (AnimatedNumber, Reveal)
- Modify: `components/sites/stock-screener/StockScreener.tsx` (StatCard → AnimatedNumber/Reveal)

**Interfaces:**
- Consumes: Task 2 primitives; `SPRINGS.layout`, `EASE`, `DUR` from tokens.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Animated table**

Rows become `motion.tr` with `layout="position"` (position-only, so column widths never animate — animated table-cell widths smear), `initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0 }}`, wrapped in `<AnimatePresence initial={false}>` inside `<tbody>`; transition `{ layout: SPRINGS.layout, opacity: { duration: DUR.exit, ease: EASE.exit } }`. Drop the per-row `--d` stagger on re-sorts; keep a first-mount-only entrance by leaving `mp-row` off and letting AnimatePresence own it. The LTP cell keeps its existing `mp-flash-*` restart-key trick; wrap the number in `<AnimatedNumber value={price} kind="plain" flash />`.

- [ ] **Step 2: IndexStrip + StatCards**

- IndexStrip: price `<p>` → `<AnimatedNumber value={price} kind="inrPlain" flash />`; change value → `<AnimatedNumber value={change} kind="pct" />`; wrap tiles in `<Reveal delay={i * DUR.stagger}>` instead of `mp-rise`/`--d` (keep `mp-lift`, `mp-scene`).
- StockScreener `StatCard`: `value` stays a string prop (some are tickers); only wrap the card in `<Reveal delay={i * DUR.stagger}>` and replace the 60/120/…360ms `--d` ladder; `Tracked volume` card receives a numeric prop `valueNum` and renders `<AnimatedNumber kind="compact" />` when present.

- [ ] **Step 3: Verify**

`tsc + lint + test` clean. Browser: filter/sort the table — rows glide to new positions (~300ms, individually trackable); removing a filter fades rows in staggered; index prices tick-animate during market hours (or verify with the heatmap: temporarily set a `dir: 'up'` tick in React DevTools if NSE is closed); `Cmd+Shift+P → Emulate prefers-reduced-motion` → everything becomes 120ms fades, no reorder glide.

- [ ] **Step 4: Commit**

```bash
git add components/sites/stock-screener/ScreenerTable.tsx components/sites/stock-screener/IndexStrip.tsx components/sites/stock-screener/StockScreener.tsx
git commit -m "feat(screener): animated row reorder, staggered reveals and live counters"
```

---

### Task 7: End-to-end verification

- [ ] **Step 1:** `npm run test && npx tsc --noEmit && npm run lint && npm run build` → all green; build output must list 52 static `/stock-screener/*` pages.
- [ ] **Step 2:** Browser walkthrough on dev :3001 (Chrome, logged state irrelevant):
  1. `/stock-screener` loads: header → index strip → stat cards → heatmap → table → news reveal in staggered sequence.
  2. Click a heatmap cell: the cell morphs into the detail hero (420ms expo-out), no white flash, background grid stays put.
  3. On the detail page: price counter settles without overshoot; tilt tracks the pointer and snaps back on leave; peers card navigates and morphs to the new hero.
  4. Back button: detail hero morphs back into the originating heatmap cell (View Transitions cover browser back in Chrome; verify).
  5. Unknown slug `/stock-screener/nope.ns` → notFound page, no console error.
  6. Reduced-motion emulation: morphs, tilts, counters and reveals all degrade per the spec guard; page remains fully usable.
  7. Firefox (or disable VT via `document.startViewTransition` absence): navigation still works instantly; in-page motion intact.
- [ ] **Step 3:** Fix any findings in scoped commits (`test(screener)` regression tests / `fix(screener)` changes), then commit final status.
