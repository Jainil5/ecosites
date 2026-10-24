'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { symbolToSlug } from './data';
import type { Scorecard, WindowKey } from './analytics';
import { inr, mcapLabel, pct } from './format';

/** Section title + muted subtitle, with a right-hand slot for the live meta. */
export function SectionHead({
  title,
  blurb,
  aside,
}: {
  title: string;
  blurb: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mps-head mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-mono text-xl tracking-tight text-[#E7EEF9] sm:text-2xl">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8A98B0]">{blurb}</p>
      </div>
      {aside}
    </div>
  );
}

/** The one panel style: rounded plate, hairline border, optional header row. */
export function Panel({
  title,
  sub,
  aside,
  children,
  className = '',
}: {
  title?: string;
  sub?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={`mp-lift rounded-xl border border-[#1C2740] bg-[#0A0F1A] p-4 ${className}`}
    >
      {(title || aside) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A98B0]">{title}</h3>
            )}
            {sub && <p className="mt-1 font-mono text-[10px] text-[#5B6B85]">{sub}</p>}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

/** Translucent up/down/flat delta pill — the reference's status chips. */
export function DeltaPill({ value, label }: { value: number | null | undefined; label?: string }) {
  const tone = value == null ? 'flat' : value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const cls =
    tone === 'up'
      ? 'border-[#16C784]/30 bg-[#16C784]/10 text-[#16C784]'
      : tone === 'down'
        ? 'border-[#EA3943]/30 bg-[#EA3943]/10 text-[#EA3943]'
        : 'border-[#1C2740] bg-[#131C2E] text-[#5B6B85]';
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tabular-nums ${cls}`}>
      {label ?? pct(value)}
    </span>
  );
}

/** Timeframe / filter chip. The active one carries the mps-chip-on underline. */
export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mps-chip${active ? ' mps-chip-on' : ''}`}
    >
      {children}
    </button>
  );
}

/** Signed horizontal bar used for sector rotation: green right, red left. */
export function ReturnBar({ value, max }: { value: number | null; max: number }) {
  const width = value == null || max <= 0 ? 0 : Math.min(Math.abs(value) / max, 1) * 50;
  const up = (value ?? 0) >= 0;
  return (
    <div aria-hidden className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#131C2E]">
      <span className="absolute inset-y-0 left-1/2 w-px bg-[#1C2740]" />
      <span
        className="mps-bar-segment absolute inset-y-0 rounded-full"
        style={{
          left: up ? '50%' : `${50 - width}%`,
          width: `${width}%`,
          background: up ? '#16C784' : '#EA3943',
        }}
      />
    </div>
  );
}

/** 0-100 position meter (52-week range, RSI). */
export function Meter({ value, tone = 'blue' }: { value: number | null; tone?: 'blue' | 'green' | 'amber' }) {
  const color = tone === 'green' ? '#16C784' : tone === 'amber' ? '#F5A623' : '#4DA3FF';
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#131C2E]">
      <span
        className="mps-bar-segment absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${value ?? 0}%`, background: color }}
      />
    </div>
  );
}

/** Ranked stock row: rank, symbol/name link, price, delta over the chosen window. */
export function StockRow({
  card,
  rank,
  value,
  windowKey,
}: {
  card: Scorecard;
  rank: number;
  value: number | null;
  windowKey: WindowKey;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-[#5B6B85]">{rank}</span>
      <Link
        href={`/stock-screener/${symbolToSlug(card.symbol)}`}
        className="focus-ring inline-flex min-h-10 min-w-0 flex-1 flex-col justify-center rounded"
      >
        <span className="block truncate font-mono text-xs text-[#E7EEF9] transition-colors hover:text-[#16C784]">
          {card.symbol.replace('.NS', '')}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[#5B6B85] sm:text-[10px]">
          {card.name} · {card.sector}
        </span>
      </Link>
      <span className="hidden shrink-0 text-right font-mono text-[11px] text-[#8A98B0] sm:block">
        {inr(card.price)}
      </span>
      <span className="shrink-0 text-right">
        <DeltaPill value={value} />
        <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-wider text-[#5B6B85]">
          {windowKey}
        </span>
      </span>
    </li>
  );
}

export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-[#131C2E]" />
      ))}
    </div>
  );
}

export function FailedNote({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-[#EA3943]/40 bg-[#EA3943]/10 px-3 py-2 font-mono text-[11px] text-[#EA3943]">
      {text}
    </p>
  );
}

/** "Showing N · as of …" table footer, quiet and monospaced. */
export function ResultFoot({ count, asOf, noun }: { count: number; asOf?: number; noun: string }) {
  return (
    <p className="mt-3 font-mono text-[10px] text-[#5B6B85]">
      Showing {count} {noun}
      {asOf ? ` · swept ${new Date(asOf).toLocaleTimeString('en-IN', { hour12: false })}` : ''}
    </p>
  );
}

export function StockCell({ card }: { card: Scorecard }) {
  return (
    <Link
      href={`/stock-screener/${symbolToSlug(card.symbol)}`}
      className="focus-ring inline-flex min-h-10 flex-col justify-center rounded font-mono text-xs text-[#E7EEF9] transition-colors hover:text-[#16C784]"
    >
      {card.symbol.replace('.NS', '')}
      <span className="mt-0.5 block truncate text-[11px] font-normal text-[#5B6B85] sm:text-[10px]">
        {mcapLabel(card.mcapCr)}
      </span>
    </Link>
  );
}
