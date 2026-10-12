# Multi-author portfolios, demo store reframe, and brand repositioning — design

**Date:** 2026-10-12
**Status:** Approved by Jainil ("And now update the code to prod ready website")
**Supersedes:** the personal-portfolio and "delivered client work" framing in
`2026-10-12-website-in-brand-site-design.md`.

## 1. What changes and why

Three separate asks arrived together:

1. **"remove work delivered and all, say demo store"** — the site has no paying
   clients yet, so calling the gallery "delivered work" overstates it. The
   sites under `/store` are demos. Reframe the copy; keep the layout, position
   and route.
2. **"remove resume portfolio and all … multiple portfolios like
   /portfolio/jainil-patel, /portfolio/aman5 (later)"** — the portfolio stops
   being one personal page with a resume PDF and becomes a small multi-author
   section. `/portfolio` is an index of authors; each author owns a bio page
   and their own case studies. Adding a second author must be a data change,
   not a code change.
3. **"remove the local business pune and all … both small and large scale
   business … tech company but with economical prices … green theme … tree with
   tech logo"** — the brand is not a Pune-only shop service. It is a tech
   company whose differentiator is economical pricing at any scale.

The resume page, the resume PDF and `content/resume/` are deleted. They remain
recoverable from git history (commits before this change).

## 2. Data model — option A: two registries

Chosen over a single registry with an `kind` field, because an author and a
case study change for different reasons and on different cadence.

**New:** `content/portfolio/types.ts` + `content/portfolio/authors.ts`

```ts
export interface PortfolioAuthor {
  slug: string;        // kebab-case, becomes /portfolio/<slug>
  name: string;
  title: string;
  location: string;
  bio: string;         // 2-3 sentences, shown on the author page
  stack: string[];     // marquee chips
  links: PortfolioLink[]; // label + href, external profiles only
}
```

Seeded with one author, `jainil-patel`, using the facts `content/resume/data.ts`
already held (name, title, location, GitHub/LinkedIn/LeetCode links, summary
prose rewritten as a bio, skill groups flattened into `stack`). Experience,
education, certifications and the phone/email fields do **not** carry over —
this is a public case-study page, not a CV. Exports `authors`,
`getAuthorBySlug(slug)` and `getAllAuthorSlugs()`.

**Changed:** `DemoSite` gains a required `author: string` that must match a
`PortfolioAuthor.slug`. All three existing case studies are tagged
`jainil-patel`. This is the one field a future author's entry cannot omit, so
the type makes it non-optional rather than defaulting it.

## 3. Routes

| Route | Before | After |
| --- | --- | --- |
| `/portfolio` | Jainil's single personal page | Index of author cards |
| `/portfolio/[author]` | — | Author bio + their case studies |
| `/portfolio/[author]/work/[slug]` | `/portfolio/demos/[slug]` | Case-study detail |
| `/portfolio/demos` | gallery | **deleted** |
| `/portfolio/resume` | resume page + PDF | **deleted** |

Unknown author or slug calls `notFound()`. Case-study cards link through the
author (`/portfolio/jainil-patel/work/teamsync`) so the breadcrumb and detail
page always agree about who owns the work.

`generateStaticParams` stays for both dynamic segments, so the whole portfolio
is still prerendered.

## 4. Testing

New `test/portfolio-registries.test.ts` asserts the registry invariants that
routes silently depend on: author slugs unique; every case study's `author`
resolves to a real author; no empty `bio`/`stack`/`name`; screenshot on disk;
detail route resolves for every case study.

`test/helpers/resolve-route.ts` only matched literal folder names, so
`/portfolio/jainil-patel/work/teamsync` would report as missing. It now treats
any `[param]` segment as a wildcard and matches segment-wise, so route
assertions survive the move to dynamic segments.

`test/brand-registries.test.ts` swaps the `city` assertion for `badge` and
keeps the no-currency-figures invariant (`/₹|Rs\.?|price[d]? from|starting at/`)
— "economical prices" is positioning, not a quoted number.

## 5. Positioning copy

`Company` loses `city` and gains `badge` (the hero pill). Green stays the
accent; the brand mark becomes a tree.

- **tagline:** "Websites, AI and automation for businesses of every size"
- **pitch:** no city, no "shops/clinics/studios", states economical pricing
  without a figure.
- **hero badge:** replaced by `company.badge`, icon `Leaf` (was `MapPin`).
- **services heading:** "Three ways we help a shop grow" → "…your business
  grow".
- **contact page:** drops "Serving {city}".
- **footer:** drops "· Pune" and the Resume link.
- **`/store`:** eyebrow "Demo store", metadata title "Demo store", copy says
  these are demos built to show what is possible.
- **home proof strip:** keeps its position and count, reframed as demos rather
  than businesses served.

## 6. Logo and favicon

`components/brand/Logo.tsx` — inline SVG: a pine silhouette whose branches are
circuit traces ending in nodes. `stroke="currentColor"` so it inherits the
accent; sized by the parent. Same artwork duplicated into `app/icon.svg` for
the favicon (Next serves `app/icon.svg` automatically). `Navbar` drops
`Globe2` for `<Logo />`.

## 7. Production hygiene

- `app/sitemap.ts` and `app/robots.ts` so crawlers get the real route list
  (static params, not hand-maintained).
- Every page owns its `metadata` title/description; OpenGraph image on case
  studies comes from the screenshot already in the registry.
- Verification gate before push: `npm run lint`, `npm test`,
  `npx tsc --noEmit`, `npm run build`, then an HTTP sweep of every route
  (including deliberately-wrong author/slug expecting 404) and a browser walk
  of `/`, `/store`, `/portfolio`, `/portfolio/jainil-patel`, one case study and
  `/contact`.

## 8. Out of scope

- The three client demo sites under `app/(sites)/` keep their existing
  "Back to Apps" banners; changing them is a separate task.
- `/ricoco` (deferred earlier by Jainil).
- Adding `aman5` — future authors are a data entry in `authors.ts` plus their
  case studies in `content/demos/sites.ts`.
