'use client';

import { useMemo } from 'react';
import { Receipt, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { catalog, categoryLabels, formatINR, teamNames, type Order } from './orders';
import type { ServiceCategory } from './data';

const byKey = new Map(catalog.map((c) => [c.key, c]));
const categories: ServiceCategory[] = ['women', 'unisex', 'men'];

const PALETTE = ['#C1613C', '#E7B48F', '#9E4A2B', '#2B2118', '#D9A05B', '#8C6A55'];

function Bar({ label, value, max, sub, color }: { label: string; value: number; max: number; sub: string; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-stone-800">{label}</span>
        <span className="text-stone-500">{sub}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-stone-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${max ? Math.max((value / max) * 100, 2) : 0}%` }} />
      </div>
    </div>
  );
}

interface Slice {
  label: string;
  value: number;
  color: string;
}

function Donut({ slices, ariaLabel, unit = 'money' }: { slices: Slice[]; ariaLabel: string; unit?: 'money' | 'count' }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const fmt = (v: number) => (unit === 'money' ? formatINR(v) : `${v}`);
  const r = 60;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={ariaLabel}
        className="h-36 w-36 shrink-0 -rotate-90"
      >
        <circle cx="80" cy="80" r={r} fill="none" stroke="#F5F5F4" strokeWidth="26" />
        {total > 0 &&
          slices.map((s) => {
            const frac = s.value / total;
            const dash = `${frac * C} ${C}`;
            const offset = -acc * C;
            acc += frac;
            return (
              <circle
                key={s.label}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="26"
                strokeDasharray={dash}
                strokeDashoffset={offset}
              />
            );
          })}
        <text x="80" y="80" transform="rotate(90 80 80)" textAnchor="middle" dominantBaseline="central" className="fill-stone-900 font-serif text-[18px] font-bold">
          {total > 0 ? fmt(total) : '—'}
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-stone-700">
              <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="whitespace-nowrap text-stone-500">
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : '0%'} · {fmt(s.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayBars({ points }: { points: { date: string; revenue: number }[] }) {
  const max = Math.max(...points.map((p) => p.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 overflow-x-auto pb-2" role="img" aria-label="Revenue by day">
      {points.map((p) => (
        <div key={p.date} className="flex min-w-9 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-stone-500">{p.revenue ? formatINR(p.revenue) : ''}</span>
          <div
            className="w-full rounded-t bg-[#C1613C]"
            style={{ height: `${Math.max((p.revenue / max) * 96, 3)}px`, opacity: p.revenue ? 1 : 0.15 }}
            title={`${p.date}: ${formatINR(p.revenue)}`}
          />
          <span className="whitespace-nowrap text-[10px] text-stone-500">{p.date.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

export function Analytics({ orders }: { orders: Order[] }) {
  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const guests = orders.reduce((s, o) => s + o.people.length, 0);

    const catRevenue: Record<ServiceCategory, { revenue: number; count: number }> = {
      women: { revenue: 0, count: 0 },
      unisex: { revenue: 0, count: 0 },
      men: { revenue: 0, count: 0 },
    };
    const genderCount: Record<string, number> = { Female: 0, Male: 0, Other: 0 };
    const serviceCount = new Map<string, { name: string; count: number; revenue: number }>();
    const multiPersonOrders = orders.filter((o) => o.people.length > 1).length;

    const teamStats = new Map<string, { orders: number; revenue: number }>();
    const dayRevenue = new Map<string, number>();

    for (const o of orders) {
      for (const p of o.people) {
        genderCount[p.gender] = (genderCount[p.gender] ?? 0) + 1;
        for (const key of p.services) {
          const item = byKey.get(key);
          if (!item) continue;
          catRevenue[item.category].revenue += item.amount;
          catRevenue[item.category].count += 1;
          const prev = serviceCount.get(item.name) ?? { name: item.name, count: 0, revenue: 0 };
          serviceCount.set(item.name, { ...prev, count: prev.count + 1, revenue: prev.revenue + item.amount });
        }
      }
      for (const t of o.team ?? []) {
        const prev = teamStats.get(t) ?? { orders: 0, revenue: 0 };
        teamStats.set(t, { orders: prev.orders + 1, revenue: prev.revenue + o.total });
      }
      if (o.date) dayRevenue.set(o.date, (dayRevenue.get(o.date) ?? 0) + o.total);
    }

    const topServices = [...serviceCount.values()].sort((a, b) => b.count - a.count).slice(0, 5);
    const days = [...dayRevenue.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-14)
      .map(([date, rev]) => ({ date, revenue: rev }));
    return { revenue, guests, catRevenue, genderCount, topServices, multiPersonOrders, teamStats, days };
  }, [orders]);

  const maxService = Math.max(...stats.topServices.map((s) => s.count), 1);
  const maxTeamOrders = Math.max(...[...stats.teamStats.values()].map((t) => t.orders), 1);

  const catSlices = categories.map((c, i) => ({
    label: categoryLabels[c],
    value: stats.catRevenue[c].revenue,
    color: PALETTE[i % PALETTE.length],
  }));
  const genderGuests = (['Female', 'Male', 'Other'] as const).map((g) => stats.genderCount[g] ?? 0);
  const totalGuests = genderGuests.reduce((a, b) => a + b, 0);
  const genderSlices = (['Female', 'Male', 'Other'] as const).map((g, i) => ({
    label: g,
    value: stats.genderCount[g] ?? 0,
    color: PALETTE[i % PALETTE.length],
  }));
  const teamSlices = teamNames
    .filter((t) => (stats.teamStats.get(t)?.revenue ?? 0) > 0)
    .map((t, i) => ({ label: t, value: stats.teamStats.get(t)!.revenue, color: PALETTE[(i + 2) % PALETTE.length] }));

  const kpis = [
    { icon: Receipt, label: 'Orders', value: String(orders.length) },
    { icon: IndianRupee, label: 'Revenue', value: formatINR(stats.revenue) },
    { icon: TrendingUp, label: 'Avg Bill', value: orders.length ? formatINR(Math.round(stats.revenue / orders.length)) : '₹0' },
    { icon: Users, label: 'Guests Served', value: `${stats.guests} (${stats.multiPersonOrders} pair orders)` },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-6">
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C1613C]/10 text-[#C1613C]">
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <p className="font-serif text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="mb-5 font-serif text-xl text-stone-900">Revenue by Category</h3>
          <Donut slices={catSlices} ariaLabel={`Revenue by category pie chart, total ${formatINR(stats.revenue)}`} />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="mb-5 font-serif text-xl text-stone-900">Guests by Gender</h3>
          <Donut
            slices={genderSlices}
            unit="count"
            ariaLabel={`Guests by gender pie chart, ${totalGuests} guests total`}
          />
          <p className="mt-3 text-xs text-stone-500">{totalGuests} guests served across {orders.length} orders.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-5 font-serif text-xl text-stone-900">Revenue by Day</h3>
        {stats.days.length ? <DayBars points={stats.days} /> : <p className="text-sm text-stone-500">No orders yet.</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="mb-5 font-serif text-xl text-stone-900">Orders by Team Member</h3>
          <div className="space-y-4">
            {teamNames.map((t) => {
              const s = stats.teamStats.get(t) ?? { orders: 0, revenue: 0 };
              return (
                <Bar
                  key={t}
                  label={t}
                  value={s.orders}
                  max={maxTeamOrders}
                  sub={`${s.orders} orders · ${formatINR(s.revenue)}`}
                  color="bg-[#9E4A2B]"
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="mb-5 font-serif text-xl text-stone-900">Revenue by Team Member</h3>
          {teamSlices.length ? (
            <>
              <Donut slices={teamSlices} ariaLabel="Revenue by team member pie chart" />
              <p className="mt-3 text-xs text-stone-500">Shared orders count full revenue for every member who worked on them.</p>
            </>
          ) : (
            <p className="text-sm text-stone-500">No team members assigned to orders yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-5 font-serif text-xl text-stone-900">Top Services</h3>
        <div className="space-y-4">
          {stats.topServices.map((s) => (
            <Bar key={s.name} label={s.name} value={s.count} max={maxService} sub={`${s.count} bookings · ${formatINR(s.revenue)}`} color="bg-[#C1613C]" />
          ))}
          {!stats.topServices.length && <p className="text-sm text-stone-500">No services booked yet.</p>}
        </div>
      </div>
    </div>
  );
}
