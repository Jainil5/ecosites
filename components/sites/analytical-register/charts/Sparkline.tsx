// components/sites/analytical-register/charts/Sparkline.tsx
type Props = {
  values: number[];
  width?: number;
  height?: number;
  label: string;
};

/** A one-line chart with no chrome — the shape of a single item's sales. */
export function Sparkline({ values, width = 280, height = 56, label }: Props) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const step = width / (values.length - 1);
  const y = (v: number) => height - 4 - (v / max) * (height - 8);
  const pts = values.map((v, i) => [i * step, y(v)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`${label}, day by day, peaking at ${Math.round(max)}`}
    >
      <path d={`${path} L${width} ${height} L0 ${height} Z`} fill="color-mix(in srgb, var(--ob-accent) 12%, transparent)" stroke="none" />
      <path d={path} fill="none" stroke="var(--ob-accent)" strokeWidth={1.5} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill="var(--ob-accent)" />
    </svg>
  );
}
