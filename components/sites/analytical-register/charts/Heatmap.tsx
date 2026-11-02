// components/sites/analytical-register/charts/Heatmap.tsx
'use client';
import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Slot = { day: number; hour: number };

type Props = {
  grid: number[][];
  picked?: Slot | null;
  /** Pin a cell so the page can open that hour's book underneath. */
  onPick?: (slot: Slot) => void;
};

const hhmm = (h: number) => `${String(h).padStart(2, '0')}:00`;
const same = (a: Slot | null | undefined, b: Slot) => !!a && a.day === b.day && a.hour === b.hour;

/**
 * Busy hours. The grid reads as one instrument: point at a cell and the caption
 * says what it holds, arrow-key it and the same cell moves, Enter pins it and
 * the page below opens that hour. One tab stop, not a hundred and sixty-eight.
 */
export function Heatmap({ grid, picked, onPick }: Props) {
  const [cursor, setCursor] = useState<Slot | null>(null);
  const max = Math.max(1, ...grid.flat());
  const read = cursor ?? picked ?? null;

  const step = (dDay: number, dHour: number) => {
    const from = cursor ?? { day: 0, hour: 0 };
    const hour = from.hour + dHour;
    const day = from.day + dDay + Math.floor(hour / 24);
    const wrapped = ((hour % 24) + 24) % 24;
    if (day < 0 || day > 6) return;
    setCursor({ day, hour: wrapped });
  };

  return (
    <div>
      <div
        className="overflow-x-auto"
        role="group"
        tabIndex={0}
        aria-label="Bills by weekday and hour. Arrow keys to move, Enter to pin an hour."
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); step(0, 1); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); step(0, -1); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); step(1, 0); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); step(-1, 0); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (read) onPick?.(read); }
          else if (e.key === 'Escape') setCursor(null);
        }}
        onPointerLeave={() => setCursor(null)}
      >
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-1">
            {grid.map((row, d) => (
              <div key={DAYS[d]} className="contents">
                <span className="pr-1 text-right text-[10px] leading-4 text-[var(--ob-muted)]">{DAYS[d]}</span>
                {row.map((n, h) => {
                  const cell = { day: d, hour: h };
                  const on = same(picked, cell);
                  const lit = same(cursor, cell) && !on;
                  return (
                    <div
                      key={h}
                      title={`${DAYS[d]} ${hhmm(h)} — ${n} bills`}
                      className={`h-4 rounded-sm${on || lit ? ' ob-heat-on' : ''}`}
                      style={{
                        background:
                          n === 0
                            ? 'var(--ob-line)'
                            : `color-mix(in srgb, var(--ob-accent) ${Math.round((n / max) * 100)}%, transparent)`,
                        opacity: picked && !on ? 0.55 : 1,
                      }}
                      onPointerEnter={() => setCursor(cell)}
                      onClick={() => onPick?.(cell)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[var(--ob-muted)]">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm" aria-live="polite">
        {read ? (
          <>
            <b className="ob-accent-text">{DAYS[read.day]} {hhmm(read.hour)}</b>
            <span className="tabular-nums"> · {grid[read.day]?.[read.hour] ?? 0} bills in this book</span>
            <span className="text-[var(--ob-muted)]">{same(picked, read) ? ' — pinned, press again to clear' : ' — press Enter to open it'}</span>
          </>
        ) : (
          <span className="text-[var(--ob-muted)]">Hover a cell to read it, click to open that hour’s book.</span>
        )}
      </p>
    </div>
  );
}
