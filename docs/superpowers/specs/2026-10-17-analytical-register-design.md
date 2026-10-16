# OrderBook (`analytical-register`) — design spec

Fifth showcase site in the portfolio: a POS **register + analytics** tool for any
small brand. A cafe (or salon, kirana, cloud kitchen) opens it, taps menu items to
build a ticket, captures the customer's name and phone, creates a GST-style cash
memo, and clicks **Send on WhatsApp** to deliver that bill. Every logged order feeds
an analytics dashboard: revenue, order count, average order value, top items,
category mix, weekday-vs-weekend. Lives at `/analytical-register`, ships on `/store`
as **OrderBook**.

Customer-facing product name: **OrderBook**. Route slug and folder stay
`analytical-register` (kebab-case, matches the `/analytical-register` route).

Date: 2026-10-17 · Status: approved, pending spec review

## Decisions and their reasons

| Decision | Choice | Why |
|---|---|---|
| Kind of artifact | Standalone demo site, built locally | Matches every other "app" in this repo (README:61-68). A real multi-tenant SaaS needs auth, per-tenant isolation, deployed DB — out of scope for "add one more app". |
| Persistence | `localStorage`, brand-scoped keys | No backend, works offline, order you take shows up live in the dashboard. Mirrors how hair-adore keeps client-side order state, but made durable. |
| "Any brand" model | **One configured brand**, brand-agnostic data model, rebrand-in-place Settings screen (option A) | Every order/menu item carries a `brandId`, so it reads as a real product without fabricating several full tenant histories. Proves "any brand" by letting the viewer rename it live. |
| Analytics history | **Deterministic seeded ~75 days** of orders on first load, reset regenerates (option A) | An empty dashboard sells nothing. Deterministic PRNG keeps it stable across reloads and unit-testable. Same "believable demo data" posture as Savour/Dream Cafe. |
| Charts | Hand-rolled SVG, no new dependency | Repo is dependency-light; the only chart lib (`lightweight-charts`) is finance-specific. Matches how the demos build their own visuals. |
| WhatsApp send | **`wa.me` deep link** with the bill as prefilled text (option A) | Genuinely works, needs no API key or backend, and is how small Indian cafes already send bills. Real API messaging is out of scope. |
| Bill format | GST cash memo: line items, CGST/SGST split, round-off, total, bill number, thank-you note | Reads as a real Indian cafe bill; the GST split is what makes the analytics "revenue vs tax" honest. |
| State management | `useReducer` + Context store | Mirrors Savour's `wishlist.tsx` provider — the established pattern for a client-scoped datastore in this repo. |
| Test runner | Vitest (already configured), pure logic only | Pricing, GST math, seeding, and analytics aggregations are worth failing-test-first cycles. Components stay verified in the browser. No React Testing Library. |

## Routes and files

```
app/(sites)/analytical-register/page.tsx                 server component + metadata, renders <OrderBook />
components/sites/analytical-register/OrderBook.tsx        client shell, provider, top nav (Register/Orders/Analytics/Menu/Settings)
components/sites/analytical-register/Register.tsx         menu grid + live ticket
components/sites/analytical-register/Ticket.tsx           line items, qty steppers, customer name/phone, note, Create Bill
components/sites/analytical-register/BillView.tsx         GST cash memo, Send on WhatsApp, Copy
components/sites/analytical-register/OrdersLog.tsx        every order, filter by date/status/customer, reopen a bill
components/sites/analytical-register/Analytics.tsx        KPI cards + charts + date-range selector
components/sites/analytical-register/MenuManager.tsx      add/edit/archive products
components/sites/analytical-register/Settings.tsx         rebrand (name, accent, GST no., phone, currency) + Reset demo data
components/sites/analytical-register/charts/Line.tsx      revenue-by-day
components/sites/analytical-register/charts/Bar.tsx       top items
components/sites/analytical-register/charts/Donut.tsx     category mix
components/sites/analytical-register/types.ts             Brand, MenuItem, Customer, OrderLine, Order
components/sites/analytical-register/pricing.ts           subtotal, CGST/SGST, round-off, total (pure)
components/sites/analytical-register/bill-text.ts         Order → WhatsApp memo text (pure)
components/sites/analytical-register/analytics.ts         order aggregation → KPIs and chart series (pure)
components/sites/analytical-register/seed.ts              deterministic PRNG order history (pure)
components/sites/analytical-register/store.tsx            useReducer + Context, localStorage read/write
components/sites/analytical-register/menu-data.ts         default cafe menu (typed, data-as-code)
content/websites/sites.ts                                  gallery entry "OrderBook"
public/showcase/analytical-register/preview.png            gallery screenshot
test/analytical-register-pricing.test.ts                   GST/round-off/total
test/analytical-register-bill-text.test.ts                 memo formatting + wa.me link
test/analytical-register-analytics.test.ts                 aggregations
test/analytical-register-seed.test.ts                      determinism + shape
```

Non-component modules live beside the components (matching
`components/sites/stock-screener/` and Savour). No new top-level `lib/` directory.

`content/websites/types.ts` needs no change — `SampleWebsite` already covers slug,
title, business, description, path, theme, accent, techStack, screenshot.

## Data model

