# ecosites

**Website & Intelligence** — the brand site for a studio that builds websites, software, data and
AI for businesses of every size — plus five standalone demo sites, all in one app built with
**Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel**. Each demo renders
full-screen with its own scoped theme, so they can look nothing alike.

## Routes

The brand site, the portfolio and the demo sites share one app but live in separate route groups.

| Route | Purpose |
| --- | --- |
| `/` | Website & Intelligence company page — hero, services, industries, products, demo proof, contact |
| `/services` | Six capabilities and how they combine into a solution |
| `/products` | The three owned apps: OrderBook, Market Pulse and TeamSync |
| `/demos` | Work gallery — five full builds from `content/websites/sites.ts` |
| `/store` | Kept as an alias of `/demos` for older links |
| `/about` | Mission, process and pillars |
| `/local-business` | Local-business landing page (footer link) |
| `/enterprise` | Enterprise solution landing page (footer link) |
| `/contact` | WhatsApp, call and email channels |
| `/portfolio` | Index of builders, one card each, from `content/portfolio/authors.ts` |
| `/portfolio/[author]` | A builder's bio, stack, links and case studies |
| `/portfolio/[author]/work/[slug]` | Case-study detail, statically generated |

| Client site | Route | Notes |
| --- | --- | --- |
| Hair Adore | `/hair-adore` | Salon marketing site: service menu, before/after gallery, booking |
| Savour | `/savour`, `/savour/[slug]` | Dish-first restaurant guide; `/savour/[slug]` is one page per venue |
| Market Pulse | `/stock-screener` | NSE screener on live Yahoo Finance data, via the API routes below |
| Coffee Cups | `/coffee-cups` | Bagel bakery and coffee bar: 3D barrel menu board, sunrise ticker, rotated photo mosaic |
| OrderBook | `/analytical-register` | POS register, GST cash memo, WhatsApp bill send, orders log and analytics dashboard |

Coffee Cups shipped first as *Dream Cafe*. The name, route, component folder, `cc-*` class family and
`public/` assets all moved in one pass, and `next.config.mjs` keeps `/dream-cafe*` redirecting so old
shares still land on the café.

`/api/stocks/{ohlc,chart,news,market,tick}` are server-side proxies that keep the Yahoo Finance
request and the NVIDIA NIM key out of the browser bundle.

The company page and the portfolio live in the `(site)` route group (dark 3D theme,
shared navbar/footer/grid background). Demo sites live in `(sites)` and render **full-screen with
their own scoped theme** — no brand chrome.

## Architecture

- **`app/layout.tsx`** — minimal root layout: fonts + default metadata only, so `(sites)` pages stay standalone.
- **`app/(site)/layout.tsx`** — the brand chrome (Navbar, Footer, GridBackground, skip link).
- **`app/(sites)/<slug>/page.tsx`** — one standalone page per client site.
- **`app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`** — crawler output and favicon, both built from the registries.
- **`content/`** — data-as-code registries; components never hard-code business facts:
  - `content/brand/` — `company.ts` (name, tagline, pitch, badge, contact channels), `audiences.ts` (local-business and enterprise positioning), `services.ts` / `capabilities.ts` (the offering), `industries.ts`, `process.ts`, `proof.ts`, `solutions.ts`, `whyus.ts`, `nav.ts` (navigation), `links.ts` (WhatsApp/tel/mailto href builders), `site.ts` (canonical origin).
  - `content/portfolio/` — `PortfolioAuthor` registry; one entry per builder at `/portfolio/<slug>`.
  - `content/demos/` — `DemoSite` registry for the case studies. Each entry names its `author`; `screenshot` is optional and a designed cover stands in when a project has no capture yet.
  - `content/websites/` — `SampleWebsite` registry for the `/demos` gallery, with optional `liveUrl` (client's own domain) and `year`.
- **`components/brand/`** — `Logo` (tree with circuit branches, also the favicon), `Hero`, `ProductsGrid`, `WorkStrip`, `ContactCta`; all read `content/brand/`.
- **`components/`** — shared UI; site-specific components are colocated under `components/sites/<slug>/`.
- **`supabase/`** — `schema.sql` + `seed.sql` for Savour's project (Row Level Security keeps a device's wishlist to itself).
- **`design-system/`** — persisted design tokens/decisions for the brand theme.

