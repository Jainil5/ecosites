// components/sites/order-bridge.ts
// Shared surface between the Brewery Cafe ordering demo and the OrderBook
// register: the cafe publishes completed orders here, the register imports
// them into its book on hydrate.
import { computeTotals } from './analytical-register/pricing';
import type { Brand, Customer, Order, OrderLine } from './analytical-register/types';

export const PUBLISHED_KEY = 'bc-published-orders-v1';

/** The minimal shape the cafe writes; the register adds the money snapshots. */
export interface PublishedOrder {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  note?: string;
  customer?: Customer;
}

interface KvStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function readRaw(store: KvStore): PublishedOrder[] {
  try {
    const raw = store.getItem(PUBLISHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (o): o is PublishedOrder =>
        typeof o?.id === 'string' &&
        typeof o.createdAt === 'string' &&
        Array.isArray(o.lines) &&
        o.lines.length > 0,
    );
  } catch {
    return [];
  }
}

export function readPublished(store: KvStore): PublishedOrder[] {
  return readRaw(store);
}

export function publishOrder(store: KvStore, order: PublishedOrder): void {
  const orders = readRaw(store);
  if (orders.some((o) => o.id === order.id)) return;
  orders.push(order);
  store.setItem(PUBLISHED_KEY, JSON.stringify(orders.slice(-200)));
}

/** Materialise published orders into the book: totals, bills, brand snapshot. */
export function mergePublished(orders: Order[], published: PublishedOrder[], brand: Brand): Order[] {
  const seen = new Set(orders.map((o) => o.id));
  let bill = orders.reduce((max, o) => Math.max(max, o.billNumber), 0);
  const out = [...orders];
  for (const p of published) {
    if (seen.has(p.id)) continue;
    const totals = computeTotals(p.lines, brand.gstRate);
    out.push({
      id: p.id,
      billNumber: ++bill,
      createdAt: p.createdAt,
      lines: p.lines,
      ...totals,
      customer: p.customer,
      note: p.note,
      status: 'paid',
      brandName: brand.name,
      gstRate: brand.gstRate,
      currency: brand.currency,
    });
  }
  return out;
}
