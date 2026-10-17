// components/sites/analytical-register/AnalyticsView.tsx
'use client';
import { useMemo, useState } from 'react';
import { useOrderBook } from './store';
import { computeKpis, revenueByDay, topItems, categoryMix, weekdayWeekend } from './analytics';
import { formatMoney } from './pricing';
import { Line } from './charts/Line';
import { Bar } from './charts/Bar';
import { Donut } from './charts/Donut';

const RANGES = [7, 30, 90] as const;

export function Analytics() {
  const { state } = useOrderBook();
  const [days, setDays] = useState<number>(30);
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);

  const data = useMemo(() => {
    const scoped = state.orders.filter((o) => o.createdAt.slice(0, 10) >= from && o.createdAt.slice(0, 10) <= to);
    return {
      kpis: computeKpis(scoped),
      byDay: revenueByDay(scoped, from, to),
      top: topItems(scoped, 6),
      mix: categoryMix(scoped, state.menu),
      ww: weekdayWeekend(scoped),
    };
  }, [state.orders, state.menu, from, to]);

  const cur = state.brand.currency;
  const card = (label: string, value: string) => (
    <div className="ob-card p-4"><div className="text-xs uppercase tracking-wide text-[var(--ob-muted)]">{label}</div><div className="mt-1 text-2xl font-extrabold">{value}</div></div>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Analytics</h2>
        <div className="ml-auto flex gap-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r}
              className={`rounded-lg px-3 py-1 text-sm font-semibold ${days === r ? 'ob-btn' : 'ob-btn-ghost'}`}>{r}d</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {card('Revenue', formatMoney(data.kpis.revenue, cur))}
        {card('Orders', String(data.kpis.orders))}
        {card('Avg order', formatMoney(data.kpis.aov, cur))}
        {card('Items sold', String(data.kpis.itemsSold))}
      </div>
      <div className="ob-card p-4"><h3 className="mb-2 font-semibold">Revenue trend</h3><Line data={data.byDay} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ob-card p-4"><h3 className="mb-2 font-semibold">Top items</h3><Bar data={data.top} /></div>
        <div className="ob-card p-4"><h3 className="mb-2 font-semibold">Category mix</h3><Donut data={data.mix} /></div>
      </div>
      <div className="ob-card p-4">
        <h3 className="mb-2 font-semibold">Weekday vs weekend</h3>
        <div className="flex gap-8 text-sm">
          <span>Weekday <b>{formatMoney(data.ww.weekday, cur)}</b></span>
          <span>Weekend <b>{formatMoney(data.ww.weekend, cur)}</b></span>
        </div>
      </div>
    </section>
  );
}
