// components/sites/analytical-register/charts/MultiLine.tsx
'use client';
import { useState } from 'react';
import { shortDate } from '../analytics';

const PALETTE = ['var(--ob-accent)', '#7BA05B', '#D9A441', '#6C7B8A', '#9C6ADE'];

type Props = {
  dates: string[];
  series: { name: string; values: number[] }[];
  format?: (n: number) => string;
  width?: number;
  height?: number;
};

/**
 * Categories over time. Hovering drops a crosshair and lists every line's value
 * for that date; tapping a legend entry takes that line out of the plot so the
 * remaining ones can be read at scale.
 */
export function MultiLine({ dates, series, format = (n) => String(n), width = 560, height = 200 }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [muted, setMuted] = useState<string[]>([]);
  if (dates.length < 2 || series.length === 0) {
    return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;
  }
  const pad = 24;
  const shown = series.filter((s) => !muted.includes(s.name));
  const max = Math.max(1, ...shown.flatMap((s) => s.values));
  const step = (width - pad * 2) / (dates.length - 1);
  const x = (i: number) => pad + i * step;
  const pts = (values: number[]) =>
    values.map((v, i) => `${x(i).toFixed(1)} ${(height - pad - (v / max) * (height - pad * 2)).toFixed(1)}`);
  const read = active ?? dates.length - 1;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full ob-chart"
        role="group"
        tabIndex={0}
        aria-label="Revenue by category, day by day. Use the arrow keys to read a date."
        onPointerLeave={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); setActive(Math.min(dates.length - 1, read + 1)); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(Math.max(0, read - 1)); }
          else if (e.key === 'Escape') setActive(null);
        }}
      >
        {active !== null && (
          <line
            x1={x(active)} y1={pad / 2} x2={x(active)} y2={height - pad}
            stroke="var(--ob-accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6}
          />
        )}
        {series.map((s, si) => {
          if (muted.includes(s.name)) return null;
          const colour = PALETTE[si % PALETTE.length];
          const value = s.values[read];
          return (
            <g key={s.name}>
              <polyline points={pts(s.values).join(' ')} fill="none" stroke={colour} strokeWidth={2} />
              {active !== null && (
                <circle cx={x(active)} cy={height - pad - (value / max) * (height - pad * 2)} r={3.5} fill={colour} />
              )}
            </g>
          );
        })}
        {dates.map((d, i) => (
          <rect
            key={d}
            x={x(i) - step / 2} y={0} width={step} height={height}
            fill="transparent"
            onPointerEnter={() => setActive(i)}
          />
        ))}
      </svg>
      <p className="mt-1 text-sm tabular-nums" aria-live="polite">
        <b className="ob-accent-text">{shortDate(dates[read])}</b>
        {shown.length === 0
          ? ' — all lines hidden'
          : shown
              .map((s) => ` · ${s.name} ${format(s.values[read])}`)
              .join('')}
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm">
        {series.map((s, si) => (
          <li key={s.name}>
            <button
              type="button"
              onClick={() => setMuted((m) => (m.includes(s.name) ? m.filter((n) => n !== s.name) : [...m, s.name]))}
              aria-pressed={!muted.includes(s.name)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 ${muted.includes(s.name) ? 'text-[var(--ob-muted)] line-through' : 'ob-chip ob-chip-on'}`}
            >
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: muted.includes(s.name) ? 'var(--ob-line)' : PALETTE[si % PALETTE.length] }}
              />
              {s.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