### Brand motion layers

Three layers, all gated on `prefers-reduced-motion`, none of them touching the client demo themes:

| Layer | What it does | Where |
| --- | --- | --- |
| `ScrollMotion` | Runs Lenis smooth scroll on the brand pages and publishes `--scroll-v` (momentum), `--scroll-p` (progress) and `--hero-rec` (hero travel) on `<html>` | `components/brand/ScrollMotion.tsx` |
| `MotionField` | Canvas 3D wireframe plane: crest travel, perspective dolly with page progress, camera bank with momentum | `components/brand/MotionField.tsx` |
| `MotionReel` | Ten-second AI-generated film loop of the same scene, behind the landing page only | `components/brand/MotionReel.tsx`, `public/brand/` |

Every scroll effect reads the three custom properties rather than adding its own listener — see `gs-dive` / `gs-away` (bands tip in and away on `view()` timelines), `gs-fan` (a grid's cells deal in on their own timelines) and the momentum lean on `gs-display` / `gs-plane`.

The reel is committed, not generated at request time, and `test/brand-skin.test.ts` fails if its weight budget slips. To rebuild it after changing the keyframes in `public/brand/frames/`:

```bash
pip install imageio-ffmpeg   # or put any ffmpeg on PATH and set FFMPEG=/path/to/ffmpeg
bash scripts/brand-reel.sh
```

### Café menu boards

`/coffee-cups/menu` serves the same `menuGroups` data three ways, so a customer can browse the way they like:

| Board | When it is served | Component |
| --- | --- | --- |
| Barrel — cards standing on a spinning cylinder | Gen Z skin, one section at a time (Coffee, Food, Beverages) | `components/sites/coffee-cups/BarrelGallery.tsx` |
| Square tiles — the whole menu on one floating grid | Gen Z skin, `All` | `MenuExperience.tsx` |
| Printed listing — thumbnail · name · leader · price | Traditional skin | `MenuExperience.tsx` |

The barrel is geometry, not a slideshow: the radius is solved from the card width and the per-item angle so neighbours keep a real gap around the cylinder, and each card's fade, scale and lift come from `cos()` of its angle to camera. That leaves one custom property (`--rot`) to write per frame, on the ring, and the browser's 3D sorting handles the rest. Drag (with fling and snap), sideways wheel, arrow keys, the dots and tapping a side card all spin it; tapping the facing card opens the same `ItemDialog` the tiles use. Phones get the same barrel at `60vw` cards with `touch-action: pan-y`, so a vertical thumb still scrolls the page. Under `prefers-reduced-motion: reduce` the shape stays and the movement stops: spins land instantly and the cards stop lifting.

### Adding a builder's portfolio

1. Add one entry to `content/portfolio/authors.ts` with a kebab-case `slug`.
2. Tag their case studies in `content/demos/sites.ts` with `author: '<slug>'`.
3. Drop previews at `public/demos/<case-study>/preview.png` and set `screenshot`.

`/portfolio`, the author page, the case-study pages, `generateStaticParams` and the sitemap all
follow from those two files.

### Adding a demo to the work gallery

1. Create `app/(sites)/<slug>/page.tsx` (server component + `metadata`).
2. Add its components/data under `components/sites/<slug>/`.
3. Add one entry to `content/websites/sites.ts` with `slug`, `path: '/<slug>'`, `theme`, `accent`, `screenshot` — plus `liveUrl` when the client has their own domain, and `year`.
4. Drop a preview image at `public/showcase/<slug>/preview.png`.

The `/demos` gallery (and its `/store` alias) and the demo strip on `/` read from the registry automatically.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npm test         # vitest (brand registries and contact links, Savour catalogue, filters, dishes, wishlist, seed)
npm run savour:places  # regenerate Savour venue data
npm run savour:seed    # generate the Supabase seed
```

## Environment Variables

```bash
cp .env.example .env.local
```

Every variable is optional — each site degrades to a working fallback when its
variables are absent, so the app builds and runs with an empty `.env.local`.

| Variable | Used by | When unset |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `metadataBase` for canonical/OG tags | Falls back to `https://websitein.com` |
| `NEXT_PUBLIC_SAVOUR_SUPABASE_URL`<br>`NEXT_PUBLIC_SAVOUR_SUPABASE_PUBLISHABLE_KEY` | Savour catalogue + wishlist | Savour renders `components/sites/savour/fallback-data.ts`; wishlist writes are disabled |
| `NVIDIA_API_KEY`<br>`NIM_MODEL` | `/api/stocks/news` AI brief | News desk uses keyword mode instead |

The `NEXT_PUBLIC_` prefix is required for the Supabase pair because those are
publishable keys used from the browser; RLS restricts visitors to public catalogue
reads plus their own wishlist rows. `NVIDIA_API_KEY` deliberately has **no**
prefix — it is billable and must stay server-side.

## Deploying to Vercel

This project is zero-config for Vercel (framework preset `nextjs`, see `vercel.json`, `.nvmrc` pins Node 20).
It also ships a GitHub Actions FTP deploy (`.github/workflows/deploy.yml`) that syncs `main` to
`/public_html` when the `FTP_SERVER`, `FTP_USERNAME` and `FTP_PASSWORD` secrets are set.

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), **Import** the GitHub repo.
3. Vercel auto-detects Next.js — accept the defaults.
4. Add the environment variables above for Production and Preview. Set
   `NEXT_PUBLIC_SITE_URL` to `https://websitein.com` once the domain is attached (the
   Vercel `.vercel.app` domain works for previews).
