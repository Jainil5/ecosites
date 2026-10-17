// components/sites/analytical-register/charts/Line.tsx
type Props = { data: { date: string; revenue: number }[]; width?: number; height?: number };

export function Line({ data, width = 560, height = 200 }: Props) {
  if (data.length === 0) return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;
  const pad = 24;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [pad + i * step, height - pad - (d.revenue / max) * (height - pad * 2)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Revenue by day">
      <path d={path} fill="none" stroke="var(--ob-accent)" strokeWidth={2} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2} fill="var(--ob-accent)" />)}
    </svg>
  );
}
