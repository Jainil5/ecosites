// components/sites/analytical-register/charts/MultiLine.tsx
const PALETTE = ['var(--ob-accent)', '#7BA05B', '#D9A441', '#6C7B8A', '#9C6ADE'];

type Props = {
  dates: string[];
  series: { name: string; values: number[] }[];
  width?: number;
  height?: number;
};

export function MultiLine({ dates, series, width = 560, height = 200 }: Props) {
  if (dates.length < 2 || series.length === 0) {
    return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;
  }
  const pad = 24;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const step = (width - pad * 2) / (dates.length - 1);
  const pts = (values: number[]) =>
    values.map((v, i) => `${(pad + i * step).toFixed(1)} ${(height - pad - (v / max) * (height - pad * 2)).toFixed(1)}`);
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Revenue by category">
        {series.map((s, si) => (
          <polyline
            key={s.name}
            points={pts(s.values).join(' ')}
            fill="none"
            stroke={PALETTE[si % PALETTE.length]}
            strokeWidth={2}
          />
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {series.map((s, si) => (
          <li key={s.name} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE[si % PALETTE.length] }} />
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
