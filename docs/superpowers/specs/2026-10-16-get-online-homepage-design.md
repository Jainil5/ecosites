# "Get Online" — homepage redesign + services/products/demos pages

Date: 2026-10-16 · Status: approved by Jainil · Approach: **A — extend the existing shell**

## Decisions locked during brainstorming

- **Brand**: Website IN stays the company name; `GET ONLINE.` is the manifesto headline and positioning, not a rebrand.
- **Reference**: saze.co.jp — monospace-first, near-monochrome, one vivid cyan→violet gradient reserved for *interactive elements only*, numbered structural labels (`01 / MANIFESTO`), one playful interactive input, code-like simplicity.
- **Motion**: CSS-only, no new dependencies. Reuse the repo vocabulary (`mp-bg` grid, `.slice`, `.plate-in`, `.edge`, `.beacon`, `.reveal`, TiltCard, Icon3D) plus a small new `go-*` section. Everything inside `prefers-reduced-motion: no-preference`; loops rest at assembled state.
- **3D logo**: CSS/SVG animated mark — the tree-circuit rebuilt as layered plates with assemble-on-load rotation. Flat SVG stays the favicon and nav mark.
- **Products page**: shows "from ₹X" starting prices (INR). Prices are placeholders pending Jainil's confirmation.
- **Hero input**: type a business name → SEE YOUR SITE → a glass card "compiles" a mock site preview (name, tagline, browser chrome) with a WhatsApp CTA whose message is pre-filled with the business name. Pure client-side.
- **Honesty rules stay**: demos are presented as delivered client work; no "demo" wording on /store content; no "Pune"/local framing in rendered strings.

## Information architecture

- `/` — `01 / MANIFESTO` hero → `02 / SERVICES` journey teaser → `03 / PRODUCTS` grid with prices → `04 / DEMOS` live frames → `05 / NEXT STEP` contact CTA
- `/services` — the get-online journey in full: Get Found → Get Known → Get Running → Get Smart; each step = problem → what we build → what customers notice. AI + motion design positioned as upgrades after you're online.
- `/products` — packages: Websites, Motion Design, AI Assistant, Automation & Dashboards; features + "from ₹X"; quote flow to /contact.
- `/demos` — Hair Adore, Market Pulse, Savour as full-width browser frames with what-each-proves notes.
- Navbar: Services · Products · Demos · Portfolio · Contact (replaces the `/#services` + `/store` links).

## Files

- `app/globals.css` — new `go-*` section: gradient-accent token (`.go-cta`), `.go-label`, hero type scale, compile-card assembly, Logo3D keyframes.
- `content/brand/services.ts` (new) — journey steps data.
- `content/brand/products.ts` — add `priceFrom`, add `motion-design` product, extend bullets.
- `content/brand/types.ts` — extend `Product` type.
- `components/brand/Logo3D.tsx` (new) — layered 3D mark.
- `components/brand/Hero.tsx` — rewritten as manifesto hero with interactive input (client island `SiteCompiler.tsx`).
- `components/brand/ServicesJourney.tsx` (new) — used on home (teaser) and /services (full).
- `components/brand/ProductsGrid.tsx` — price chips, 4 products, CTA to /products.
- `components/brand/WorkStrip.tsx` — renumbered `04 / DEMOS`, CTA to /demos.
- `components/brand/PageHeader.tsx` (new) — shared mono-label + slice title for subpages.
- `app/(site)/services/page.tsx`, `app/(site)/products/page.tsx`, `app/(site)/demos/page.tsx` (new) + metadata.
- `components/Navbar.tsx` — new links; `app/sitemap.ts` — add routes.

## Verification

`npm run build` clean; browser pass at 1440px + 390px on /, /services, /products, /demos; reduced-motion emulation check; interactive input produces valid WhatsApp link; zero console errors.
