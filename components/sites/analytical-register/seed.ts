// components/sites/analytical-register/seed.ts
import { computeTotals } from './pricing';
import type { Brand, MenuItem, Order, OrderLine } from './types';

// mulberry32 — small deterministic PRNG so reloads and tests are stable.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ['Aditi', 'Rohan', 'Meera', 'Kabir', 'Sara', 'Dev', 'Ananya', 'Vikram', 'Nisha', 'Arjun'];

/**
 * How a business actually trades. A café writes many small bills from 8am; a
 * salon writes few large ones from 10am; a kitchen peaks at night. The seed
 * keeps the same generator and only bends these numbers, so every edition's
 * book looks like its own trade instead of a café with a different logo.
 */
export interface SeedProfile {
  /** Bills per weekday, before the growth trend and the daily noise. */
  weekday: number;
  weekend: number;
  /** First trading hour and how many hours the counter runs. */
  openHour: number;
  span: number;
  /** Lines per bill: 1..maxLines. */
  maxLines: number;
  /** Popularity per category; anything unlisted weighs 1. */
  weights?: Record<string, number>;
  /** Chance a bill carries the guest's name. */
  customerRate: number;
}

export const cafeProfile: SeedProfile = {
  weekday: 9,
  weekend: 14,
  openHour: 8,
  span: 12,
  maxLines: 3,
  weights: { Coffee: 3, Food: 2, Beverages: 1 },
  customerRate: 0.55,
};

export function seedOrders(
  menu: MenuItem[],
  brand: Brand,
  opts: Partial<SeedProfile> & { days?: number; seed?: number; now?: Date } = {},
): Order[] {
  const days = opts.days ?? 75;
  const now = opts.now ?? new Date();
  const p: SeedProfile = { ...cafeProfile, ...opts };
  const rand = rng(opts.seed ?? 20261017);
  const active = menu.filter((m) => m.active);
  // Popularity weights: the profile's own categories, falling back to the
  // cafe's coffee-over-food shape so a bare call still seeds like before.
  const weight = (m: MenuItem) =>
    p.weights?.[m.category] ?? (m.category === 'Coffee' ? 3 : m.category === 'Food' ? 2 : 1);
  const orders: Order[] = [];
  let bill = 1;

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000);
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    // Gentle growth toward the present + weekend boost.
    const trend = 0.8 + (days - d) / days * 0.5;
    const count = Math.max(2, Math.round((weekend ? p.weekend : p.weekday) * trend * (0.7 + rand() * 0.6)));
    for (let i = 0; i < count; i++) {
      const hour = p.openHour + Math.floor(rand() * p.span);
      const ts = new Date(date);
      // UTC clock, matching the analytics (slice/getUTC*) that read these.
      ts.setUTCHours(hour, Math.floor(rand() * 60), 0, 0);
      const lineCount = 1 + Math.floor(rand() * p.maxLines);
      const lines: OrderLine[] = [];
      for (let k = 0; k < lineCount; k++) {
        const totalW = active.reduce((s, m) => s + weight(m), 0);
        let pick = rand() * totalW;
        let item = active[0];
        for (const m of active) {
          pick -= weight(m);
          if (pick <= 0) { item = m; break; }
        }
        const existing = lines.find((l) => l.menuItemId === item.id);
        if (existing) existing.qty += 1;
        else lines.push({ menuItemId: item.id, name: item.name, qty: 1, unitPrice: item.price });
      }
      const totals = computeTotals(lines, brand.gstRate);
      const hasCustomer = rand() > 1 - p.customerRate;
      const phone = `9198${String(10000000 + Math.floor(rand() * 89999999))}`;
      orders.push({
        id: `seed-${bill}`,
        billNumber: bill++,
        createdAt: ts.toISOString(),
        lines,
        ...totals,
        status: 'paid',
        brandName: brand.name,
        gstRate: brand.gstRate,
        currency: brand.currency,
        customer: hasCustomer
          ? { phone, name: NAMES[Math.floor(rand() * NAMES.length)] }
          : undefined,
      });
    }
  }
  return orders;
}