5. Deploy. Every push to `main` produces a production deploy; PRs get preview URLs.

Note that `NEXT_PUBLIC_*` values are inlined at build time, so changing one requires a
redeploy, not just a variable edit.

Alternatively with the CLI:

```bash
npx vercel        # link + preview
npx vercel --prod # promote to production
```

## Design & UI Skills

UI work is driven by installed design skills (see `.cursor/rules/design-ux.mdc`):

| Skill | Use for |
| --- | --- |
| `ui-ux-pro-max` | Aesthetic direction, styles, color palettes, font pairings, UX guidelines |
| `frontend-design` | Distinctive, non-templated page/hero design |
| `impeccable` | Critique and polish an existing interface |
| `design-system` | Design tokens, spacing/typography scales, component specs |
| `shadcn` + `ui-styling` | Accessible components with Tailwind theming |
| `banner-design` | Hero/social brand visuals |

Design decisions (brand color, type pairing) live as tokens in `tailwind.config.ts`.

## Status

- [x] Next.js + Tailwind + TypeScript scaffolded
- [x] `/` company page — hero, services, industries, products, proof, contact
- [x] `/services`, `/products`, `/demos`, `/about` brand pages
- [x] `/contact` channels and the `/store` alias for older links
- [x] `/portfolio` builder index, `/portfolio/[author]` and `/portfolio/[author]/work/[slug]`
- [x] Sitemap, robots and favicon generated from the registries
- [x] Five standalone client sites (`/hair-adore`, `/savour`, `/stock-screener`, `/coffee-cups`, `/analytical-register`)
- [x] Savour on Supabase with RLS + bundled fallback data
- [x] Market Pulse live-data proxy (`/api/stocks/*`)
- [x] OrderBook POS register, GST billing and analytics dashboard
- [x] TeamSync team communication platform with AI search and meeting notes
- [x] Vercel-ready configuration
