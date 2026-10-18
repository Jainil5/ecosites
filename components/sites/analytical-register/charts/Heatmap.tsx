// components/sites/analytical-register/charts/Heatmap.tsx
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Props = { grid: number[][] };

export function Heatmap({ grid }: Props) {
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-1">
          {grid.map((row, d) => (
            <div key={DAYS[d]} className="contents">
              <span className="pr-1 text-right text-[10px] leading-4 text-[var(--ob-muted)]">{DAYS[d]}</span>
              {row.map((n, h) => (
                <div
                  key={h}
                  title={`${DAYS[d]} ${String(h).padStart(2, '0')}:00 — ${n} orders`}
                  className="h-4 rounded-sm"
                  style={{
                    background:
                      n === 0
                        ? 'var(--ob-line)'
                        : `color-mix(in srgb, var(--ob-accent) ${Math.round((n / max) * 100)}%, transparent)`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-[var(--ob-muted)]">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
        </div>
      </div>
    </div>
  );
}