All localStorage, brand-scoped. Keys namespaced `orderbook:<brandId>:…`.

- **`brand`** — id, name, tagline, accent, gstNumber, phone (wa.me sender number),
  currency (`₹`), gstRate (default 5%). Edited in Settings; a rebrand changes
  display and the sender number but not existing orders (which snapshot the brand
  name and gstRate at bill time).
- **`MenuItem`** — id, name, category, price, note?, active (archive = soft delete).
- **`Customer`** — phone (natural key), name, label?. Auto-captured on bill creation,
  reused for suggestions later.
- **`OrderLine`** — { menuItemId, name, qty, unitPrice } (name + unitPrice snapshotted
  so editing a menu item never rewrites history).
- **`Order`** — id, billNumber (sequential per brand), createdAt (ISO), lines,
  subtotal, cgst, sgst, roundOff, total, customer, note?, status
  (`paid` | `held`), brandName + gstRate snapshot.

## Interface

Light, dense, tablet-first operator theme in a scoped `.orderbook` block in
`globals.css`, so brand chrome and the other four demos are unaffected. Accent is
the brand's accent (default a coffee amber) driven through a CSS variable so
rebranding repaints the whole workspace. Warm-neutral canvas, high-contrast ticket,
lucide icons (already a dependency).

Top-level nav switches between five **different** surfaces (Register, Orders,
Analytics, Menu, Settings) — a nav switch is appropriate here, not the
show-all-not-tabs rule, which applies to same-kind content grids. Within Register
the menu grid and the ticket are both always visible side by side (no tabs).

- **Register** — left: category-filtered menu grid, tap a tile to add one to the
  ticket (tap again to increment). Right: ticket with qty steppers, remove, customer
  name + phone inputs, an optional note, and Hold / Clear / **Create Bill**. On
  create: the order is logged, bill number assigned, customer upserted, and the bill
  view opens.
- **Bill view** — GST cash memo: brand header, bill number + timestamp, line items,
  subtotal, CGST/SGST lines, round-off, grand total, thank-you note. **Send on
  WhatsApp** opens `https://wa.me/<phone>?text=<encoded memo>`; **Copy** puts the
  memo on the clipboard. A phone-less order disables WhatsApp with a hint to add one.
- **Orders log** — table of every order (bill #, time, customer, items, total,
  status), filter by date range / status / search customer, click a row to reopen
  its bill and re-send.
- **Analytics** — KPI cards (revenue, orders, AOV, items sold) over the selected
  range; revenue-by-day line, top-items horizontal bar, category-mix donut,
  weekday-vs-weekend comparison. Everything recomputes from orders, so a bill you
  just created moves the numbers.
- **Menu** — list with add/edit/archive; changes apply to new tickets, never to
  logged orders.
- **Settings** — brand name, tagline, accent swatch, GST number, sender phone,
  currency, GST rate; **Reset demo data** re-seeds and clears manual edits.

Accessibility: buttons are real `<button>`s, the menu grid is keyboard operable, the
bill is `role="dialog"` with focus trap and Esc to close, live region announces
"Order #N created", WhatsApp opens in a new tab (`rel="noopener"`), and all animation
is behind `prefers-reduced-motion`.

## Failure handling

- **localStorage unavailable / private mode** → store falls back to in-memory state
  for the session; a small strip notes changes won't persist. Never crashes.
- **Corrupt stored JSON** → the reader validates shape and, on failure, re-seeds to
  defaults rather than throwing on mount.
- **First load with no stored data** → seed runs once (deterministic), then persists.
- **Phone missing or malformed** → WhatsApp button disabled with an inline hint;
  bill creation still succeeds (send is optional).
- **GST rate of 0** → CGST/SGST lines are omitted from the memo rather than showing
  ₹0.00 rows.
- **Round-off** is a real line (round half up to whole ₹) so subtotal+tax+round-off
  always equals the displayed total; tested.

## Verification

1. `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` — all clean.
2. Pure-logic tests green: pricing (GST split + round-off totals), bill-text (memo
   formatting + correct `wa.me` encoding), analytics aggregations, seed determinism.
3. Golden path in Chrome: add items → create bill → open in Orders → **Send on
   WhatsApp** opens a wa.me link with the memo → Analytics KPIs/charts move.
4. Persistence: create an order, reload, still in Orders and reflected in Analytics.
5. Rebrand: change name + accent in Settings, confirm header/charts repaint and the
   WhatsApp memo uses the new brand name.
6. Reset demo data regenerates a stable seed and clears manual edits.
7. Capture `public/showcase/analytical-register/preview.png` and confirm the OrderBook
   card renders on `/store`.

## Out of scope

Real WhatsApp Business API / any backend, multi-tenant auth and per-brand data
isolation, payment-gateway integration, physical-receipt printing, inventory/stock
decrement, employee/shift management, discounts/coupons, and any AI feature. The
WhatsApp send is a client deep link only; the product is a functional local demo, not
a hosted service.

## Open items at time of writing

- No preview screenshot yet (capture after the UI builds).
- Default brand seeded as a cafe ("Bean & Brunch" placeholder until Jainil names it)
  — easy to rename via Settings or by editing `menu-data.ts` / seed.
