// components/sites/analytical-register/analytics.ts
import type { MenuItem, Order } from './types';

export interface Kpis { revenue: number; orders: number; aov: number; itemsSold: number; }
export interface DayPoint { date: string; revenue: number; orders: number; }
export interface NamedValue { name: string; value: number; }

const dayKey = (iso: string) => iso.slice(0, 10);

export function computeKpis(orders: Order[]): Kpis {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const itemsSold = orders.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.qty, 0), 0);
  return {
    revenue: Math.round(revenue * 100) / 100,
    orders: orders.length,
    aov: orders.length ? Math.round((revenue / orders.length) * 100) / 100 : 0,
    itemsSold,
  };
}

export function revenueByDay(orders: Order[], fromDate: string, toDate: string): DayPoint[] {
  const map = new Map<string, DayPoint>();
  for (let t = new Date(fromDate + 'T00:00:00Z').getTime(); t <= new Date(toDate + 'T00:00:00Z').getTime(); t += 86400000) {
    const key = new Date(t).toISOString().slice(0, 10);
    map.set(key, { date: key, revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const p = map.get(dayKey(o.createdAt));
    if (p) { p.revenue += o.total; p.orders += 1; }
  }
  return [...map.values()].map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));
}

export function topItems(orders: Order[], limit: number): NamedValue[] {
  const map = new Map<string, number>();
  for (const o of orders) for (const l of o.lines) map.set(l.name, (map.get(l.name) ?? 0) + l.qty);
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function categoryMix(orders: Order[], menu: MenuItem[]): NamedValue[] {
  const catOf = new Map(menu.map((m) => [m.id, m.category]));
  const map = new Map<string, number>();
  for (const o of orders) {
    for (const l of o.lines) {
      const cat = catOf.get(l.menuItemId) ?? 'Other';
      map.set(cat, (map.get(cat) ?? 0) + l.unitPrice * l.qty);
    }
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

export function weekdayWeekend(orders: Order[]): { weekday: number; weekend: number } {
  let weekday = 0;
  let weekend = 0;
  for (const o of orders) {
    const d = new Date(o.createdAt).getUTCDay();
    if (d === 0 || d === 6) weekend += o.total;
    else weekday += o.total;
  }
  return { weekday: Math.round(weekday), weekend: Math.round(weekend) };
}
