# Market Pulse — motion redesign design

Date: 2026-10-16
Status: approved by user in chat (2026-10-16)

## Goal

Turn the existing `/stock-screener` demo into a motion-designed product: a dedicated,
shareable per-stock page at `/stock-screener/[symbol]` (hero, chart, fundamentals, news,
peers) plus a full animation pass on the main screener flow (table, heatmap, index strip,
stat cards). "3D" means perspective CSS transforms and parallax tilt, not WebGL.

## Scope decisions (from brainstorming)

1. Stock selection lives on a dedicated `/stock-screener/[symbol]` route, not the current
   inline table expansion. The expanded `StockDetail` strip is removed; its news and
   fundamentals move to the new page. Row/cell click navigates.
2. Motion stack: `framer-motion` v12 (React 19 compatible) + CSS 3D transforms. No three.js,
   no new backend — the page reuses `useStocks`, `useLiveTicks`, `useOhlc`, `useStockNews`
   and the existing `/api/stocks/{tick,chart,ohlc,news}` routes.
3. Both pages get the motion pass; they are one product.

## Architecture

### 1. Motion primitives — `components/sites/stock-screener/motion/`

- `Tilt3D.tsx` — wraps a card; mouse-move `rotateX/rotateY` parallax with a moving specular
  glow. Props: `intensity` (deg), `glow` (bool). Uses framer-motion springs; returns to rest
  on pointer leave.
- `AnimatedNumber.tsx` — spring-interpolated numeric display, direction-aware green/red
  flash. Props: `value`, `format` (inr/compact/pct/plain), `tone` override.
- `Reveal.tsx` — staggered mount/scroll entrance (`whileInView`, once). Replaces hand-set
  `--d` delays on `mp-rise` elements.
- `tokens.ts` — the easing/spring constants (section 5). Nothing else hardcodes durations.

All three read `useReducedMotion()` and collapse to instant/120ms-fade behavior.

### 2. Page-to-page transition — View Transitions API

- Selected row / heatmap cell gets `view-transition-name: stock-hero-<slug>`; the detail
  page hero uses the same name → shared-element morph on navigation.
  (As built the name is `stock-<slug-with-hyphens>` — a CSS custom identifier cannot
  contain the dot of `reliance.ns`, and the property must be assigned imperatively via a
  ref because React lowercases the `viewTransitionName` style prop.)
- Static chrome (`mp-bg` grid, page header shell) keeps matching names so only the stock
  element travels.
- 420ms expo-out via `::view-transition-* { animation-timing-function }` in `globals.css`.
- Firefox/unsupported browsers degrade to instant navigation; in-page framer-motion still
  animates. No JS polyfill.

### 3. New route `app/(sites)/stock-screener/[symbol]/page.tsx`

- `generateStaticParams` from `STOCKS` symbols; `notFound()` for unknown symbols.
- Slug rule: lowercase the NSE symbol, keep the suffix dot (`RELIANCE.NS` →
  `reliance.ns`); a `slugToSymbol`/`symbolToSlug` pair lives in `data.ts` next to `STOCKS`.
- Server shell (metadata per stock: title/description from `StockMeta`) + client islands.
- Sections, all visible (no tabs — user preference):
  1. **Hero** — `Tilt3D` panel: symbol, name, `AnimatedNumber` live price, change badge,
     full-bleed animated sparkline backdrop. View-transition target.
  2. **Chart** — existing `ChartPanel` lifted in with range controls.
  3. **Fundamentals** — stat cards (P/E, mcap, EPS, dividend, 52-week `RangeBar` animating
     to position on view), staggered reveal + hover lift.
  4. **News** — per-stock headlines (`useStockNews`) + market feed (`NewsList`), staggered
     items, skeleton shimmer while loading.
  5. **Peers strip** — same-sector movers, each card navigable (transitions to that stock).
- Live data is client-fetched per stock; LCP is the pre-rendered hero shell — no regression.

### 4. Main screener changes

- `ScreenerTable` rows: click → `router.push`/`<Link>` to detail route (expand removed);
  `layout` + `AnimatePresence` for sort/filter add/remove/reorder; `view-transition-name`
  on the price cell; hover tilt.
- `Heatmap` cells: same transition names, navigate on select (replaces `focusChart`).
- `IndexStrip` + `StatCard`: numbers become `AnimatedNumber`.
- Existing `mp-*` keyframes (bg grid crawl, price flash, sheen, ping) stay as-is.

### 5. Easing & timing tokens (`motion/tokens.ts`)

Springs (live/interactive):

| Use | Params | Notes |
| --- | --- | --- |
| AnimatedNumber | `stiffness 260, damping 30, mass 0.9` | ~350ms settle, no overshoot on prices |
| Tilt3D follow | `stiffness 120, damping 14` | floaty while tracking |
| Tilt3D return | `stiffness 300, damping 25` | snap back, no wobble |
| Table layout reorder | `stiffness 350, damping 34` | ~300ms, feels caused by the click |

Cubic-beziers (entrance/exit):

- Entrance `cubic-bezier(0.16, 1, 0.3, 1)`, 450–550ms, translate ≤16px, scale 0.98→1;
  opacity leads over 180ms then transform follows.
- Exit `cubic-bezier(0.4, 0, 1, 1)`, 200ms (exits ~2.5× faster than entrances).
- View-transition morph 420ms expo-out.
- Sibling stagger 50ms. Scroll reveals at `viewport={{ amount: 0.25 }}`, once only.

Reduced motion: springs → direct sets; beziers → 120ms fades; layout reorder instant;
`@media (prefers-reduced-motion: reduce) { view-transition-group: normal }`.

## Dependency change

Add exactly one: `framer-motion@^12`. No removals.

## Testing

- Unit (vitest): existing pure logic (`format`, `indicators`, `data`) unchanged and green;
  add tests for `motion/tokens.ts` exports and symbol→slug mapping used by the route.
- `next lint` + `npm run build` clean.
- Manual browser pass: entrance stagger, row→hero morph, tick flash correctness, peers
  navigation, reduced-motion emulation, Firefox graceful fallback.

## Non-goals

- No WebGL/three.js, no new API endpoints, no redesign of the table's information
  architecture, no mobile-specific gestures beyond existing touch behavior.
