// components/sites/analytical-register/charts/Donut.tsx
'use client';
import { useState } from 'react';

const PALETTE = ['var(--ob-accent)', '#7BA05B', '#D9A441', '#6C7B8A', '#B5651D', '#9C6ADE'];

type Props = {
  data: { name: string; value: number }[];
  format?: (n: number) => string;
  /** The active category — clicking the ring or the legend sets it. */
  active?: string | null;
  onPick?: (name: string) => void;
};

/**
 * Category mix. The ring is the filter: read a slice by pointing at it, click it
 * and the whole report re-scopes to that category. Centre shows the share of
 * whatever is under the cursor, or the total when nothing is.
 */
export function Donut({ data, format = (n) => String(n), active, onPick }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const focus = hover ?? active ?? null;
  const read = data.find((d) => d.name === focus);
  let acc = 0;
  const segs = data.map((d, i) => {
    const start = (acc / total) * 2 * Math.PI;
    acc += d.value;
    const end = (acc / total) * 2 * Math.PI;
    return { d, colour: PALETTE[i % PALETTE.length], start, end };
  });
  const arc = (a: number, b: number) => {
    const r = 60, cx = 70, cy = 70;
    const large = b - a > Math.PI ? 1 : 0;
    return `M ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(b)} ${cy + r * Math.sin(b)}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 140 140" width={140} height={140} role="img" aria-label="Category mix">
        {segs.map((s) => (
          <path
            key={s.d.name}
            d={arc(s.start, s.end)}
            stroke={s.colour}
            strokeWidth={active === s.d.name ? 22 : 18}
            fill="none"
            opacity={active && active !== s.d.name ? 0.3 : 1}
            className={onPick ? 'ob-hit' : undefined}
            onPointerEnter={() => setHover(s.d.name)}
            onPointerLeave={() => setHover(null)}
            onClick={() => onPick?.(s.d.name)}
          >
            <title>{`${s.d.name}: ${format(s.d.value)} — click to filter`}</title>
          </path>
        ))}
        <text x={70} y={66} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ob-ink)">
          {read ? format(read.value) : format(total)}
        </text>
        <text x={70} y={82} textAnchor="middle" fontSize={9} fill="var(--ob-muted)">
          {read ? `${read.name} ${Math.round((read.value / total) * 100)}%` : 'all categories'}
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1 text-sm">
        {data.map((d, i) => (
          <li key={d.name}>
            <button
              type="button"
              onClick={() => onPick?.(d.name)}
              aria-pressed={active === d.name}
              className={`ob-chip${active === d.name ? ' ob-chip-on' : ''}`}
              onPointerEnter={() => setHover(d.name)}
              onPointerLeave={() => setHover(null)}
            >
              <span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="min-w-0 flex-1 truncate">{d.name}</span>
              <span className="tabular-nums text-[var(--ob-muted)]">{Math.round((d.value / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="w-full text-sm tabular-nums" aria-live="polite">
        {read
          ? <><b className="ob-accent-text">{read.name}</b> {format(read.value)} · {Math.round((read.value / total) * 100)}% of the book</>
          : <span className="text-[var(--ob-muted)]">{format(total)} across {data.length} categories — click a slice to filter the report</span>}
      </p>
    </div>
  );
}
