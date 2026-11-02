// components/sites/analytical-register/charts/Column.tsx
'use client';
import type { KeyboardEvent } from 'react';

type Props = {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
  /** Clicking a bar calls this; the page decides what selecting one means. */
  onSelect?: (label: string) => void;
  selected?: string | null;
  width?: number;
  height?: number;
};

export function Column({ data, format = (n) => String(n), onSelect, selected, width = 560, height = 220 }: Props) {
  if (data.length === 0) return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;
  const pad = { top: 18, bottom: 28, side: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (width - pad.side * 2) / data.length;
  const best = data.reduce((b, d, i) => (d.value > data[b].value ? i : b), 0);
  const enter = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
  };
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role={onSelect ? 'group' : 'img'}
      aria-label={onSelect ? 'Sales by period. Select a bar to read it.' : 'Sales by period'}
    >
      {data.map((d, i) => {
        const h = (d.value / max) * (height - pad.top - pad.bottom);
        const x = pad.side + i * step + step * 0.18;
        const y = height - pad.bottom - h;
        const w = step * 0.64;
        const on = selected === d.label;
        const fill = on || i === best ? 'var(--ob-accent)' : 'color-mix(in srgb, var(--ob-accent) 35%, transparent)';
        return (
          <g
            key={d.label}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-pressed={onSelect ? on : undefined}
            className={onSelect ? 'ob-bar' : undefined}
            onClick={() => onSelect?.(d.label)}
            onKeyDown={onSelect ? enter(() => onSelect?.(d.label)) : undefined}
          >
            <rect x={x} y={y} width={w} height={Math.max(h, d.value > 0 ? 2 : 0)} rx={3} fill={fill} />
            {/* A hit strip down the full height: a short bar is still easy to
                point at on a phone. */}
            <rect x={pad.side + i * step} y={0} width={step} height={height} fill="transparent" />
            <text x={x + w / 2} y={height - 10} textAnchor="middle" fontSize={11} fontWeight={on ? 700 : 400} fill="var(--ob-muted)">
              {d.label}
            </text>
            {d.value > 0 && (
              <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize={10} fill="var(--ob-muted)">
                {format(d.value)}
              </text>
            )}
            <title>{`${d.label}: ${format(d.value)}${onSelect ? ' — select' : ''}`}</title>
          </g>
        );
      })}
    </svg>
  );
}
