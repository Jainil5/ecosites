# OrderBook (`analytical-register`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone demo site at `/analytical-register` — a POS register where any brand takes orders, creates GST cash memos, and clicks Send on WhatsApp, plus an analytics dashboard that recomputes live from the orders.

**Architecture:** Single Next.js 15 App Router page renders one client shell under `components/sites/analytical-register/`. All state (brand, menu, orders, customers) lives in `localStorage` behind a pure `useReducer` store. Money math, seeding, WhatsApp text, and analytics aggregations are pure modules with unit tests; the five screens (Register, Orders, Analytics, Menu, Settings) are client components mounted on a top nav.

**Tech Stack:** Next 15, React 19, TypeScript 5.7 strict, Tailwind 3.4 + a scoped `.orderbook` CSS block, `lucide-react` icons, hand-rolled SVG charts (no new dependency), Vitest (node env) for pure logic.

**Spec:** `docs/superpowers/specs/2026-10-17-analytical-register-design.md`

## Global Constraints

- No new runtime dependencies. Only existing packages: `next`, `react`, `lucide-react`, `framer-motion` (optional), `tailwindcss`. Charts are hand-written SVG.
- Node >= 20, Next ^15.5, React 19, TypeScript strict (`npx tsc --noEmit` must stay clean).
- Every "app" is a standalone site: page under `app/(sites)/<slug>/page.tsx`, everything else under `components/sites/<slug>/`. Slug and folder are `analytical-register`; the customer-facing name is **OrderBook**.
- Money math is done in integer paise inside `pricing.ts`. Invariant that MUST hold for every order: `subtotal + cgst + sgst + roundOff === total`.
- GST is split as `cgst = floor(taxPaise/2)`, `sgst = taxPaise - cgst` so the two halves always sum to the tax exactly.
- Persistence uses a single versioned `localStorage` key `orderbook:v1` (a deliberate simplification of the spec's per-collection keys; one browser tab is one brand demo, so the namespace is still brand-scoped).
- Pure logic lives in `reducer.ts`/`pricing.ts`/`analytics.ts`/`seed.ts`/`bill-text.ts` and is tested under `test/analytical-register-*.test.ts` (Vitest, node). Components are verified in the browser, not with React Testing Library.
- The OrderBook entry in `content/websites/sites.ts` MUST NOT contain the words `demo` or `pune` (enforced by `test/brand-registries.test.ts`), and its `screenshot` file MUST exist at `public/showcase/analytical-register/preview.png` and be larger than 5000 bytes.

---

### Task 1: Core types + money math

**Files:**
- Create: `components/sites/analytical-register/types.ts`
- Create: `components/sites/analytical-register/pricing.ts`
- Test: `test/analytical-register-pricing.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - Types `Brand`, `MenuItem`, `Customer`, `OrderLine`, `OrderStatus`, `Order`, `Totals`.
  - `computeTotals(lines: OrderLine[], gstRate: number): Totals`
  - `formatMoney(n: number, currency: string): string`

- [ ] **Step 1: Write the failing test**

```ts
// test/analytical-register-pricing.test.ts
import { describe, expect, it } from 'vitest';
import { computeTotals, formatMoney } from '@/components/sites/analytical-register/pricing';
import type { OrderLine } from '@/components/sites/analytical-register/types';

const line = (unitPrice: number, qty: number): OrderLine => ({
  menuItemId: 'm', name: 'X', unitPrice, qty,
});

describe('computeTotals', () => {
  it('splits GST into two halves that sum to the tax', () => {
    const t = computeTotals([line(57.5, 2)], 0.05);
    expect(t.subtotal).toBe(115);
    expect(t.cgst).toBe(2.87);
    expect(t.sgst).toBe(2.88);
    expect(t.total).toBe(121);
    expect(t.roundOff).toBe(0.25);
  });
  it('invariant: subtotal + cgst + sgst + roundOff === total', () => {
    for (const l of [[line(33, 3)], [line(99.99, 7), line(1, 1)], [line(150, 1)]]) {
      const t = computeTotals(l, 0.05);
      const sum = Math.round((t.subtotal + t.cgst + t.sgst + t.roundOff) * 100);
      expect(sum).toBe(Math.round(t.total * 100));
    }
  });
  it('handles a zero GST rate with no tax', () => {
    const t = computeTotals([line(100, 1)], 0);
    expect(t.cgst).toBe(0);
    expect(t.sgst).toBe(0);
    expect(t.total).toBe(100);
  });
  it('rounds to the nearest whole rupee', () => {
    expect(computeTotals([line(10, 1)], 0.05).total).toBe(11); // 10 + 0.5 -> 10.5 -> 11
    expect(computeTotals([line(20, 1)], 0.05).total).toBe(21); // 20 + 1.0 -> 21
  });
});

describe('formatMoney', () => {
  it('formats with the currency symbol and two decimals', () => {
    expect(formatMoney(121, '₹')).toBe('₹121.00');
    expect(formatMoney(1234.5, '₹')).toBe('₹1,234.50');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/analytical-register-pricing.test.ts`
Expected: FAIL — cannot resolve `@/components/sites/analytical-register/pricing`.

- [ ] **Step 3: Write `types.ts`**

```ts
// components/sites/analytical-register/types.ts
export interface Brand {
  id: string;
  name: string;
  tagline: string;
  accent: string; // hex, e.g. '#B5651D'
  gstNumber: string;
  phone: string; // digits for the wa.me sender (may include country code)
  currency: string; // '₹'
  gstRate: number; // 0.05
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  note?: string;
  active: boolean;
}

export interface Customer {
  phone: string; // natural key, digits only
  name: string;
  label?: string;
}

export interface OrderLine {
  menuItemId: string;
  name: string; // snapshot at bill time
  qty: number;
  unitPrice: number; // snapshot at bill time
}

export type OrderStatus = 'paid' | 'held';

export interface Order {
  id: string;
  billNumber: number; // sequential per brand
  createdAt: string; // ISO
  lines: OrderLine[];
  subtotal: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  total: number;
  customer?: Customer;
  note?: string;
  status: OrderStatus;
  brandName: string; // snapshot
  gstRate: number; // snapshot
  currency: string; // snapshot
}

export interface Totals {
  subtotal: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  total: number;
}
```

- [ ] **Step 4: Write `pricing.ts`**

```ts
// components/sites/analytical-register/pricing.ts
import type { OrderLine, Totals } from './types';

const paise = (n: number) => Math.round(n * 100);
const rupees = (p: number) => p / 100;

export function computeTotals(lines: OrderLine[], gstRate: number): Totals {
  let subtotalP = 0;
  for (const l of lines) subtotalP += paise(l.unitPrice) * l.qty;
  const taxP = Math.round(subtotalP * gstRate);
  const cgstP = Math.floor(taxP / 2);
  const sgstP = taxP - cgstP;
  const rawTotalP = subtotalP + taxP;
  const roundedTotalP = Math.round(rawTotalP / 100) * 100; // nearest whole rupee
  const roundOffP = roundedTotalP - rawTotalP;
  return {
    subtotal: rupees(subtotalP),
    cgst: rupees(cgstP),
    sgst: rupees(sgstP),
    roundOff: rupees(roundOffP),
    total: rupees(roundedTotalP),
  };
}

export function formatMoney(n: number, currency: string): string {
  return currency + n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run test/analytical-register-pricing.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add components/sites/analytical-register/types.ts components/sites/analytical-register/pricing.ts test/analytical-register-pricing.test.ts
git commit -m "feat(analytical-register): add types and GST money math"
```

---

### Task 2: Bill text + WhatsApp link

**Files:**
- Create: `components/sites/analytical-register/bill-text.ts`
- Test: `test/analytical-register-bill-text.test.ts`

**Interfaces:**
- Consumes: `Brand`, `Order` (types), `formatMoney` (pricing).
- Produces: `billToText(order: Order, brand: Brand): string`, `buildWaMeLink(order: Order, brand: Brand): string` (returns `''` when the order has no customer phone).

- [ ] **Step 1: Write the failing test**

```ts
// test/analytical-register-bill-text.test.ts
import { describe, expect, it } from 'vitest';
import { billToText, buildWaMeLink } from '@/components/sites/analytical-register/bill-text';
import type { Brand, Order } from '@/components/sites/analytical-register/types';

const brand: Brand = {
  id: 'ob', name: 'Bean & Brunch', tagline: 'x', accent: '#000',
  gstNumber: '27ABCDE1234F1Z5', phone: '919876543210', currency: '₹', gstRate: 0.05,
};
const order: Order = {
  id: '1', billNumber: 7, createdAt: '2026-10-17T09:30:00.000Z',
  lines: [{ menuItemId: 'm1', name: 'Cappuccino', qty: 2, unitPrice: 180 }],
  subtotal: 360, cgst: 9, sgst: 9, roundOff: 0, total: 378,
  customer: { phone: '919988776655', name: 'Aditi' },
  status: 'paid', brandName: 'Bean & Brunch', gstRate: 0.05, currency: '₹',
};

describe('billToText', () => {
  it('includes brand, bill number, lines, GST and total', () => {
    const t = billToText(order, brand);
    expect(t).toContain('Bean & Brunch');
    expect(t).toContain('#7');
    expect(t).toContain('Cappuccino');
    expect(t).toContain('CGST');
    expect(t).toContain('₹378.00');
    expect(t).toContain('Thank you');
  });
  it('omits CGST/SGST when the rate is zero', () => {
    const t = billToText({ ...order, cgst: 0, sgst: 0, gstRate: 0 }, brand);
    expect(t).not.toContain('CGST');
  });
});

describe('buildWaMeLink', () => {
  it('opens wa.me with the customer phone and encoded text', () => {
    const link = buildWaMeLink(order, brand);
    expect(link.startsWith('https://wa.me/919988776655?text=')).toBe(true);
    expect(link).toContain(encodeURIComponent('Thank you'));
  });
  it('returns an empty string when there is no phone', () => {
    expect(buildWaMeLink({ ...order, customer: undefined }, brand)).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/analytical-register-bill-text.test.ts`
Expected: FAIL — cannot resolve `bill-text`.

- [ ] **Step 3: Write `bill-text.ts`**

```ts
// components/sites/analytical-register/bill-text.ts
import { formatMoney } from './pricing';
import type { Brand, Order } from './types';

function day(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function billToText(order: Order, brand: Brand): string {
  const cur = order.currency;
  const lines = order.lines.map(
    (l) => `• ${l.name} x${l.qty}  ${formatMoney(l.unitPrice * l.qty, cur)}`,
  );
  const parts = [
    `*${order.brandName}*`,
    order.customer ? `Hi ${order.customer.name}, here is your bill.` : 'Here is your bill.',
    '',
    `Bill #${order.billNumber} · ${day(order.createdAt)}`,
    ...lines,
    '',
    `Subtotal: ${formatMoney(order.subtotal, cur)}`,
  ];
  if (order.cgst > 0 || order.sgst > 0) {
    parts.push(`CGST: ${formatMoney(order.cgst, cur)}`, `SGST: ${formatMoney(order.sgst, cur)}`);
  }
  if (order.roundOff !== 0) parts.push(`Round off: ${formatMoney(order.roundOff, cur)}`);
  parts.push(`*Total: ${formatMoney(order.total, cur)}*`);
  if (brand.gstNumber) parts.push(`GSTIN: ${brand.gstNumber}`);
  parts.push('', 'Thank you — visit again!');
  return parts.join('\n');
}

export function buildWaMeLink(order: Order, brand: Brand): string {
  const digits = (order.customer?.phone ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(billToText(order, brand))}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/analytical-register-bill-text.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add components/sites/analytical-register/bill-text.ts test/analytical-register-bill-text.test.ts
git commit -m "feat(analytical-register): add bill memo + wa.me link builder"
```

---

### Task 3: Default brand + cafe menu (data-as-code)

**Files:**
- Create: `components/sites/analytical-register/menu-data.ts`
- Test: `test/analytical-register-menu.test.ts`

**Interfaces:**
- Consumes: `Brand`, `MenuItem` (types).
- Produces: `defaultBrand: Brand`, `defaultMenu: MenuItem[]`.

- [ ] **Step 1: Write the failing test**

```ts
// test/analytical-register-menu.test.ts
import { describe, expect, it } from 'vitest';
import { defaultBrand, defaultMenu } from '@/components/sites/analytical-register/menu-data';

describe('defaultBrand', () => {
  it('is a configured cafe with a sender phone and GST rate', () => {
    expect(defaultBrand.id).toBeTruthy();
    expect(defaultBrand.name.trim().length).toBeGreaterThan(0);
    expect(defaultBrand.gstRate).toBeGreaterThanOrEqual(0);
    expect(defaultBrand.currency).toBe('₹');
  });
});

describe('defaultMenu', () => {
  it('has unique ids and positive prices', () => {
    expect(new Set(defaultMenu.map((m) => m.id)).size).toBe(defaultMenu.length);
    for (const m of defaultMenu) expect(m.price).toBeGreaterThan(0);
  });
  it('has at least three categories and every item active', () => {
    expect(new Set(defaultMenu.map((m) => m.category)).size).toBeGreaterThanOrEqual(3);
    expect(defaultMenu.every((m) => m.active)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/analytical-register-menu.test.ts`
Expected: FAIL — cannot resolve `menu-data`.

- [ ] **Step 3: Write `menu-data.ts`**

```ts
// components/sites/analytical-register/menu-data.ts
import type { Brand, MenuItem } from './types';

export const defaultBrand: Brand = {
  id: 'ob-cafe',
  name: 'Bean & Brunch',
  tagline: 'Coffee, bakes and all-day plates',
  accent: '#B5651D',
  gstNumber: '27ABCDE1234F1Z5',
  phone: '919876543210',
  currency: '₹',
  gstRate: 0.05,
};

// Realistic cafe catalogue. Prices in whole rupees.
const raw: Array<[string, string, number, string?]> = [
  ['c-appu', 'Cappuccino', 'Coffee', 180],
  ['c-latte', 'Café Latte', 'Coffee', 200],
  ['c-espr', 'Espresso', 'Coffee', 130],
  ['c-cold', 'Cold Brew', 'Coffee', 220, '12-hour steeped'],
  ['c-mocha', 'Mocha', 'Coffee', 230],
  ['t-masala', 'Masala Chai', 'Tea', 90],
  ['t-green', 'Green Tea', 'Tea', 80],
  ['t-lemon', 'Lemon Honey Tea', 'Tea', 110],
  ['b-bagel', 'Butter Bagel', 'Bakes', 120],
  ['b-crois', 'Almond Croissant', 'Bakes', 190],
  ['b-banana', 'Banana Bread', 'Bakes', 150],
  ['b-cookie', 'Choco Cookie', 'Bakes', 80],
  ['f-sandw', 'Grilled Veg Sandwich', 'Food', 240],
  ['f-pasta', 'Arrabiata Pasta', 'Food', 320],
  ['f-panini', 'Paneer Panini', 'Food', 280],
  ['f-caesar', 'Caesar Salad', 'Food', 300, 'add chicken +60'],
  ['d-brownie', 'Walnut Brownie', 'Desserts', 170],
  ['d-cheese', 'Basque Cheesecake', 'Desserts', 260],
];

export const defaultMenu: MenuItem[] = raw.map(([id, name, category, price, note]) => ({
  id, name, category, price, note, active: true,
}));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/analytical-register-menu.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/sites/analytical-register/menu-data.ts test/analytical-register-menu.test.ts
git commit -m "feat(analytical-register): add default brand and cafe menu"
```

---

### Task 4: Deterministic order-history seed

**Files:**
- Create: `components/sites/analytical-register/seed.ts`
- Test: `test/analytical-register-seed.test.ts`

**Interfaces:**
- Consumes: `Brand`, `MenuItem`, `Order` (types), `computeTotals` (pricing).
- Produces: `seedOrders(menu: MenuItem[], brand: Brand, opts?: { days?: number; seed?: number; now?: Date }): Order[]` — returns orders with sequential `billNumber` (1..N), each total satisfying the Task 1 invariant.

- [ ] **Step 1: Write the failing test**

```ts
// test/analytical-register-seed.test.ts
import { describe, expect, it } from 'vitest';
import { seedOrders } from '@/components/sites/analytical-register/seed';
import { defaultBrand, defaultMenu } from '@/components/sites/analytical-register/menu-data';

describe('seedOrders', () => {
  it('is deterministic for the same seed', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    const a = seedOrders(defaultMenu, defaultBrand, { days: 30, seed: 42, now });
    const b = seedOrders(defaultMenu, defaultBrand, { days: 30, seed: 42, now });
    expect(a).toEqual(b);
  });
  it('produces sequential bill numbers and a 75-day span by default', () => {
    const now = new Date('2026-10-17T00:00:00Z');
    const orders = seedOrders(defaultMenu, defaultBrand, { now });
    expect(orders[0].billNumber).toBe(1);
    expect(orders[orders.length - 1].billNumber).toBe(orders.length);
    expect(orders.length).toBeGreaterThan(60);
    const oldest = new Date(orders[0].createdAt).getTime();
    const newest = new Date(orders[orders.length - 1].createdAt).getTime();
    expect(newest - oldest).toBeGreaterThan(60 * 86400000);
  });
  it('every seeded order satisfies the money invariant', () => {
    const orders = seedOrders(defaultMenu, defaultBrand, { days: 20, seed: 7 });
    for (const o of orders) {
      const sum = Math.round((o.subtotal + o.cgst + o.sgst + o.roundOff) * 100);
      expect(sum).toBe(Math.round(o.total * 100));
      expect(o.lines.length).toBeGreaterThan(0);
      expect(o.currency).toBe(defaultBrand.currency);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/analytical-register-seed.test.ts`
Expected: FAIL — cannot resolve `seed`.

- [ ] **Step 3: Write `seed.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/analytical-register-seed.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/sites/analytical-register/seed.ts test/analytical-register-seed.test.ts
git commit -m "feat(analytical-register): add deterministic order-history seed"
```

---

### Task 5: Analytics aggregations

**Files:**
- Create: `components/sites/analytical-register/analytics.ts`
- Test: `test/analytical-register-analytics.test.ts`

**Interfaces:**
- Consumes: `MenuItem`, `Order` (types).
- Produces:
  - `Kpis`, `DayPoint`, `NamedValue` interfaces.
  - `computeKpis(orders: Order[]): Kpis`
  - `revenueByDay(orders: Order[], fromDate: string, toDate: string): DayPoint[]` (`YYYY-MM-DD` keys)
  - `topItems(orders: Order[], limit: number): NamedValue[]`
  - `categoryMix(orders: Order[], menu: MenuItem[]): NamedValue[]`
  - `weekdayWeekend(orders: Order[]): { weekday: number; weekend: number }` (revenue)

- [ ] **Step 1: Write the failing test**

```ts
// test/analytical-register-analytics.test.ts
import { describe, expect, it } from 'vitest';
import {
  computeKpis, revenueByDay, topItems, categoryMix, weekdayWeekend,
} from '@/components/sites/analytical-register/analytics';
import type { MenuItem, Order } from '@/components/sites/analytical-register/types';

const menu: MenuItem[] = [
  { id: 'a', name: 'Latte', category: 'Coffee', price: 200, active: true },
  { id: 'b', name: 'Bagel', category: 'Bakes', price: 120, active: true },
];
const o = (over: Partial<Order>): Order => ({
  id: 'x', billNumber: 1, createdAt: '2026-10-17T10:00:00Z',
  lines: [{ menuItemId: 'a', name: 'Latte', qty: 2, unitPrice: 200 }],
  subtotal: 400, cgst: 10, sgst: 10, roundOff: 0, total: 420,
  status: 'paid', brandName: 'B', gstRate: 0.05, currency: '₹', ...over,
});

describe('computeKpis', () => {
  it('sums revenue, counts orders, averages order value, counts items', () => {
    const k = computeKpis([o({}), o({ total: 100, lines: [{ menuItemId: 'b', name: 'Bagel', qty: 3, unitPrice: 120 }] })]);
    expect(k.revenue).toBe(520);
    expect(k.orders).toBe(2);
    expect(k.aov).toBe(260);
    expect(k.itemsSold).toBe(5);
  });
  it('handles an empty list without dividing by zero', () => {
    expect(computeKpis([])).toEqual({ revenue: 0, orders: 0, aov: 0, itemsSold: 0 });
  });
});

describe('revenueByDay', () => {
  it('buckets orders within the inclusive range', () => {
    const pts = revenueByDay(
      [o({ createdAt: '2026-10-16T05:00:00Z' }), o({ createdAt: '2026-10-17T05:00:00Z' })],
      '2026-10-15', '2026-10-17',
    );
    expect(pts.find((p) => p.date === '2026-10-17')?.revenue).toBe(420);
  });
});

describe('topItems / categoryMix / weekdayWeekend', () => {
  it('ranks items by quantity', () => {
    const t = topItems([o({}), o({ lines: [{ menuItemId: 'b', name: 'Bagel', qty: 9, unitPrice: 120 }] })], 5);
    expect(t[0]).toEqual({ name: 'Bagel', value: 9 });
  });
  it('splits revenue by category', () => {
    const c = categoryMix([o({})], menu);
    expect(c).toEqual([{ name: 'Coffee', value: 400 }]);
  });
  it('separates weekend (Sat/Sun) from weekday revenue', () => {
    const w = weekdayWeekend([
      o({ createdAt: '2026-10-17T10:00:00Z' }), // Saturday
      o({ createdAt: '2026-10-19T10:00:00Z', total: 100 }), // Monday
    ]);
    expect(w.weekend).toBe(420);
    expect(w.weekday).toBe(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/analytical-register-analytics.test.ts`
Expected: FAIL — cannot resolve `analytics`.

- [ ] **Step 3: Write `analytics.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/analytical-register-analytics.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add components/sites/analytical-register/analytics.ts test/analytical-register-analytics.test.ts
git commit -m "feat(analytical-register): add analytics aggregations"
```

---

### Task 6: Pure store reducer

**Files:**
- Create: `components/sites/analytical-register/reducer.ts`
- Test: `test/analytical-register-reducer.test.ts`

**Interfaces:**
- Consumes: `Brand`, `MenuItem`, `Customer`, `Order`, `OrderLine`, `StoreState` (types from Task 1 + `StoreState` defined here), `computeTotals` (pricing), `defaultBrand`/`defaultMenu` (menu-data), `seedOrders` (seed).
- Produces: `StoreState` interface, `initState(orders?: Order[]): StoreState`, `orderbookReducer(state: StoreState, action: Action): StoreState`, and the `Action` union. Order ids and timestamps are passed IN via actions (never generated inside) so the reducer stays pure.

- [ ] **Step 1: Write the failing test**

```ts
// test/analytical-register-reducer.test.ts
import { describe, expect, it } from 'vitest';
import { initState, orderbookReducer } from '@/components/sites/analytical-register/reducer';
import { defaultMenu } from '@/components/sites/analytical-register/menu-data';

const item = (id: string, price: number) => defaultMenu.find((m) => m.id === id) ?? { id, name: id, category: 'X', price, active: true };

describe('orderbookReducer — ticket', () => {
  it('add-line increments an existing line rather than duplicating', () => {
    let s = orderbookReducer(initState(), { type: 'add-line', item: item('c-appu', 180) });
    s = orderbookReducer(s, { type: 'add-line', item: item('c-appu', 180) });
    expect(s.ticket).toHaveLength(1);
    expect(s.ticket[0].qty).toBe(2);
  });
  it('set-qty removes a line when qty drops to zero', () => {
    const s = orderbookReducer(
      orderbookReducer(initState(), { type: 'add-line', item: item('c-appu', 180) }),
      { type: 'set-qty', menuItemId: 'c-appu', qty: 0 },
    );
    expect(s.ticket).toHaveLength(0);
  });
  it('clear-ticket empties the ticket', () => {
    const s = orderbookReducer(
      orderbookReducer(initState(), { type: 'add-line', item: item('c-appu', 180) }),
      { type: 'clear-ticket' },
    );
    expect(s.ticket).toEqual([]);
  });
});

describe('orderbookReducer — create-order', () => {
  const withTicket = () =>
    orderbookReducer(
      orderbookReducer(initState(), { type: 'add-line', item: item('c-appu', 180) }),
      { type: 'set-ticket-customer', customer: { phone: '919988776655', name: 'Aditi' } },
    );

  it('moves the ticket into a paid order with totals and clears it', () => {
    const s = orderbookReducer(withTicket(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    expect(s.ticket).toEqual([]);
    expect(s.orders).toHaveLength(1);
    const order = s.orders[0];
    expect(order.billNumber).toBe(1);
    expect(order.status).toBe('paid');
    expect(order.brandName).toBe(s.brand.name);
    expect(Math.round((order.subtotal + order.cgst + order.sgst + order.roundOff) * 100))
      .toBe(Math.round(order.total * 100));
  });
  it('assigns sequential bill numbers', () => {
    let s = orderbookReducer(withTicket(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    s = orderbookReducer(
      orderbookReducer(s, { type: 'add-line', item: item('b-bagel', 120) }),
      { type: 'create-order', id: 'o2', now: '2026-10-17T10:05:00Z' },
    );
    expect(s.orders.map((o) => o.billNumber)).toEqual([1, 2]);
  });
  it('upserts the customer by phone', () => {
    const s = orderbookReducer(withTicket(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    expect(s.customers.map((c) => c.phone)).toContain('919988776655');
  });
  it('ignores create-order on an empty ticket', () => {
    const s = orderbookReducer(initState(), { type: 'create-order', id: 'o1', now: '2026-10-17T10:00:00Z' });
    expect(s.orders).toHaveLength(0);
  });
});

describe('orderbookReducer — menu, brand, reset', () => {
  it('archive-item keeps the item for history but drops it from the active grid', () => {
    const s = orderbookReducer(initState(), { type: 'archive-item', id: 'c-appu' });
    expect(s.menu.find((m) => m.id === 'c-appu')?.active).toBe(false);
  });
  it('update-brand patches fields', () => {
    const s = orderbookReducer(initState(), { type: 'update-brand', patch: { name: 'New Name', accent: '#123456' } });
    expect(s.brand.name).toBe('New Name');
    expect(s.brand.accent).toBe('#123456');
  });
  it('reset restores defaults and a fresh seed', () => {
    let s = orderbookReducer(initState(), { type: 'update-brand', patch: { name: 'Changed' } });
    s = orderbookReducer(s, { type: 'reset' });
    expect(s.brand.name).not.toBe('Changed');
    expect(s.orders.length).toBeGreaterThan(0);
  });
});

describe('initState', () => {
  it('seeds orders when none provided', () => {
    expect(initState().orders.length).toBeGreaterThan(0);
  });
  it('accepts a provided order list', () => {
    expect(initState([]).orders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/analytical-register-reducer.test.ts`
Expected: FAIL — cannot resolve `reducer`.

- [ ] **Step 3: Write `reducer.ts`**

```ts
// components/sites/analytical-register/reducer.ts
import { defaultBrand, defaultMenu } from './menu-data';
import { computeTotals } from './pricing';
import { seedOrders } from './seed';
import type { Brand, Customer, MenuItem, Order, OrderLine } from './types';

export interface StoreState {
  brand: Brand;
  menu: MenuItem[];
  customers: Customer[];
  orders: Order[];
  ticket: OrderLine[];
  ticketCustomer?: Customer;
  ticketNote?: string;
}

export type Action =
  | { type: 'hydrate'; state: StoreState }
  | { type: 'add-line'; item: MenuItem }
  | { type: 'set-qty'; menuItemId: string; qty: number }
  | { type: 'remove-line'; menuItemId: string }
  | { type: 'clear-ticket' }
  | { type: 'set-ticket-customer'; customer?: Customer }
  | { type: 'set-ticket-note'; note: string }
  | { type: 'create-order'; id: string; now: string }
  | { type: 'upsert-item'; item: MenuItem }
  | { type: 'archive-item'; id: string }
  | { type: 'update-brand'; patch: Partial<Brand> }
  | { type: 'reset' };

const nextBill = (orders: Order[]) =>
  orders.reduce((max, o) => Math.max(max, o.billNumber), 0) + 1;

export function initState(orders?: Order[]): StoreState {
  const brand = defaultBrand;
  return {
    brand,
    menu: defaultMenu,
    customers: [],
    orders: orders ?? seedOrders(defaultMenu, brand),
    ticket: [],
  };
}

export function orderbookReducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'add-line': {
      const existing = state.ticket.find((l) => l.menuItemId === action.item.id);
      const ticket = existing
        ? state.ticket.map((l) => (l.menuItemId === action.item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...state.ticket, { menuItemId: action.item.id, name: action.item.name, qty: 1, unitPrice: action.item.price }];
      return { ...state, ticket };
    }
    case 'set-qty': {
      if (action.qty <= 0) return { ...state, ticket: state.ticket.filter((l) => l.menuItemId !== action.menuItemId) };
      return { ...state, ticket: state.ticket.map((l) => (l.menuItemId === action.menuItemId ? { ...l, qty: action.qty } : l)) };
    }
    case 'remove-line':
      return { ...state, ticket: state.ticket.filter((l) => l.menuItemId !== action.menuItemId) };
    case 'clear-ticket':
      return { ...state, ticket: [], ticketCustomer: undefined, ticketNote: undefined };
    case 'set-ticket-customer':
      return { ...state, ticketCustomer: action.customer };
    case 'set-ticket-note':
      return { ...state, ticketNote: action.note };
    case 'create-order': {
      if (state.ticket.length === 0) return state;
      const totals = computeTotals(state.ticket, state.brand.gstRate);
      const order: Order = {
        id: action.id,
        billNumber: nextBill(state.orders),
        createdAt: action.now,
        lines: state.ticket,
        ...totals,
        customer: state.ticketCustomer,
        note: state.ticketNote,
        status: 'paid',
        brandName: state.brand.name,
        gstRate: state.brand.gstRate,
        currency: state.brand.currency,
      };
      const customers = state.ticketCustomer
        ? [
            ...state.customers.filter((c) => c.phone !== state.ticketCustomer!.phone),
            state.ticketCustomer,
          ]
        : state.customers;
      return {
        ...state,
        orders: [...state.orders, order],
        customers,
        ticket: [],
        ticketCustomer: undefined,
        ticketNote: undefined,
      };
    }
    case 'upsert-item': {
      const exists = state.menu.some((m) => m.id === action.item.id);
      return {
        ...state,
        menu: exists
          ? state.menu.map((m) => (m.id === action.item.id ? action.item : m))
          : [...state.menu, action.item],
      };
    }
    case 'archive-item':
      return { ...state, menu: state.menu.map((m) => (m.id === action.id ? { ...m, active: false } : m)) };
    case 'update-brand':
      return { ...state, brand: { ...state.brand, ...action.patch } };
    case 'reset':
      return initState();
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/analytical-register-reducer.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add components/sites/analytical-register/reducer.ts test/analytical-register-reducer.test.ts
git commit -m "feat(analytical-register): add pure store reducer"
```

---

### Task 7: Page route, provider, theme, app shell + Register + Ticket + BillView

This task delivers the first end-to-end flow: open `/analytical-register`, tap menu items, fill the ticket, create a bill, view the cash memo, and Send on WhatsApp.

**Files:**
- Create: `app/(sites)/analytical-register/page.tsx`
- Create: `components/sites/analytical-register/store.tsx`
- Create: `components/sites/analytical-register/OrderBook.tsx`
- Create: `components/sites/analytical-register/Register.tsx`
- Create: `components/sites/analytical-register/Ticket.tsx`
- Create: `components/sites/analytical-register/BillView.tsx`
- Modify: `app/globals.css` (append a scoped `.orderbook` theme block at the end)

**Interfaces:**
- Consumes: `orderbookReducer`/`initState`/`StoreState`/`Action` (reducer), `defaultMenu`/`defaultBrand` (menu-data), `formatMoney` (pricing), `computeTotals` (pricing), `buildWaMeLink`/`billToText` (bill-text), types.
- Produces:
  - `StoreProvider` (React context) and `useOrderBook(): { state: StoreState; dispatch: React.Dispatch<Action> }`.
  - Client components `OrderBook`, `Register`, `Ticket`, `BillView` (default export in each is the named export).
  - The page renders `<OrderBook />` inside `<StoreProvider>`.

- [ ] **Step 1: Create the page route**

```tsx
// app/(sites)/analytical-register/page.tsx
import type { Metadata } from 'next';
import { OrderBook } from '@/components/sites/analytical-register/OrderBook';

export const metadata: Metadata = {
  title: 'OrderBook — Order Register & Business Analytics',
  description:
    'A point-of-sale register for any café or shop: take orders, build GST bills, send them on WhatsApp, and watch your revenue, top items and trends update live.',
};

export default function OrderBookPage() {
  return <OrderBook />;
}
```

- [ ] **Step 2: Write the provider with localStorage hydration**

```tsx
// components/sites/analytical-register/store.tsx
'use client';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { initState, orderbookReducer, type Action, type StoreState } from './reducer';

const KEY = 'orderbook:v1';

function load(): StoreState {
  if (typeof window === 'undefined') return initState([]);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initState();
    const parsed = JSON.parse(raw) as StoreState;
    if (!parsed?.brand || !Array.isArray(parsed.menu) || !Array.isArray(parsed.orders)) {
      return initState(); // corrupt shape -> re-seed rather than crash on mount
    }
    return parsed;
  } catch {
    return initState();
  }
}

const Ctx = createContext<{ state: StoreState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderbookReducer, undefined, load);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode / quota — the session still works in memory */
    }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useOrderBook() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrderBook must be used inside StoreProvider');
  return ctx;
}
```

- [ ] **Step 3: Append the scoped theme block to `app/globals.css`**

Add at the very end of the file (all selectors namespaced under `.orderbook`; the accent is driven by an inline CSS variable set on the shell, so rebranding repaints the whole workspace):

```css
/* ============================================================
   OrderBook (analytical-register) — scoped POS theme.
   Light, dense, tablet-first operator workspace. Never reads
   brand tokens; rebranding updates --ob-accent at runtime.
   ============================================================ */
.orderbook {
  --ob-accent: #B5651D;
  --ob-canvas: #F6F4F0;
  --ob-card: #FFFFFF;
  --ob-ink: #1A1612;
  --ob-muted: #6B615A;
  --ob-line: #E7E0D7;
  color-scheme: light;
  background: var(--ob-canvas);
  color: var(--ob-ink);
}
.orderbook .ob-card {
  background: var(--ob-card);
  border: 1px solid var(--ob-line);
  border-radius: 14px;
}
.orderbook .ob-accent-text { color: var(--ob-accent); }
.orderbook .ob-btn {
  background: var(--ob-accent);
  color: #fff;
  border-radius: 10px;
  font-weight: 600;
  padding: 0.6rem 1rem;
}
.orderbook .ob-btn-ghost {
  background: transparent;
  color: var(--ob-ink);
  border: 1px solid var(--ob-line);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  font-weight: 600;
}
.orderbook .ob-tile {
  border: 1px solid var(--ob-line);
  border-radius: 12px;
  background: var(--ob-card);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.orderbook .ob-tile:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
@media (prefers-reduced-motion: reduce) {
  .orderbook .ob-tile { transition: none; }
  .orderbook .ob-tile:hover { transform: none; box-shadow: none; }
}
```

- [ ] **Step 4: Write the app shell + nav**

```tsx
// components/sites/analytical-register/OrderBook.tsx
'use client';
import { useState } from 'react';
import { StoreProvider, useOrderBook } from './store';
import { Register } from './Register';
import { Settings } from './Settings';

type View = 'register' | 'orders' | 'analytics' | 'menu' | 'settings';
const NAV: { id: View; label: string }[] = [
  { id: 'register', label: 'Register' },
  { id: 'orders', label: 'Orders' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'menu', label: 'Menu' },
  { id: 'settings', label: 'Settings' },
];

function Workspace() {
  const { state } = useOrderBook();
  const [view, setView] = useState<View>('register');
  return (
    <div className="orderbook min-h-screen" style={{ ['--ob-accent' as string]: state.brand.accent }}>
      <header className="sticky top-0 z-10 border-b border-[var(--ob-line)] bg-[var(--ob-canvas)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <span className="text-lg font-extrabold ob-accent-text">{state.brand.name}</span>
          <nav className="ml-auto flex gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                aria-pressed={view === n.id}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${view === n.id ? 'ob-btn' : 'ob-btn-ghost'}`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === 'register' && <Register />}
        {(view === 'orders' || view === 'analytics' || view === 'menu') && (
          <p className="text-[var(--ob-muted)]">This screen is added in Tasks 8–10.</p>
        )}
        {view === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export function OrderBook() {
  return (
    <StoreProvider>
      <Workspace />
    </StoreProvider>
  );
}
```

> **Note:** the placeholder text for Orders/Analytics/Menu above is temporary *within this task's shell wiring only* and is replaced by the real `<OrdersLog />`/`<Analytics />`/`<MenuManager />` mounts in Tasks 8, 9, and 10. Settings is built here because rebrand/reset is exercised alongside the theme variable; if you prefer, defer `<Settings />` to Task 11 and drop its nav case for now.

- [ ] **Step 5: Minimal Settings so rebrand + reset are testable now**

```tsx
// components/sites/analytical-register/Settings.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';

export function Settings() {
  const { state, dispatch } = useOrderBook();
  const [name, setName] = useState(state.brand.name);
  const [accent, setAccent] = useState(state.brand.accent);
  const [phone, setPhone] = useState(state.brand.phone);
  return (
    <section className="ob-card mx-auto max-w-xl space-y-4 p-6">
      <h2 className="text-xl font-bold">Brand settings</h2>
      <label className="block text-sm font-semibold">
        Business name
        <input className="mt-1 w-full rounded-lg border border-[var(--ob-line)] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Accent colour
        <input type="color" className="mt-1 h-10 w-20 rounded" value={accent} onChange={(e) => setAccent(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        WhatsApp sender number
        <input className="mt-1 w-full rounded-lg border border-[var(--ob-line)] px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button className="ob-btn" onClick={() => dispatch({ type: 'update-brand', patch: { name, accent, phone } })}>Save</button>
        <button className="ob-btn-ghost" onClick={() => { if (confirm('Reset all demo data? Your edits are lost.')) dispatch({ type: 'reset' }); }}>Reset demo data</button>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Write Register (menu grid)**

```tsx
// components/sites/analytical-register/Register.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';
import { Ticket } from './Ticket';
import type { MenuItem } from './types';

export function Register() {
  const { state, dispatch } = useOrderBook();
  const items = state.menu.filter((m) => m.active);
  const categories = [...new Set(items.map((m) => m.category))];
  const [cat, setCat] = useState<string>('All');
  const shown = cat === 'All' ? items : items.filter((m) => m.category === cat);
  const add = (item: MenuItem) => dispatch({ type: 'add-line', item });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', ...categories].map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${cat === c ? 'ob-btn' : 'ob-btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((m) => (
            <button key={m.id} onClick={() => add(m)} className="ob-tile p-3 text-left">
              <div className="font-semibold">{m.name}</div>
              {m.note && <div className="text-xs text-[var(--ob-muted)]">{m.note}</div>}
              <div className="mt-1 ob-accent-text font-bold">₹{m.price}</div>
            </button>
          ))}
        </div>
      </div>
      <Ticket />
    </div>
  );
}
```

- [ ] **Step 7: Write Ticket (line items, customer, create bill)**

```tsx
// components/sites/analytical-register/Ticket.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';
import { computeTotals, formatMoney } from './pricing';
import { BillView } from './BillView';
import type { Order } from './types';

const digits = (s: string) => s.replace(/\D/g, '');

export function Ticket() {
  const { state, dispatch } = useOrderBook();
  const [lastBill, setLastBill] = useState<Order | null>(null);
  const totals = computeTotals(state.ticket, state.brand.gstRate);
  const cust = state.ticketCustomer ?? { phone: '', name: '' };

  const create = () => {
    const cleanPhone = digits(cust.phone);
    const order = {
      id: (crypto.randomUUID?.() ?? String(Date.now())),
      now: new Date().toISOString(),
    };
    dispatch({ type: 'set-ticket-customer', customer: cleanPhone || cust.name ? { phone: cleanPhone, name: cust.name } : undefined });
    dispatch({ type: 'create-order', id: order.id, now: order.now });
    // Build the preview order locally so the memo opens immediately.
    const preview: Order = {
      id: order.id,
      billNumber: state.orders.length + 1,
      createdAt: order.now,
      lines: state.ticket,
      ...totals,
      customer: cleanPhone || cust.name ? { phone: cleanPhone, name: cust.name } : undefined,
      note: state.ticketNote,
      status: 'paid',
      brandName: state.brand.name,
      gstRate: state.brand.gstRate,
      currency: state.brand.currency,
    };
    setLastBill(preview);
  };

  return (
    <aside className="ob-card h-fit p-4 lg:sticky lg:top-20">
      <h2 className="mb-3 text-lg font-bold">Current ticket</h2>
      {state.ticket.length === 0 && <p className="text-sm text-[var(--ob-muted)]">Tap menu items to add them.</p>}
      <ul className="space-y-2">
        {state.ticket.map((l) => (
          <li key={l.menuItemId} className="flex items-center gap-2 text-sm">
            <span className="flex-1">{l.name}</span>
            <button className="rounded border border-[var(--ob-line)] px-2" onClick={() => dispatch({ type: 'set-qty', menuItemId: l.menuItemId, qty: l.qty - 1 })}>−</button>
            <span className="w-6 text-center">{l.qty}</span>
            <button className="rounded border border-[var(--ob-line)] px-2" onClick={() => dispatch({ type: 'set-qty', menuItemId: l.menuItemId, qty: l.qty + 1 })}>+</button>
            <span className="w-16 text-right">{formatMoney(l.unitPrice * l.qty, state.brand.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-2 border-t border-[var(--ob-line)] pt-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(totals.subtotal, state.brand.currency)}</span></div>
        {totals.cgst > 0 && <div className="flex justify-between"><span>CGST</span><span>{formatMoney(totals.cgst, state.brand.currency)}</span></div>}
        {totals.sgst > 0 && <div className="flex justify-between"><span>SGST</span><span>{formatMoney(totals.sgst, state.brand.currency)}</span></div>}
        {totals.roundOff !== 0 && <div className="flex justify-between"><span>Round off</span><span>{formatMoney(totals.roundOff, state.brand.currency)}</span></div>}
        <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(totals.total, state.brand.currency)}</span></div>
      </div>
      <div className="mt-3 space-y-2">
        <input placeholder="Customer name" className="w-full rounded-lg border border-[var(--ob-line)] px-3 py-2 text-sm"
          value={cust.name} onChange={(e) => dispatch({ type: 'set-ticket-customer', customer: { ...cust, name: e.target.value } })} />
        <input placeholder="Phone (with country code)" className="w-full rounded-lg border border-[var(--ob-line)] px-3 py-2 text-sm"
          value={cust.phone} onChange={(e) => dispatch({ type: 'set-ticket-customer', customer: { ...cust, phone: e.target.value } })} />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="ob-btn-ghost flex-1" onClick={() => dispatch({ type: 'clear-ticket' })} disabled={state.ticket.length === 0}>Clear</button>
        <button className="ob-btn flex-1" onClick={create} disabled={state.ticket.length === 0}>Create bill</button>
      </div>
      {lastBill && <BillView order={lastBill} onClose={() => setLastBill(null)} />}
    </aside>
  );
}
```

- [ ] **Step 8: Write BillView (cash memo + WhatsApp + Copy)**

```tsx
// components/sites/analytical-register/BillView.tsx
'use client';
import { useEffect } from 'react';
import { useOrderBook } from './store';
import { formatMoney } from './pricing';
import { billToText, buildWaMeLink } from './bill-text';
import type { Order } from './types';

export function BillView({ order, onClose }: { order: Order; onClose: () => void }) {
  const { state } = useOrderBook();
  const link = buildWaMeLink(order, state.brand);
  const cur = order.currency;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Bill ${order.billNumber}`}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="ob-card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-lg font-extrabold ob-accent-text">{order.brandName}</div>
          <div className="text-xs text-[var(--ob-muted)]">Bill #{order.billNumber}</div>
        </div>
        <ul className="my-4 space-y-1 text-sm">
          {order.lines.map((l) => (
            <li key={l.menuItemId} className="flex justify-between"><span>{l.name} ×{l.qty}</span><span>{formatMoney(l.unitPrice * l.qty, cur)}</span></li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-[var(--ob-line)] pt-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal, cur)}</span></div>
          {order.cgst > 0 && <div className="flex justify-between"><span>CGST</span><span>{formatMoney(order.cgst, cur)}</span></div>}
          {order.sgst > 0 && <div className="flex justify-between"><span>SGST</span><span>{formatMoney(order.sgst, cur)}</span></div>}
          {order.roundOff !== 0 && <div className="flex justify-between"><span>Round off</span><span>{formatMoney(order.roundOff, cur)}</span></div>}
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(order.total, cur)}</span></div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {link
            ? <a className="ob-btn text-center" href={link} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
            : <button className="ob-btn" disabled title="Add a customer phone to enable WhatsApp">Send on WhatsApp</button>}
          <button className="ob-btn-ghost" onClick={() => navigator.clipboard?.writeText(billToText(order, state.brand))}>Copy bill</button>
          <button className="text-sm text-[var(--ob-muted)]" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Typecheck, lint, and run the whole suite**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: no type errors, no lint errors, all Vitest suites pass (including the existing repo tests — confirm OrderBook's memo, reducer, seed tests are green).

- [ ] **Step 10: Browser golden path**

Run `npm run dev` and open `http://localhost:3000/analytical-register` (if a dev server is already running, reuse it — do not start a second `next dev`).
Verify: menu grid renders the café items; tapping adds to the ticket and increments; totals show CGST/SGST/round-off; fill a phone and Create bill opens the memo; Send on WhatsApp is an `https://wa.me/...` link; Copy puts the memo on the clipboard; reload keeps the created order (check Orders later). Settings: rename + accent, Save, confirm the header and buttons repaint; Reset demo data re-seeds.

- [ ] **Step 11: Commit**

```bash
git add app/\(sites\)/analytical-register/page.tsx components/sites/analytical-register/ app/globals.css
git commit -m "feat(analytical-register): add OrderBook shell, register, ticket and bill flow"
```

---

### Task 8: Orders log

**Files:**
- Create: `components/sites/analytical-register/OrdersLog.tsx`
- Modify: `components/sites/analytical-register/OrderBook.tsx` (replace the Orders placeholder with `<OrdersLog />` and import it)

**Interfaces:**
- Consumes: `useOrderBook` (store), `formatMoney` (pricing), `buildWaMeLink`/`billToText` (bill-text), `BillView` (Task 7), types.
- Produces: `OrdersLog` client component.

- [ ] **Step 1: Write the component**

```tsx
// components/sites/analytical-register/OrdersLog.tsx
'use client';
import { useMemo, useState } from 'react';
import { useOrderBook } from './store';
import { formatMoney } from './pricing';
import { BillView } from './BillView';
import type { Order } from './types';

export function OrdersLog() {
  const { state } = useOrderBook();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Order | null>(null);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...state.orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((o) => !needle
        || String(o.billNumber).includes(needle)
        || (o.customer?.name ?? '').toLowerCase().includes(needle)
        || o.lines.some((l) => l.name.toLowerCase().includes(needle)));
  }, [state.orders, q]);

  return (
    <section className="ob-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Orders</h2>
        <input placeholder="Search bill, customer, item" value={q} onChange={(e) => setQ(e.target.value)}
          className="w-56 rounded-lg border border-[var(--ob-line)] px-3 py-1.5 text-sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--ob-muted)]">
            <tr><th className="py-2">#</th><th>Date</th><th>Customer</th><th>Items</th><th className="text-right">Total</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-[var(--ob-line)]">
                <td className="py-2">{o.billNumber}</td>
                <td>{new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td>{o.customer?.name ?? '—'}</td>
                <td>{o.lines.reduce((n, l) => n + l.qty, 0)}</td>
                <td className="text-right font-semibold">{formatMoney(o.total, o.currency)}</td>
                <td className="text-right"><button className="ob-btn-ghost py-1 text-xs" onClick={() => setOpen(o)}>View bill</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-[var(--ob-muted)]">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <BillView order={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
```

- [ ] **Step 2: Wire it into the shell**

In `OrderBook.tsx`, import `OrdersLog` and change the view render so `view === 'orders'` renders `<OrdersLog />` instead of the placeholder `<p>` (remove `orders` from the placeholder condition).

- [ ] **Step 3: Verify**

Run `npx tsc --noEmit`. Then in the browser open the Orders tab: created bills plus the seeded history appear (newest first); search filters; View bill reopens the memo with a working WhatsApp link.

- [ ] **Step 4: Commit**

```bash
git add components/sites/analytical-register/OrdersLog.tsx components/sites/analytical-register/OrderBook.tsx
git commit -m "feat(analytical-register): add orders log with search and re-send"
```

---

### Task 9: Analytics dashboard + SVG charts

**Files:**
- Create: `components/sites/analytical-register/charts/Line.tsx`
- Create: `components/sites/analytical-register/charts/Bar.tsx`
- Create: `components/sites/analytical-register/charts/Donut.tsx`
- Create: `components/sites/analytical-register/Analytics.tsx`
- Modify: `components/sites/analytical-register/OrderBook.tsx` (mount `<Analytics />`)

**Interfaces:**
- Consumes: `computeKpis`/`revenueByDay`/`topItems`/`categoryMix`/`weekdayWeekend` + types `DayPoint`/`NamedValue` (analytics), `formatMoney` (pricing), `useOrderBook` (store).
- Produces: chart components `Line({ data: DayPoint[] })`, `Bar({ data: NamedValue[] })`, `Donut({ data: NamedValue[] })`, and `Analytics`.

- [ ] **Step 1: Write `charts/Line.tsx` (revenue-by-day)**

```tsx
// components/sites/analytical-register/charts/Line.tsx
type Props = { data: { date: string; revenue: number }[]; width?: number; height?: number };

export function Line({ data, width = 560, height = 200 }: Props) {
  if (data.length === 0) return <p className="text-sm text-[var(--ob-muted)]">No data.</p>;
  const pad = 24;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [pad + i * step, height - pad - (d.revenue / max) * (height - pad * 2)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Revenue by day">
      <path d={path} fill="none" stroke="var(--ob-accent)" strokeWidth={2} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2} fill="var(--ob-accent)" />)}
    </svg>
  );
}
```

- [ ] **Step 2: Write `charts/Bar.tsx` (top items)**

```tsx
// components/sites/analytical-register/charts/Bar.tsx
type Props = { data: { name: string; value: number }[] };

export function Bar({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.name} className="text-sm">
          <div className="flex justify-between"><span>{d.name}</span><span className="tabular-nums">{d.value}</span></div>
          <div className="mt-1 h-2 rounded bg-[var(--ob-line)]">
            <div className="h-2 rounded" style={{ width: `${(d.value / max) * 100}%`, background: 'var(--ob-accent)' }} />
          </div>
        </li>
      ))}
      {data.length === 0 && <li className="text-[var(--ob-muted)]">No data.</li>}
    </ul>
  );
}
```

- [ ] **Step 3: Write `charts/Donut.tsx` (category mix)**

```tsx
// components/sites/analytical-register/charts/Donut.tsx
const PALETTE = ['var(--ob-accent)', '#7BA05B', '#D9A441', '#6C7B8A', '#B5651D', '#9C6ADE'];
type Props = { data: { name: string; value: number }[] };

export function Donut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const segs = data.map((d, i) => {
    const start = (acc / total) * 2 * Math.PI;
    acc += d.value;
    const end = (acc / total) * 2 * Math.PI;
    return { d, i, start, end };
  });
  const arc = (a: number, b: number) => {
    const r = 60, cx = 70, cy = 70;
    const large = b - a > Math.PI ? 1 : 0;
    return `M ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(b)} ${cy + r * Math.sin(b)}`;
  };
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" width={140} height={140} role="img" aria-label="Category mix">
        {segs.map((s) => <path key={s.i} d={arc(s.start, s.end)} stroke={PALETTE[s.i % PALETTE.length]} strokeWidth={18} fill="none" />)}
      </svg>
      <ul className="space-y-1 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Write `Analytics.tsx`**

```tsx
// components/sites/analytical-register/Analytics.tsx
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
```

- [ ] **Step 5: Wire it into the shell**

In `OrderBook.tsx`, import `Analytics` and render `<Analytics />` when `view === 'analytics'` (remove `analytics` from the placeholder condition).

- [ ] **Step 6: Verify**

Run `npx tsc --noEmit`. In the browser, the Analytics tab shows KPI cards and charts over the 7/30/90-day ranges; create a new bill on Register first, then confirm the trend/revenue moves.

- [ ] **Step 7: Commit**

```bash
git add components/sites/analytical-register/charts/ components/sites/analytical-register/Analytics.tsx components/sites/analytical-register/OrderBook.tsx
git commit -m "feat(analytical-register): add analytics dashboard with SVG charts"
```

---

### Task 10: Menu manager

**Files:**
- Create: `components/sites/analytical-register/MenuManager.tsx`
- Modify: `components/sites/analytical-register/OrderBook.tsx` (mount `<MenuManager />`)

**Interfaces:**
- Consumes: `useOrderBook`, `formatMoney`, types `MenuItem`.
- Produces: `MenuManager` client component; uses `upsert-item` and `archive-item` actions.

- [ ] **Step 1: Write the component**

```tsx
// components/sites/analytical-register/MenuManager.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';
import { formatMoney } from './pricing';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

export function MenuManager() {
  const { state, dispatch } = useOrderBook();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const add = () => {
    const p = Number(price);
    if (!name.trim() || !category.trim() || !(p > 0)) return;
    dispatch({ type: 'upsert-item', item: { id: slug(name), name: name.trim(), category: category.trim(), price: p, active: true } });
    setName(''); setCategory(''); setPrice('');
  };

  return (
    <section className="space-y-4">
      <div className="ob-card flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm font-semibold">Name<input className="mt-1 block w-44 rounded-lg border border-[var(--ob-line)] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm font-semibold">Category<input className="mt-1 block w-36 rounded-lg border border-[var(--ob-line)] px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)} /></label>
        <label className="text-sm font-semibold">Price<input className="mt-1 block w-24 rounded-lg border border-[var(--ob-line)] px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <button className="ob-btn" onClick={add}>Add item</button>
      </div>
      <div className="ob-card overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--ob-muted)]"><tr><th className="py-2">Item</th><th>Category</th><th className="text-right">Price</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {state.menu.map((m) => (
              <tr key={m.id} className="border-t border-[var(--ob-line)]">
                <td className="py-2">{m.name}</td>
                <td>{m.category}</td>
                <td className="text-right">{formatMoney(m.price, state.brand.currency)}</td>
                <td>{m.active ? 'Active' : 'Archived'}</td>
                <td className="text-right">{m.active && <button className="ob-btn-ghost py-1 text-xs" onClick={() => dispatch({ type: 'archive-item', id: m.id })}>Archive</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into the shell**

In `OrderBook.tsx`, import `MenuManager` and render it when `view === 'menu'` (remove `menu` from the placeholder condition and delete the now-empty placeholder branch).

- [ ] **Step 3: Verify**

Run `npx tsc --noEmit`. In the browser: add an item and see it on the Register grid; archive an item and confirm it disappears from Register but a past order that contained it is unchanged in Orders.

- [ ] **Step 4: Commit**

```bash
git add components/sites/analytical-register/MenuManager.tsx components/sites/analytical-register/OrderBook.tsx
git commit -m "feat(analytical-register): add menu manager"
```

---

### Task 11: Ship to the `/store` gallery + preview

**Files:**
- Modify: `content/websites/sites.ts` (append the OrderBook entry)
- Create: `public/showcase/analytical-register/preview.png` (captured screenshot, >5000 bytes)

**Interfaces:**
- Consumes: `SampleWebsite` shape (types).
- Produces: a fifth `websites` entry so `/store`, the home demo strip, and `app/sitemap.ts` pick it up automatically.

- [ ] **Step 1: Capture the preview**

With the dev server running at `http://localhost:3000/analytical-register`, screenshot the Register view at desktop width and save it to `public/showcase/analytical-register/preview.png` (create the folder). The file must be a real capture larger than 5000 bytes — the registry test rejects a 1×1/placeholder PNG.

- [ ] **Step 2: Add the registry entry**

Append to the `websites` array in `content/websites/sites.ts` (copy the shape of existing entries). The copy MUST NOT contain the words `demo` or `pune`:

```ts
  {
    slug: 'analytical-register',
    author: 'jainil-patel',
    title: 'OrderBook',
    business: 'Order register & business analytics',
    description:
      'A point-of-sale register for any café or shop: tap menu items to build a ticket, capture the customer, generate a GST cash memo, and send the bill on WhatsApp in one tap. Every logged order feeds a live dashboard of revenue, average order value, top items, category mix and weekday-versus-weekend trends.',
    path: '/analytical-register',
    theme: 'Light operator POS',
    accent: '#B5651D',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/analytical-register/preview.png',
  },
```

- [ ] **Step 3: Run the registry tests**

Run: `npx vitest run test/brand-registries.test.ts`
Expected: PASS — the OrderBook entry's route resolves, its screenshot file exists and exceeds 5000 bytes, its slug is unique, and its copy contains neither `demo` nor `pune`.

- [ ] **Step 4: Verify `/store`**

In the browser open `http://localhost:3000/store`: the OrderBook card appears with the preview image, title, business line, and the `#B5651D` swatch, and clicking it opens `/analytical-register`.

- [ ] **Step 5: Commit**

```bash
git add content/websites/sites.ts public/showcase/analytical-register/preview.png
git commit -m "feat(analytical-register): ship OrderBook to the work gallery"
```

---

### Task 12: Final verification sweep

**Files:** none (verification only).

- [ ] **Step 1: Static checks**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: all four succeed with zero errors. `npm test` now includes the five `analytical-register-*` suites.

- [ ] **Step 2: Full golden path in Chrome**

Open `/analytical-register`:
1. Take an order (tap items, set qty, add customer name + phone), Create bill, Send on WhatsApp opens a valid `wa.me` link with the GST memo.
2. Reload — the created order persists in Orders and is reflected in Analytics.
3. Analytics: switch 7/30/90 ranges; charts and KPIs update.
4. Menu: add and archive an item; register and history behave correctly.
5. Settings: rename + change accent; the workspace repaints; Reset demo data re-seeds a stable history.
6. `/store`: the OrderBook card renders and links to the live demo.

- [ ] **Step 3: Accessibility + motion pass**

Verify: nav and menu tiles are keyboard-operable with visible focus; the bill dialog traps focus and closes on Esc; `prefers-reduced-motion` disables tile hover motion; the WhatsApp link has `rel="noopener noreferrer"`.

---

## Self-Review

**1. Spec coverage.** Data model (Task 1 + 6), rebrand-in-place (Task 6 `update-brand` + Task 7 Settings), menu CRUD (Task 10), customer capture + upsert (Task 6), GST cash memo + round-off invariant (Tasks 1, 2, 6), WhatsApp `wa.me` click-to-send (Task 2, BillView Task 7, re-send Task 8), seeded deterministic history (Tasks 4, 6, 7), analytics KPIs + hand-rolled SVG charts (Tasks 5, 9), localStorage persistence (Task 7), `/store` registration + preview (Task 11), failure handling: corrupt storage re-seeds and private-mode in-memory (Task 7 `load`/persist), missing-phone disables WhatsApp (Task 7 BillView), zero-GST omits tax lines (Tasks 2, 7) — all covered. Reset-demo-data (Task 6 `reset`, Task 7 Settings). Reduced-motion + focus trap (Task 7 CSS/BillView, verified Task 12). No gaps.

**2. Placeholder scan.** The only temporary UI text is the Orders/Analytics/Menu `<p>` placeholder in Task 7 Step 4, explicitly removed in Tasks 8–10 — that is real transitional wiring, not a plan gap. Every code step contains complete code and every test step contains real assertions. No "TBD"/"add error handling"/"similar to Task N".

**3. Type consistency.** `computeTotals`/`formatMoney` (pricing), `billToText`/`buildWaMeLink` (bill-text), `seedOrders` (seed), `computeKpis`/`revenueByDay`/`topItems`/`categoryMix`/`weekdayWeekend` + `Kpis`/`DayPoint`/`NamedValue` (analytics), `StoreState`/`Action`/`orderbookReducer`/`initState` (reducer), `useOrderBook`/`StoreProvider` (store) are used with identical names and signatures across dependent tasks. Action names (`add-line`, `set-qty`, `create-order`, `upsert-item`, `archive-item`, `update-brand`, `reset`, `set-ticket-customer`) match Task 6's union everywhere they are dispatched.
