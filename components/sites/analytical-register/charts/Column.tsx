// components/sites/analytical-register/charts/Column.tsx
type Props = {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
  width?: number;
  height?: number;
};

export function Column({ data, format = (n) => String(n), width = 560, height = 220 }: Props) {
  if (data.length === 0) return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;
  const pad = { top: 18, bottom: 28, side: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (width - pad.side * 2) / data.length;
  const best = data.reduce((b, d, i) => (d.value > data[b].value ? i : b), 0);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Sales by period">
      {data.map((d, i) => {
        const h = (d.value / max) * (height - pad.top - pad.bottom);
        const x = pad.side + i * step + step * 0.18;
        const y = height - pad.bottom - h;
        return (
          <g key={d.label}>
            <rect
              x={x} y={y} width={step * 0.64} height={Math.max(h, d.value > 0 ? 2 : 0)} rx={3}
              fill={i === best ? 'var(--ob-accent)' : 'color-mix(in srgb, var(--ob-accent) 35%, transparent)'}
            />
            <text x={x + step * 0.32} y={height - 10} textAnchor="middle" fontSize={11} fill="var(--ob-muted)">
              {d.label}
            </text>
            {d.value > 0 && (
              <text x={x + step * 0.32} y={y - 5} textAnchor="middle" fontSize={10} fill="var(--ob-muted)">
                {format(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
