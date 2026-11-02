// components/sites/analytical-register/AnalyticsView.tsx
'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useOrderBook } from './store';
import {
  computeKpis, revenueByDay, categoryMix, weekdayWeekend, shortDate,
  rankItems, revenueByWeek, dayOfWeekSeries, hourlyHeatmap, categoryTrend,
  scopeToCategory, previousRange, deltaPct, dayDetail, slotDetail, peakSlots,
  itemSeries, itemStats, reportCsv,
  type RankedItem,
} from './analytics';
import { formatMoney } from './pricing';
import type { Order } from './types';
import { Line } from './charts/Line';
import { Column } from './charts/Column';
import { MultiLine } from './charts/MultiLine';
import { Heatmap } from './charts/Heatmap';
import { Donut } from './charts/Donut';
import { Sparkline } from './charts/Sparkline';

const RANGES = [7, 30, 90] as const;
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hhmm = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** One money figure with the change against the same-length window before it. */
function Card({ label, value, delta, hint }: { label: string; value: string; delta?: number; hint: string }) {
  return (
    <div className="ob-card p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--ob-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums">{value}</div>
      {delta === undefined ? (
        <div className="mt-1 text-xs text-[var(--ob-muted)]">{hint}</div>
      ) : (
        <div className={`mt-1 text-xs font-semibold tabular-nums ${delta >= 0 ? 'ob-up' : 'ob-down'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% {hint}
        </div>
      )}
    </div>
  );
}

/**
 * A ranked row that answers back. Tap it and the item opens underneath with its
 * own daily line, so "we sold 40 of these" becomes "and they are slipping".
 */
function ItemRow({
  rank, cur, index, open, onToggle,
}: {
  rank: RankedItem; cur: string; index: number; open: boolean; onToggle: (name: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(rank.name)}
        aria-expanded={open}
        className={`ob-row${open ? ' ob-row-on' : ''}`}
      >
        {rank.src ? (
          <Image src={rank.src} alt="" width={48} height={48} className="h-10 w-10 shrink-0 rounded-md object-cover" />
        ) : (
          <span className="h-10 w-10 shrink-0 rounded-md bg-[var(--ob-line)]" aria-hidden />
        )}
        <span className="text-xs tabular-nums text-[var(--ob-muted)]">{String(index + 1).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1 truncate font-semibold">{rank.name}</span>
        <span className="tabular-nums text-[var(--ob-muted)]">{rank.qty} sold</span>
        <span className="tabular-nums font-bold">{formatMoney(rank.revenue, cur)}</span>
        <span className={`ob-caret${open ? ' ob-caret-on' : ''}`} aria-hidden />
      </button>
    </li>
  );
}

export function Analytics() {
  const { state } = useOrderBook();
  const [days, setDays] = useState<number>(30);
  const [trend, setTrend] = useState<'total' | 'category'>('total');
  const [cat, setCat] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ day: number; hour: number } | null>(null);
  const [dowPick, setDowPick] = useState<string | null>(null);
  const [weekPick, setWeekPick] = useState<string | null>(null);
  const [drill, setDrill] = useState<string | null>(null);
  const [sort, setSort] = useState<'qty' | 'revenue'>('qty');

  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const prev = previousRange(from, days);

  const data = useMemo(() => {
    const inRange = (o: Order, a: string, b: string) =>
      o.createdAt.slice(0, 10) >= a && o.createdAt.slice(0, 10) <= b;
    const all = state.orders.filter((o) => inRange(o, from, to));
    // The scope is applied to the bills, not just the charts, so every figure on
    // the page describes the same slice of trade.
    const scoped = cat ? scopeToCategory(all, state.menu, cat) : all;
    const allPrev = state.orders.filter((o) => inRange(o, prev.from, prev.to));
    const scopedPrev = cat ? scopeToCategory(allPrev, state.menu, cat) : allPrev;

    const ranked = rankItems(scoped, state.menu);
    const bySort = sort === 'revenue' ? [...ranked].sort((a, b) => b.revenue - a.revenue || b.qty - a.qty) : ranked;
    const dow = dayOfWeekSeries(scoped);
    const bestDay = dow.reduce((b, s, i) => (s.revenue > dow[b].revenue ? i : b), 0);
    const topOnBestDay = rankItems(
      scoped.filter((o) => (new Date(o.createdAt).getUTCDay() + 6) % 7 === bestDay),
      state.menu,
    )[0];
    return {
      scoped,
      kpis: computeKpis(scoped),
      prevKpis: computeKpis(scopedPrev),
      byDay: revenueByDay(scoped, from, to),
      // The ring doubles as the filter control, so it always reads the full book.
      mix: categoryMix(all, state.menu),
      ww: weekdayWeekend(scoped),
      best: bySort.slice(0, 5),
      least: [...bySort].reverse().slice(0, 5),
      byWeek: revenueByWeek(scoped, from, to),
      dow,
      bestDay: dow[bestDay],
      topOnBestDay,
      heat: hourlyHeatmap(scoped),
      // Per-category lines are already a decomposition, so they read the full
      // book; the scope picks which one is drawn.
      catTrend: categoryTrend(all, state.menu, from, to),
    };
  }, [state.orders, state.menu, from, to, prev.from, prev.to, cat, sort]);

  const cur = state.brand.currency;
  const money = (n: number) => formatMoney(n, cur);
  const scopeLabel = cat ?? 'All categories';
  const categories = [...new Set(state.menu.filter((m) => m.active).map((m) => m.category))];

  // Selections only mean something inside the current window and scope, so each
  // one is checked against the data rather than cleaned up in an effect.
  const pinned = day && data.byDay.some((d) => d.date === day) ? day : null;
  const detail = pinned ? dayDetail(data.scoped, state.menu, pinned) : null;
  // The hour has to exist in the grid; whether it is busy is the answer, not a
  // reason to drop the selection — a 2am with no bills is worth reading too.
  const pickedSlot = slot && typeof data.heat[slot.day]?.[slot.hour] === 'number' ? slot : null;
  const slotInfo = pickedSlot ? slotDetail(data.scoped, pickedSlot.day, pickedSlot.hour) : null;
  const dayFocus = dowPick ? data.dow.find((d) => d.day === dowPick) : undefined;
  const weekFocus = weekPick ? data.byWeek.find((w) => shortDate(w.weekStart) === weekPick) : undefined;
  const weekIndex = weekFocus ? data.byWeek.indexOf(weekFocus) : -1;
  const weekDelta =
    weekFocus && weekIndex > 0 && data.byWeek[weekIndex - 1].revenue > 0
      ? deltaPct(weekFocus.revenue, data.byWeek[weekIndex - 1].revenue)
      : undefined;

  const drillSeries = drill ? itemSeries(data.scoped, drill, from, to) : null;
  const drillStats = drill ? itemStats(data.scoped, drill) : null;

  const weeks = data.byWeek;
  const wow =
    weeks.length >= 2 && weeks[weeks.length - 2].revenue > 0
      ? Math.round(((weeks[weeks.length - 1].revenue - weeks[weeks.length - 2].revenue) / weeks[weeks.length - 2].revenue) * 100)
      : undefined;
  const wwTotal = data.ww.weekday + data.ww.weekend || 1;

  const exportCsv = () => {
    const csv = reportCsv(data.byDay, state.brand.name, `${scopeLabel}, ${days}d to ${to}`);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `orderbook-${(cat ?? 'all').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${from}_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="space-y-6">
      {/* ------------------------------------------------------- controls */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold">Analytics</h2>
        <div className="ml-auto flex gap-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${days === r ? 'ob-btn' : 'ob-btn-ghost'}`}>{r}d</button>
          ))}
          <button onClick={exportCsv} className="rounded-lg px-4 py-2.5 text-sm font-semibold ob-btn-ghost">
            Export CSV
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ob-muted)]">Scope</span>
        {['all', ...categories].map((c) => {
          const on = (c === 'all' ? null : c) === cat;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => { setCat(c === 'all' ? null : c); setDay(null); setSlot(null); setDowPick(null); setWeekPick(null); }}
              className={`ob-chip${on ? ' ob-chip-on' : ''}`}
            >
              {c === 'all' ? 'All categories' : c}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------- kpis */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card label="Revenue" value={money(data.kpis.revenue)} hint={`vs ${days}d before`}
          delta={deltaPct(data.kpis.revenue, data.prevKpis.revenue)} />
        <Card label="Orders" value={String(data.kpis.orders)} hint={`vs ${days}d before`}
          delta={deltaPct(data.kpis.orders, data.prevKpis.orders)} />
        <Card label="Avg order" value={money(data.kpis.aov)} hint={`vs ${days}d before`}
          delta={deltaPct(data.kpis.aov, data.prevKpis.aov)} />
        <Card label="Items sold" value={String(data.kpis.itemsSold)} hint={`vs ${days}d before`}
          delta={deltaPct(data.kpis.itemsSold, data.prevKpis.itemsSold)} />
        <Card label="Per day" value={money(data.kpis.revenue / days)} hint={`vs ${days}d before`}
          delta={deltaPct(data.kpis.revenue / days, data.prevKpis.revenue / days)} />
      </div>
      <p className="text-sm text-[var(--ob-muted)]">
        {scopeLabel} · {from} to {to}. Everything below — the line, the hour grid, the item ranks and the export —
        reads this scope. Hover or tap any chart.
      </p>

      {/* ------------------------------------------------------- trend */}
      <div className="ob-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="font-semibold">Revenue trend</h3>
          <div className="ml-auto flex gap-1">
            <button onClick={() => setTrend('total')} aria-pressed={trend === 'total'}
              className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${trend === 'total' ? 'ob-btn' : 'ob-btn-ghost'}`}>Total</button>
            <button onClick={() => setTrend('category')} aria-pressed={trend === 'category'}
              className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${trend === 'category' ? 'ob-btn' : 'ob-btn-ghost'}`}>Categories</button>
          </div>
        </div>
        {trend === 'total'
          ? (
            <Line
              data={data.byDay}
              format={money}
              selected={pinned}
              onSelect={(d) => setDay(d === pinned ? null : d)}
            />
          )
          : (
            <MultiLine
              dates={data.catTrend.dates}
              series={cat ? data.catTrend.series.filter((s) => s.name === cat) : data.catTrend.series}
              format={(n) => `${cur}${n.toLocaleString('en-IN')}`}
            />
          )}

        {detail && (
          <div className="ob-drill mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold">{shortDate(detail.date)}</h4>
              <span className="text-sm text-[var(--ob-muted)]">day opened from the trend</span>
              <button className="ob-btn-ghost ml-auto px-3 py-1.5 text-xs" onClick={() => setDay(null)}>
                Close
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div><div className="ob-drill-label">Taken</div><div className="ob-drill-value">{money(detail.kpis.revenue)}</div></div>
              <div><div className="ob-drill-label">Bills</div><div className="ob-drill-value tabular-nums">{detail.kpis.orders}</div></div>
              <div><div className="ob-drill-label">Avg bill</div><div className="ob-drill-value">{money(detail.kpis.aov)}</div></div>
              <div>
                <div className="ob-drill-label">Top item</div>
                <div className="ob-drill-value truncate">{detail.top && detail.top.qty > 0 ? `${detail.top.name} ×${detail.top.qty}` : '—'}</div>
              </div>
            </div>
            {detail.hours.length > 0 && (
              <div className="mt-3">
                <div className="ob-drill-label mb-1">Hour by hour</div>
                <Column
                  data={detail.hours}
                  height={140}
                  format={(n) => `${cur}${Math.round(n / 1000)}k`}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- items */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-semibold">Best sellers</h3>
            <div className="ml-auto flex gap-1">
              {(['qty', 'revenue'] as const).map((k) => (
                <button key={k} onClick={() => setSort(k)} aria-pressed={sort === k}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sort === k ? 'ob-btn' : 'ob-btn-ghost'}`}>
                  {k === 'qty' ? 'By sold' : 'By revenue'}
                </button>
              ))}
            </div>
          </div>
          <ul className="space-y-3">
            {data.best.map((r, i) => (
              <ItemRow
                key={r.name}
                rank={r}
                cur={cur}
                index={i}
                open={drill === r.name}
                onToggle={(name) => setDrill(drill === name ? null : name)}
              />
            ))}
            {data.best.length === 0 && <li className="text-[var(--ob-muted)]">Nothing sold in this scope.</li>}
          </ul>
        </div>
        <div className="ob-card p-4">
          <h3 className="mb-3 font-semibold">Slowest movers</h3>
          <ul className="space-y-3">
            {data.least.map((r, i) => (
              <ItemRow
                key={r.name}
                rank={r}
                cur={cur}
                index={i}
                open={drill === r.name}
                onToggle={(name) => setDrill(drill === name ? null : name)}
              />
            ))}
          </ul>
        </div>
      </div>

      {drill && drillSeries && drillStats && (
        <div className="ob-drill ob-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{drill}</h3>
            <span className="text-sm text-[var(--ob-muted)]">in {scopeLabel.toLowerCase()}, {days} days</span>
            <button className="ob-btn-ghost ml-auto px-3 py-1.5 text-xs" onClick={() => setDrill(null)}>Close</button>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <div>
              <div className="ob-drill-label mb-1">Daily take</div>
              <Sparkline values={drillSeries.map((s) => s.revenue)} label={`${drill} daily revenue`} />
              {drillStats.qty === 0 && (
                <p className="mt-1 text-sm text-[var(--ob-muted)]">
                  Not sold once in this window — the line is flat because the shelf is empty of it.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="ob-drill-label">Bills it appears on</div><div className="ob-drill-value tabular-nums">{drillStats.bills}</div></div>
              <div><div className="ob-drill-label">Days it traded</div><div className="ob-drill-value tabular-nums">{drillStats.tradedDays} / {days}</div></div>
              <div><div className="ob-drill-label">Units</div><div className="ob-drill-value tabular-nums">{drillStats.qty}</div></div>
              <div><div className="ob-drill-label">Revenue</div><div className="ob-drill-value">{money(drillStats.revenue)}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- rhythm */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4">
          <h3 className="mb-2 font-semibold">Daily rhythm</h3>
          <Column
            data={data.dow.map((d) => ({ label: d.day, value: d.revenue }))}
            format={(n) => `${cur}${Math.round(n / 1000)}k`}
            selected={dowPick}
            onSelect={(label) => setDowPick(label === dowPick ? null : label)}
          />
          <p className="mt-1 text-sm text-[var(--ob-muted)]">
            Best day: <b className="text-[var(--ob-ink)]">{data.bestDay?.day}</b>
            {data.topOnBestDay && data.topOnBestDay.qty > 0 && <> — <b className="text-[var(--ob-ink)]">{data.topOnBestDay.name}</b> leads it</>}
            {dayFocus && (
              <>
                {' · '}<b className="text-[var(--ob-ink)]">{dayFocus.day}</b> takes {money(dayFocus.revenue)} over{' '}
                {dayFocus.orders} bills — {Math.round((dayFocus.revenue / (data.kpis.revenue || 1)) * 100)}% of the window
              </>
            )}
          </p>
        </div>
        <div className="ob-card p-4">
          <h3 className="mb-2 font-semibold">Weekly sales</h3>
          <Column
            data={weeks.map((w) => ({ label: shortDate(w.weekStart), value: w.revenue }))}
            format={(n) => `${cur}${Math.round(n / 1000)}k`}
            selected={weekPick}
            onSelect={(label) => setWeekPick(label === weekPick ? null : label)}
          />
          {wow !== undefined && (
            <p className="mt-1 text-sm text-[var(--ob-muted)]">
              This week {wow >= 0 ? 'up' : 'down'} <b className="text-[var(--ob-ink)]">{Math.abs(wow)}%</b> vs last week
            </p>
          )}
          {weekFocus && (
            <p className="mt-1 text-sm text-[var(--ob-muted)]">
              <b className="text-[var(--ob-ink)]">{weekFocus.weekStart}</b> — {money(weekFocus.revenue)} over {weekFocus.orders} bills
              {weekDelta !== undefined && <>, {weekDelta >= 0 ? 'up' : 'down'} {Math.abs(weekDelta)}% on the week before</>}
            </p>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- hours */}
      <div className="ob-card p-4">
        <h3 className="mb-2 font-semibold">Busy hours</h3>
        <Heatmap grid={data.heat} picked={pickedSlot} onPick={(s) => setSlot(pickedSlot && pickedSlot.day === s.day && pickedSlot.hour === s.hour ? null : s)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ob-muted)]">Peaks</span>
          {peakSlots(data.heat, 6).map((p) => {
            const on = !!pickedSlot && pickedSlot.day === p.day && pickedSlot.hour === p.hour;
            return (
              <button
                key={`${p.day}-${p.hour}`}
                type="button"
                aria-pressed={on}
                onClick={() => setSlot(on ? null : { day: p.day, hour: p.hour })}
                className={`ob-chip${on ? ' ob-chip-on' : ''}`}
              >
                {DOW[p.day]} {hhmm(p.hour)} · {p.value}
              </button>
            );
          })}
        </div>
        {slotInfo && pickedSlot && (
          <div className="ob-drill mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold">{DOW[pickedSlot.day]} {hhmm(pickedSlot.hour)}</h4>
              <span className="text-sm text-[var(--ob-muted)]">this hour, across every {days}-day window on the book</span>
              <button className="ob-btn-ghost ml-auto px-3 py-1.5 text-xs" onClick={() => setSlot(null)}>Close</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div><div className="ob-drill-label">Bills</div><div className="ob-drill-value tabular-nums">{slotInfo.kpis.orders}</div></div>
              <div><div className="ob-drill-label">Taken</div><div className="ob-drill-value">{money(slotInfo.kpis.revenue)}</div></div>
              <div><div className="ob-drill-label">Avg bill</div><div className="ob-drill-value">{money(slotInfo.kpis.aov)}</div></div>
            </div>
            {slotInfo.items.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {slotInfo.items.map((it) => (
                  <li key={it.name} className="ob-chip">{it.name} ×{it.value}</li>
                ))}
              </ul>
            )}
            {slotInfo.items.length === 0 && (
              <p className="mt-3 text-sm text-[var(--ob-muted)]">
                Not one bill in this hour across the whole window — the counter was open, the room was quiet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- mix */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-semibold">Category mix</h3>
            {cat && (
              <button type="button" className="ob-chip ob-chip-on ml-auto" onClick={() => setCat(null)}>
                Filtered: {cat} — clear
              </button>
            )}
          </div>
          <Donut data={data.mix} format={money} active={cat} onPick={(name) => setCat(name === cat ? null : name)} />
          <p className="mt-2 text-sm text-[var(--ob-muted)]">Click a slice or a row to scope the whole report to that category.</p>
        </div>
        <div className="ob-card p-4">
          <h3 className="mb-3 font-semibold">Weekday vs weekend</h3>
          <div className="space-y-3 text-sm">
            {([['Weekday', data.ww.weekday], ['Weekend', data.ww.weekend]] as const).map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between"><span>{label}</span><b className="tabular-nums">{money(value)}</b></div>
                <div className="mt-1 h-2 rounded bg-[var(--ob-line)]">
                  <div className="h-2 rounded" style={{ width: `${(value / wwTotal) * 100}%`, background: 'var(--ob-accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
