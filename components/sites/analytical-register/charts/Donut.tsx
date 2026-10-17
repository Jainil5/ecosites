// components/sites/analytical-register/charts/Donut.tsx
const PALETTE = ['var(--ob-accent)', '#7BA05B', '#D9A441', '#6C7B8A', '#B5651D', '#9C6ADE'];
type Props = { data: { name: string; value: number }[] };

export function Donut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const segs = data.map((d, i) => {
    const start = (acc / total) * 2 * Math.PI;
    acc += d.value;
    const end = (acc / total) * 2 * Math.PI;
    return { d, i, start, end };
  });
  const arc = (a: number, b: number) => {
    const r = 60, cx = 70, cy = 70;
    const large = b - a > Math.PI ? 1 : 0;
    return `M ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(b)} ${cy + r * Math.sin(b)}`;
  };
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" width={140} height={140} role="img" aria-label="Category mix">
        {segs.map((s) => <path key={s.i} d={arc(s.start, s.end)} stroke={PALETTE[s.i % PALETTE.length]} strokeWidth={18} fill="none" />)}
      </svg>
      <ul className="space-y-1 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
