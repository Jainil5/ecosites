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

export function seedOrders(
  menu: MenuItem[],
  brand: Brand,
  opts: { days?: number; seed?: number; now?: Date } = {},
): Order[] {
  const days = opts.days ?? 75;
  const now = opts.now ?? new Date();
  const rand = rng(opts.seed ?? 20261017);
  const active = menu.filter((m) => m.active);
  // Popularity weights: coffee and bakes sell most.
  const weight = (m: MenuItem) =>
    m.category === 'Coffee' ? 3 : m.category === 'Bakes' ? 2 : m.category === 'Tea' ? 2 : 1;
  const orders: Order[] = [];
  let bill = 1;

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    // Gentle growth toward the present + weekend boost.
    const trend = 0.8 + (days - d) / days * 0.5;
    const count = Math.max(2, Math.round((weekend ? 14 : 9) * trend * (0.7 + rand() * 0.6)));
    for (let i = 0; i < count; i++) {
      const hour = 8 + Math.floor(rand() * 12); // 8:00–19:59
      const ts = new Date(date);
      ts.setHours(hour, Math.floor(rand() * 60), 0, 0);
      const lineCount = 1 + Math.floor(rand() * 3);
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
      const hasCustomer = rand() > 0.45;
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
