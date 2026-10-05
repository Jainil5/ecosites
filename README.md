# ecosites

Portfolio plus three standalone demo sites, built with **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel**. Each site renders full-screen with its own scoped theme, so they can look nothing alike.

## Routes

The portfolio and the demo sites share one app but live in separate route groups.

| Route | Purpose |
| --- | --- |
| `/` | Apps gallery — cards for the demo sites, from `content/websites/sites.ts` |
| `/portfolio` | Portfolio landing (hero, stack, featured builds) |
| `/portfolio/demos` | Project case-study gallery, from `content/demos/sites.ts` |
| `/portfolio/demos/[slug]` | Case-study detail, statically generated |
| `/portfolio/resume` | Resume rendered on-page + downloadable PDF |

| Demo site | Route | Notes |
| --- | --- | --- |
| Hair Adore | `/hair-adore` | Salon marketing site: service menu, before/after gallery, booking |
| Savour | `/savour`, `/savour/[slug]` | Pune food guide; `/savour/[slug]` is one page per venue |
| Market Pulse | `/stock-screener` | NSE screener on live Yahoo Finance data, via the API routes below |

`/api/stocks/{ohlc,chart,news}` are server-side proxies that keep the Yahoo Finance
request and the NVIDIA NIM key out of the browser bundle.

The portfolio lives in the `(portfolio)` route group (dark 3D theme, shared navbar/footer/grid
background). Demo sites live in `(sites)` and render **full-screen with their own scoped theme** —
no portfolio chrome.

## Architecture

- **`app/layout.tsx`** — minimal root layout: fonts + default metadata only, so `(sites)` pages stay standalone.
- **`app/(portfolio)/layout.tsx`** — the portfolio chrome (Navbar, Footer, GridBackground, skip link).
- **`app/(sites)/<slug>/page.tsx`** — one standalone page per demo site.
- **`content/`** — data-as-code registries:
  - `content/resume/data.ts` — resume content (single source of truth for name/title/summary).
  - `content/demos/` — `DemoSite` registry for the case studies.
  - `content/websites/` — `SampleWebsite` registry for the `/` gallery.
- **`components/`** — shared UI; site-specific components are colocated under `components/sites/<slug>/`.
- **`supabase/`** — `schema.sql` + `seed.sql` for Savour's project (Row Level Security keeps a device's wishlist to itself).
- **`design-system/`** — persisted design tokens/decisions for the portfolio theme.

### Adding a new demo site

1. Create `app/(sites)/<slug>/page.tsx` (server component + `metadata`).
2. Add its components/data under `components/sites/<slug>/`.
3. Add one entry to `content/websites/sites.ts` with `slug`, `path: '/<slug>'`, `theme`, `accent`, `screenshot`.
4. Drop a preview image at `public/showcase/<slug>/preview.png`.

The `/` gallery reads from the registry automatically.

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
npm test         # vitest (Savour catalogue, filters, dishes, wishlist, seed)
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
| `NEXT_PUBLIC_SITE_URL` | `metadataBase` for canonical/OG tags | Falls back to `https://example.com` |
| `NEXT_PUBLIC_SAVOUR_SUPABASE_URL`<br>`NEXT_PUBLIC_SAVOUR_SUPABASE_PUBLISHABLE_KEY` | Savour catalogue + wishlist | Savour renders `components/sites/savour/fallback-data.ts`; wishlist writes are disabled |
| `NVIDIA_API_KEY`<br>`NIM_MODEL` | `/api/stocks/news` AI brief | News desk uses keyword mode instead |

The `NEXT_PUBLIC_` prefix is required for the Supabase pair because those are
publishable keys used from the browser; RLS restricts visitors to public catalogue
reads plus their own wishlist rows. `NVIDIA_API_KEY` deliberately has **no**
prefix — it is billable and must stay server-side.

## Deploying to Vercel

This project is zero-config for Vercel (framework preset `nextjs`, see `vercel.json`, `.nvmrc` pins Node 20).

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), **Import** the GitHub repo.
3. Vercel auto-detects Next.js — accept the defaults.
4. Add the environment variables above for Production and Preview. At minimum set
   `NEXT_PUBLIC_SITE_URL` to your Vercel domain.
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
- [x] `/portfolio/resume` with PDF download
- [x] `/portfolio/demos` listing + `[slug]` detail pages
- [x] Three standalone demo sites (`/hair-adore`, `/savour`, `/stock-screener`)
- [x] Savour on Supabase with RLS + bundled fallback data
- [x] Market Pulse live-data proxy (`/api/stocks/*`)
- [x] Vercel-ready configuration
