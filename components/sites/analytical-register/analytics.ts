// components/sites/analytical-register/analytics.ts
import { computeTotals } from './pricing';
import type { MenuItem, Order } from './types';

export interface Kpis { revenue: number; orders: number; aov: number; itemsSold: number; }
export interface DayPoint { date: string; revenue: number; orders: number; }
export interface NamedValue { name: string; value: number; }

const dayKey = (iso: string) => iso.slice(0, 10);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-10-17` reads as `17 Oct` on a chart label and in every drill-in. */
export const shortDate = (key: string) => {
  const [, m, d] = key.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''}`.trim();
};

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

export interface RankedItem { name: string; qty: number; revenue: number; src?: string; }

/** Full-menu ranking: sold items first by qty, unsold still shown at the tail. */
export function rankItems(orders: Order[], menu: MenuItem[]): RankedItem[] {
  const map = new Map<string, RankedItem>();
  for (const m of menu) map.set(m.id, { name: m.name, qty: 0, revenue: 0, src: m.src });
  for (const o of orders) {
    for (const l of o.lines) {
      let r = map.get(l.menuItemId);
      if (!r) {
        r = { name: l.name, qty: 0, revenue: 0 };
        map.set(l.menuItemId, r);
      }
      r.qty += l.qty;
      r.revenue = Math.round((r.revenue + l.unitPrice * l.qty) * 100) / 100;
    }
  }
  return [...map.values()].sort(
    (a, b) => b.qty - a.qty || b.revenue - a.revenue || a.name.localeCompare(b.name),
  );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mondayOf = (key: string) => {
  const t = Date.parse(`${key}T00:00:00Z`);
  const dow = new Date(t).getUTCDay(); // 0 = Sunday
  return new Date(t - (((dow + 6) % 7) * 86400000)).toISOString().slice(0, 10);
};
const eachDay = (fromDate: string, toDate: string) => {
  const out: string[] = [];
  for (let t = Date.parse(`${fromDate}T00:00:00Z`); t <= Date.parse(`${toDate}T00:00:00Z`); t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
};

export interface WeekPoint { weekStart: string; revenue: number; orders: number; }

export function revenueByWeek(orders: Order[], fromDate: string, toDate: string): WeekPoint[] {
  const weeks = new Map<string, WeekPoint>();
  for (const d of eachDay(fromDate, toDate)) {
    const key = mondayOf(d);
    if (!weeks.has(key)) weeks.set(key, { weekStart: key, revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const w = weeks.get(mondayOf(dayKey(o.createdAt)));
    if (w) { w.revenue += o.total; w.orders += 1; }
  }
  return [...weeks.values()].map((w) => ({ ...w, revenue: Math.round(w.revenue * 100) / 100 }));
}

export interface DaySlice { day: string; revenue: number; orders: number; }

export function dayOfWeekSeries(orders: Order[]): DaySlice[] {
  const series: DaySlice[] = DAYS.map((day) => ({ day, revenue: 0, orders: 0 }));
  for (const o of orders) {
    const s = series[(new Date(o.createdAt).getUTCDay() + 6) % 7];
    s.revenue += o.total;
    s.orders += 1;
  }
  return series.map((s) => ({ ...s, revenue: Math.round(s.revenue) }));
}

/** Order counts as [day Mon–Sun][hour 0–23]. */
export function hourlyHeatmap(orders: Order[]): number[][] {
  const grid = DAYS.map(() => new Array(24).fill(0) as number[]);
  for (const o of orders) {
    const d = new Date(o.createdAt);
    grid[(d.getUTCDay() + 6) % 7][d.getUTCHours()] += 1;
  }
  return grid;
}

export interface CategoryTrend {
  dates: string[];
  series: { name: string; values: number[] }[];
}

export function categoryTrend(orders: Order[], menu: MenuItem[], fromDate: string, toDate: string): CategoryTrend {
  const dates = eachDay(fromDate, toDate);
  const idx = new Map(dates.map((d, i) => [d, i]));
  const catOf = new Map(menu.map((m) => [m.id, m.category]));
  const cats = [...new Set(menu.map((m) => m.category))];
  const values = new Map(cats.map((c) => [c, new Array(dates.length).fill(0) as number[]]));
  for (const o of orders) {
    const i = idx.get(dayKey(o.createdAt));
    if (i === undefined) continue;
    for (const l of o.lines) {
      const c = catOf.get(l.menuItemId);
      if (!c) continue;
      const arr = values.get(c)!;
      arr[i] += l.unitPrice * l.qty;
    }
  }
  return { dates, series: cats.map((name) => ({ name, values: values.get(name)!.map((v) => Math.round(v)) })) };
}

/* ------------------------------------------------------------------ scoping
 * The charts below all read one array of bills. Filtering to a category
 * therefore cannot just drop the other lines from a total — it has to rebuild
 * the bill, so average order value, the hour grid and the exported report all
 * describe the same slice of trade the owner asked for.
 */

export function scopeToCategory(orders: Order[], menu: MenuItem[], category: string): Order[] {
  const catOf = new Map(menu.map((m) => [m.id, m.category]));
  const out: Order[] = [];
  for (const o of orders) {
    const lines = o.lines.filter((l) => (catOf.get(l.menuItemId) ?? 'Other') === category);
    if (lines.length === 0) continue;
    out.push({ ...o, lines, ...computeTotals(lines, o.gstRate) });
  }
  return out;
}

/** The window of the same length that sits immediately before `from`. */
export function previousRange(from: string, days: number): { from: string; to: string } {
  const start = Date.parse(`${from}T00:00:00Z`);
  return {
    from: new Date(start - days * 86400000).toISOString().slice(0, 10),
    to: new Date(start - 86400000).toISOString().slice(0, 10),
  };
}

/** Percentage change, or undefined when there is nothing to compare against. */
export function deltaPct(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return Math.round(((current - previous) / previous) * 100);
}

/* ------------------------------------------------------------------ drill-ins
 * A chart is only useful if a point on it can be asked a question. These answer
 * the three an owner actually asks: how did this day go, who is buying at this
 * hour, and is this item slipping.
 */

export interface DayDetail {
  date: string;
  kpis: Kpis;
  /** Money taken per trading hour, only the hours that actually traded. */
  hours: { label: string; value: number }[];
  top?: RankedItem;
}

export function dayDetail(orders: Order[], menu: MenuItem[], date: string): DayDetail {
  const onDay = orders.filter((o) => dayKey(o.createdAt) === date);
  const gross = new Array(24).fill(0) as number[];
  for (const o of onDay) gross[new Date(o.createdAt).getUTCHours()] += o.total;
  const hours = gross
    .map((value, h) => ({ label: String(h).padStart(2, '0'), value: Math.round(value) }))
    .filter((x) => x.value > 0);
  return { date, kpis: computeKpis(onDay), hours, top: rankItems(onDay, menu)[0] };
}

export interface SlotDetail { kpis: Kpis; items: NamedValue[] }

/** One cell of the busy-hours grid: a weekday and an hour, read across the whole book. */
export function slotDetail(orders: Order[], dayIndex: number, hour: number): SlotDetail {
  const hit = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return (d.getUTCDay() + 6) % 7 === dayIndex && d.getUTCHours() === hour;
  });
  return { kpis: computeKpis(hit), items: topItems(hit, 3) };
}

/** Busiest day/hour cells first — the keyboard route into `slotDetail`. */
export function peakSlots(grid: number[][], limit = 6): { day: number; hour: number; value: number }[] {
  const out: { day: number; hour: number; value: number }[] = [];
  grid.forEach((row, day) => row.forEach((value, hour) => {
    if (value > 0) out.push({ day, hour, value });
  }));
  return out.sort((a, b) => b.value - a.value || a.day - b.day || a.hour - b.hour).slice(0, limit);
}

export interface ItemDayPoint { date: string; revenue: number; qty: number }

/** An item's own daily line, for reading whether it is climbing or slipping. */
export function itemSeries(
  orders: Order[],
  name: string,
  fromDate: string,
  toDate: string,
): ItemDayPoint[] {
  const dates = eachDay(fromDate, toDate);
  const idx = new Map(dates.map((d, i) => [d, i]));
  const series = dates.map((date) => ({ date, revenue: 0, qty: 0 }));
  for (const o of orders) {
    const i = idx.get(dayKey(o.createdAt));
    if (i === undefined) continue;
    for (const l of o.lines) {
      if (l.name !== name) continue;
      series[i].revenue += l.unitPrice * l.qty;
      series[i].qty += l.qty;
    }
  }
  return series.map((s) => ({ ...s, revenue: Math.round(s.revenue) }));
}

export interface ItemStats { qty: number; revenue: number; bills: number; tradedDays: number }

export function itemStats(orders: Order[], name: string): ItemStats {
  let qty = 0;
  let revenue = 0;
  let bills = 0;
  const days = new Set<string>();
  for (const o of orders) {
    const lines = o.lines.filter((l) => l.name === name);
    if (lines.length === 0) continue;
    bills += 1;
    days.add(dayKey(o.createdAt));
    for (const l of lines) {
      qty += l.qty;
      revenue += l.unitPrice * l.qty;
    }
  }
  return { qty, revenue: Math.round(revenue), bills, tradedDays: days.size };
}

/* ------------------------------------------------------------------ export */

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** The report on screen, as the owner would hand it to their accountant. */
export function reportCsv(rows: DayPoint[], brand: string, scope: string): string {
  const head = ['# ' + csvCell(`${brand} — ${scope}`), ['date', 'revenue', 'bills'].join(',')];
  const body = rows.map((r) => [r.date, r.revenue.toFixed(2), r.orders].join(','));
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  return [...head, ...body, ['total', total.toFixed(2), rows.reduce((s, r) => s + r.orders, 0)].join(',')].join('\n');
}
