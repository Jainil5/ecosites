# Jainil Patel — Portfolio

Personal portfolio site built with **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel**. It contains the portfolio itself plus a standalone showcase of sample websites, each with its own visual theme.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home / landing (part of the portfolio) |
| `/resume` | Resume rendered on-page + downloadable PDF |
| `/demos` | Project case studies (data/AI/software work) |
| `/demos/[slug]` | Individual project detail (statically generated) |
| `/showcase` | Standalone gallery of sample websites (not linked in the portfolio nav) |
| `/showcase/[slug]` | Live demo of an individual sample site, e.g. `/showcase/hair-adore` |

The portfolio lives in the `(portfolio)` route group (dark 3D theme, shared navbar/footer/grid background). Sample websites live in the `(sites)` route group and render **full-screen with their own scoped theme** — no portfolio chrome — so each can look completely different.

## Architecture

- **`app/layout.tsx`** — minimal root layout: fonts + default metadata only, so `(sites)` pages stay standalone.
- **`app/(portfolio)/layout.tsx`** — the portfolio chrome (Navbar, Footer, GridBackground, skip link).
- **`app/(sites)/…`** — standalone pages (`/showcase` listing + each demo site).
- **`content/`** — data-as-code registries:
  - `content/resume/data.ts` — resume content (single source of truth for name/title/summary).
  - `content/demos/` — `DemoSite` registry for project case studies.
  - `content/websites/` — `SampleWebsite` registry for the `/showcase` gallery.
- **`components/`** — shared UI; demo-site-specific components are colocated under `components/sites/<slug>/`.
- **`design-system/`** — persisted design tokens/decisions for the portfolio theme.

### Adding a new sample website

1. Create `app/(sites)/showcase/<slug>/page.tsx` (server component + `metadata`).
2. Add its components/data under `components/sites/<slug>/`.
3. Add one entry to `content/websites/sites.ts` with `slug`, `path: '/showcase/<slug>'`, `theme`, `accent`, `screenshot`.
4. Drop a preview image at `public/showcase/<slug>/preview.png`.

The `/showcase` listing reads from the registry automatically.

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
```

## Environment Variables

Copy the example and fill in your deployed URL (used for SEO metadata / Open Graph):

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public base URL of the deployment. Optional locally; set in Vercel for correct canonical/OG tags. |

## Deploying to Vercel

This project is zero-config for Vercel (framework preset `nextjs`, see `vercel.json`, `.nvmrc` pins Node 20).

1. Push this repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), **Import** the GitHub repo.
3. Vercel auto-detects Next.js — accept the defaults.
4. Add the `NEXT_PUBLIC_SITE_URL` environment variable (Production/Preview) set to your Vercel domain.
5. Deploy. Every push to `main` produces a production deploy; PRs get preview URLs.

Alternatively with the CLI:

```bash
npm i -g vercel
vercel        # link + preview
vercel --prod # promote to production
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
- [x] `/resume` route with PDF download
- [x] `/demos` listing + `/demos/[slug]` detail pages
- [x] `/showcase` standalone gallery + `/showcase/hair-adore` demo site
- [x] Vercel-ready configuration
- [ ] Real assets (final resume PDF, showcase screenshots)
