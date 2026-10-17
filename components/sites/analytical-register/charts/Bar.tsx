// components/sites/analytical-register/charts/Bar.tsx
type Props = { data: { name: string; value: number }[] };

export function Bar({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.name} className="text-sm">
          <div className="flex justify-between"><span>{d.name}</span><span className="tabular-nums">{d.value}</span></div>
          <div className="mt-1 h-2 rounded bg-[var(--ob-line)]">
            <div className="h-2 rounded" style={{ width: `${(d.value / max) * 100}%`, background: 'var(--ob-accent)' }} />
          </div>
        </li>
      ))}
      {data.length === 0 && <li className="text-[var(--ob-muted)]">No data.</li>}
    </ul>
  );
}
