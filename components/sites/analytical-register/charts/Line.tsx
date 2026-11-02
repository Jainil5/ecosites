// components/sites/analytical-register/charts/Line.tsx
'use client';
import { useState } from 'react';
import { shortDate } from '../analytics';

type Point = { date: string; revenue: number; orders?: number };

type Props = {
  data: Point[];
  format?: (n: number) => string;
  /** Pinned day. The chart owns hover; the page owns the pin, so the day panel
   *  below can read from the same value. */
  selected?: string | null;
  onSelect?: (date: string) => void;
  width?: number;
  height?: number;
};

/**
 * The revenue line, but as an instrument rather than a picture: sweep it and a
 * crosshair follows with that day's take and bill count; click (or focus it and
 * press Enter) and the day pins, opening the day panel underneath.
 */
export function Line({ data, format = (n) => String(n), selected, onSelect, width = 560, height = 200 }: Props) {
  const [active, setActive] = useState<number | null>(null);
  if (data.length === 0) return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;

  const pad = 24;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const x = (i: number) => pad + i * step;
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);
  const pts = data.map((d, i) => [x(i), y(d.revenue)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${(width - pad).toFixed(1)} ${height - pad} L${pad} ${height - pad} Z`;

  const selectedIndex = selected ? data.findIndex((d) => d.date === selected) : -1;
  const shown = active ?? (selectedIndex >= 0 ? selectedIndex : data.length - 1);
  const point = data[shown];
  const cursor = pts[shown];

  const move = (delta: number) => {
    const next = Math.min(data.length - 1, Math.max(0, (active ?? shown) + delta));
    setActive(next);
  };

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full ob-chart"
        role="group"
        tabIndex={0}
        aria-label="Revenue by day. Use the arrow keys to read a day, Enter to pin it."
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(data[shown].date); }
          else if (e.key === 'Escape') setActive(null);
        }}
        onPointerLeave={() => setActive(null)}
      >
        <path d={area} fill="color-mix(in srgb, var(--ob-accent) 12%, transparent)" stroke="none" />
        <path d={path} fill="none" stroke="var(--ob-accent)" strokeWidth={2} />
        {/* Crosshair on whatever is being read, plus its dot. */}
        <line
          x1={cursor[0]} y1={pad / 2} x2={cursor[0]} y2={height - pad}
          stroke="var(--ob-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={active === null && selectedIndex < 0 ? 0 : 0.6}
        />
        <circle cx={cursor[0]} cy={cursor[1]} r={4.5} fill="var(--ob-card)" stroke="var(--ob-accent)" strokeWidth={2} />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 1.5} fill="var(--ob-accent)" opacity={0.8} />
        ))}
        {/* Invisible hit slices: one per day, so a sweep needs no coordinate maths. */}
        {data.map((d, i) => (
          <rect
            key={d.date}
            x={x(i) - step / 2} y={0} width={step} height={height}
            fill="transparent"
            className={onSelect ? 'ob-hit' : undefined}
            onPointerEnter={() => setActive(i)}
            onClick={() => onSelect?.(d.date)}
          />
        ))}
      </svg>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" aria-live="polite">
        <b className="ob-accent-text">{shortDate(point.date)}</b>
        <span className="tabular-nums font-semibold">{format(point.revenue)}</span>
        {point.orders !== undefined && <span className="text-[var(--ob-muted)] tabular-nums">{point.orders} bills</span>}
        <span className="text-[var(--ob-muted)] text-xs">
          {selectedIndex >= 0 ? (selected === point.date ? ' — pinned, click again to clear' : ' click to pin this day') : ' hover to read, click to pin'}
        </span>
      </p>
    </div>
  );
}
