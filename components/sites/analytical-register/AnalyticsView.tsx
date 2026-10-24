// components/sites/analytical-register/AnalyticsView.tsx
'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useOrderBook } from './store';
import {
  computeKpis, revenueByDay, categoryMix, weekdayWeekend,
  rankItems, revenueByWeek, dayOfWeekSeries, hourlyHeatmap, categoryTrend,
  type RankedItem,
} from './analytics';
import { formatMoney } from './pricing';
import { Line } from './charts/Line';
import { Column } from './charts/Column';
import { MultiLine } from './charts/MultiLine';
import { Heatmap } from './charts/Heatmap';
import { Donut } from './charts/Donut';

const RANGES = [7, 30, 90] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (key: string) => {
  const [, m, d] = key.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
};

function ItemRow({ rank, cur }: { rank: RankedItem; cur: string }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      {rank.src ? (
        <Image src={rank.src} alt="" width={48} height={48} className="h-10 w-10 shrink-0 rounded-md object-cover" />
      ) : (
        <span className="h-10 w-10 shrink-0 rounded-md bg-[var(--ob-line)]" aria-hidden />
      )}
      <span className="min-w-0 flex-1 truncate font-semibold">{rank.name}</span>
      <span className="tabular-nums text-[var(--ob-muted)]">{rank.qty} sold</span>
      <span className="tabular-nums font-bold">{formatMoney(rank.revenue, cur)}</span>
    </li>
  );
}

export function Analytics() {
  const { state } = useOrderBook();
  const [days, setDays] = useState<number>(30);
  const [trend, setTrend] = useState<'total' | 'category'>('total');
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);

  const data = useMemo(() => {
    const scoped = state.orders.filter((o) => o.createdAt.slice(0, 10) >= from && o.createdAt.slice(0, 10) <= to);
    const ranked = rankItems(scoped, state.menu);
    const dow = dayOfWeekSeries(scoped);
    const bestDay = dow.reduce((b, s, i) => (s.revenue > dow[b].revenue ? i : b), 0);
    const topOnBestDay = rankItems(
      scoped.filter((o) => (new Date(o.createdAt).getUTCDay() + 6) % 7 === bestDay),
      state.menu,
    )[0];
    return {
      kpis: computeKpis(scoped),
      byDay: revenueByDay(scoped, from, to),
      mix: categoryMix(scoped, state.menu),
      ww: weekdayWeekend(scoped),
      best: ranked.slice(0, 5),
      least: [...ranked].reverse().slice(0, 5),
      byWeek: revenueByWeek(scoped, from, to),
      dow,
      bestDay: dow[bestDay],
      topOnBestDay,
      heat: hourlyHeatmap(scoped),
      catTrend: categoryTrend(scoped, state.menu, from, to),
    };
  }, [state.orders, state.menu, from, to]);

  const cur = state.brand.currency;
  const card = (label: string, value: string) => (
    <div className="ob-card p-4"><div className="text-xs uppercase tracking-wide text-[var(--ob-muted)]">{label}</div><div className="mt-1 text-2xl font-extrabold">{value}</div></div>
  );

  const weeks = data.byWeek;
  const wow =
    weeks.length >= 2 && weeks[weeks.length - 2].revenue > 0
      ? Math.round(((weeks[weeks.length - 1].revenue - weeks[weeks.length - 2].revenue) / weeks[weeks.length - 2].revenue) * 100)
      : undefined;
  const wwTotal = data.ww.weekday + data.ww.weekend || 1;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Analytics</h2>
        <div className="ml-auto flex gap-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${days === r ? 'ob-btn' : 'ob-btn-ghost'}`}>{r}d</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {card('Revenue', formatMoney(data.kpis.revenue, cur))}
        {card('Orders', String(data.kpis.orders))}
        {card('Avg order', formatMoney(data.kpis.aov, cur))}
        {card('Items sold', String(data.kpis.itemsSold))}
        {card('Per day', formatMoney(data.kpis.revenue / days, cur))}
      </div>
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
          ? <Line data={data.byDay} />
          : <MultiLine dates={data.catTrend.dates} series={data.catTrend.series} />}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4">
          <h3 className="mb-3 font-semibold">Best sellers</h3>
          <ul className="space-y-3">
            {data.best.map((r) => <ItemRow key={r.name} rank={r} cur={cur} />)}
            {data.best.length === 0 && <li className="text-[var(--ob-muted)]">No data.</li>}
          </ul>
        </div>
        <div className="ob-card p-4">
          <h3 className="mb-3 font-semibold">Slowest movers</h3>
          <ul className="space-y-3">
            {data.least.map((r) => <ItemRow key={r.name} rank={r} cur={cur} />)}
          </ul>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4">
          <h3 className="mb-2 font-semibold">Daily rhythm</h3>
          <Column data={data.dow.map((d) => ({ label: d.day, value: d.revenue }))} format={(n) => `${cur}${Math.round(n / 1000)}k`} />
          <p className="mt-1 text-sm text-[var(--ob-muted)]">
            Best day: <b>{data.bestDay?.day}</b>
            {data.topOnBestDay && data.topOnBestDay.qty > 0 && <> — <b>{data.topOnBestDay.name}</b> leads it</>}
          </p>
        </div>
        <div className="ob-card p-4">
          <h3 className="mb-2 font-semibold">Weekly sales</h3>
          <Column data={weeks.map((w) => ({ label: shortDate(w.weekStart), value: w.revenue }))} format={(n) => `${cur}${Math.round(n / 1000)}k`} />
          {wow !== undefined && (
            <p className="mt-1 text-sm text-[var(--ob-muted)]">
              This week {wow >= 0 ? 'up' : 'down'} <b>{Math.abs(wow)}%</b> vs last week
            </p>
          )}
        </div>
      </div>
      <div className="ob-card p-4">
        <h3 className="mb-2 font-semibold">Busy hours</h3>
        <Heatmap grid={data.heat} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4"><h3 className="mb-2 font-semibold">Category mix</h3><Donut data={data.mix} /></div>
        <div className="ob-card p-4">
          <h3 className="mb-3 font-semibold">Weekday vs weekend</h3>
          <div className="space-y-3 text-sm">
            {([['Weekday', data.ww.weekday], ['Weekend', data.ww.weekend]] as const).map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between"><span>{label}</span><b className="tabular-nums">{formatMoney(value, cur)}</b></div>
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
