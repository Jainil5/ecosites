# Website IN brand skin — freehand.ai design language

Date: 2026-10-16 · Status: approved by Jainil · Replaces: `2026-10-16-get-online-homepage-design.md`'s visual language (its IA and components survive)

## Decisions locked during brainstorming

- **Pivot depth**: full skin swap of the brand pages. The `go-*` "code-brutalism" language (dark navy, mono-first, green accent, cyan→violet gradient reserved for interactive elements, CSS-3D plate hero) is replaced.
- **Reference, measured not summarised**: freehand.ai's real tokens were extracted from its Webflow CSS, not from a description of it.
- **Type**: `BL Pylon Serif` is licensed, so **Source Serif 4** stands in at weight 200/300. Body **Fustat**, labels and buttons **Geist Mono**. All three verified present in the live Google Fonts catalog.
- **Accent**: freehand's orange `#FE6200` with its warm scale. **Logo mark stays green** `#22C55E` — it reads as a second brand hue, which the reference itself supports (lime, aqua, peony, lavender in its scale).
- **Radius**: `0px`. freehand sets `--radius-small/medium/large` all to `0px`. Rounded panels, glass, gradient hairlines, glow and 3D plates come out of the brand shell.
- **Section arc**: borrow freehand's structure, keep honest content. Announcement bar, serif hero, client marquee, stat band, process walkthrough, comparison table, verticals, tech band, closing CTA, footer. **No press-quote wall, no financial guarantee, no invented funding or awards.**
- **Hero**: freehand-style serif hero with no video. The existing "type your business name → see your site" `SiteCompiler` is promoted to its own band directly below the fold, as a flat bordered card.
- **`/store` and `/demos` both stay.** `/store` moves off-nav but keeps its route and sitemap entry.
- **Motion**: restrained. Keep `slice`/`reveal` and the count-up; add one marquee and a flat `band-rise` with no `rotateX`/`translateZ`.

## Safety findings (why this is not a scary change)

- **Demo sites self-theme.** `components/sites/**` and `app/(sites)/**` consume **zero** shared Tailwind colour tokens — they hardcode hex (`bg-[#04060B]`) and use their own scoped class families (`mp-*`, `ha-*`, `.savour`, `.dream-cafe`/`.dc-*`). Flipping the brand tokens to light cannot reach them.
- **Do not repoint `--font-sans`.** `.dc-display` inherits `var(--font-sans)` at weight 800, so swapping Inter→Fustat globally would silently restyle the Dream Cafe client site. New brand-scoped variables instead.
- **Dead CSS confirmed.** `.hero-stage`, `.hero-float`, `.plate*`, `.hero-shadow` exist only in `app/globals.css` — their consumer `components/brand/HeroPanel.tsx` is deleted. ~130 lines removable.
- **`.plate-in` and `.plinth` are live** (WorkStrip, ProductsGrid, ServicesJourney, demos page, Icon3D) and must be restyled or replaced, not just deleted.

## A — Token layer

`tailwind.config.ts`, replacing the dark scale:

| token | value | role |
|---|---|---|
| `canvas` | `#FFFFFF` | page field |
| `paper` | `#FDF8F4` | cards on white |
| `band` | `#FAF3E8` | alternating section band |
| `tint` | `#FFF3EB` | orange-tinted highlight band |
| `ink` | `#0D0B08` | text; dark bands' canvas |
| `ink-2` / `ink-3` | `#4A3A2A` / `#7A6855` | secondary / tertiary |
| `hairline` | `#EAE0D6` | all dividers, replaces `border-white/[0.07]` |
| `dark` / `dark-card` | `#1C1208` / `#2C1D0D` | stat band, closing CTA |
| `accent` | `#FE6200`, scale 10 `#FAE1D1` → 80 `#200B00` | interactive only |
| `mark-green` | `#22C55E` | logo mark only |

**Font variables — one correction found during spec self-review.** An earlier draft of this section said to repoint `--font-mono` to Geist Mono. That leaks: 13 files under `components/sites/**` and `app/(sites)/**` use Tailwind's `font-mono`, so it would silently re-typeset the Market Pulse client site. The final mapping:

| variable | before | after | demo usage |
|---|---|---|---|
| `--font-display` | Share_Tech_Mono | **Source Serif 4** | none (0 files) — safe to repoint |
| `--font-label` | — | **Geist Mono** *(new)* | new key, brand-only |
| `--font-body` | — | **Fustat** *(new)* | new key, applied on `app/(site)/layout.tsx` wrapper |
| `--font-sans` | Inter | Inter, unchanged | Dream Cafe's `.dc-display` inherits it at weight 800 |
| `--font-mono` | Fira_Code | Fira_Code, unchanged | 13 screener files depend on it |

So brand components swap `font-mono` → `font-label` (a rename pass, part of the restyle), and `font-display` picks up the serif for free with no component edits. Fira_Code and Share_Tech_Mono leave the brand path but Fira_Code stays loaded because the demos still need it.

Headline signature: serif weight **300**, `line-height 1.2`, tracking `-0.014em`→`-0.045em`, sizes 4.5/4/3.625rem. Labels and buttons Geist Mono uppercase 500.

## B — Homepage arc

`app/(site)/page.tsx`, eleven bands:

1. `NewsBar` *(new)* — thin ink band, mono orange lede, links to real portfolio items.
2. `Hero` *(rewrite)* — serif headline, one support line, two CTAs (orange solid, ink outline).
3. `ClientMarquee` *(new)* — four delivered sites as wordmarks, seamless CSS loop.
4. `SiteCompiler` *(moved, restyled)* — flat bordered card; WhatsApp prefill logic untouched.
5. `ProofBand` *(restyle)* — dark brown stat band, serif numerals; count-up kept.
6. `ServicesJourney` *(restyle)* — ink hairline rail, orange nodes.
7. `ProductsGrid` *(restyle)* + `ComparisonTable` *(new)* — agency vs Website IN.
8. `WorkStrip` *(restyle)* — verticals: salon, bagel cafe, restaurant guide, fintech terminal.
9. `TechBand` *(new)* — Next.js, Tailwind, TypeScript, Supabase, Postgres RLS, WhatsApp, payments.
10. Closing CTA *(restyle)* — dark band, serif promise, `ContactCta`.
11. `Footer` *(restyle)* — four-column ink-on-cream sitemap.

`GridBackground` deleted. `PageHeader` becomes mono eyebrow + serif `slice` title.

## C — Sub-pages

- `/services` — four steps as `problem → what we build → what customers notice` square panels on alternating `band`/`paper`.
- `/products` — `ProductsGrid` full width + `ComparisonTable` + ₹-from chips (prices still flagged placeholder pending Jainil's confirmation).
- `/demos` — four vertical cards with real browser frames; `SiteFrame` chrome flips dark→light (`bg-paper` + `hairline`) so a dark screenshot in a light frame still reads.
- `/store` — restyled, off-nav, route and sitemap kept. Content wording untouched: delivered client work, no "demo" language.
- `/portfolio`, `/portfolio/<author>`, `…/work/<slug>` — token remap only, copy and structure unchanged.
- `/contact` — three channels as bordered squares, no form.

## D — Motion

- **Keep**: `slice`/`slice-inner`/`slice-scroll`, `reveal`, `ProofBand` count-up.
- **Add**: marquee keyframe for `ClientMarquee`; flat `band-rise` entrance (24px translate).
- **Delete from brand path**: `.plate`/`.plate-motion`/`.plate-face`/`.plate-in`, `.hero-stage`/`.hero-float`/`.hero-shadow`, `.plinth`, `.beacon`, `.glass`, `.text-glow`, `.scene*`, all `.go-*`, `GridBackground`, `.edge`. `.frame*` survives, restyled.
- **Untouched**: `mp-*`, `ha-*`, `.savour`, `.dc-*`, and `::view-transition-*` rules the screener depends on.
- Everything inside `prefers-reduced-motion: no-preference`; loops rest at their visible end state.

## E — Content

New typed files in `content/brand/`: `news.ts`, `clients.ts` (derived from `content/websites/sites.ts`, not duplicated), `comparison.ts`, `stack.ts`.

Content is generated from existing data, not written fresh, so nothing can drift:
- `NewsBar` items derive from the four delivered sites — e.g. "New — Dream Cafe: a bagel and coffee bar, live". `content/brand/news.ts` therefore re-exports from `content/websites/sites.ts` rather than holding its own copy.
- `ClientMarquee` entries are `websites.map(w => ({ name: w.title, business: w.business }))`.
- `ProofBand` counts keep deriving from `websites.length`.
- `comparison.ts` rows contrast a conventional agency against Website IN on axes already documented in `services.ts`/`products.ts` (time to first draft, who edits content after launch, what happens to the site later). No price claims we cannot back; the ₹-from chips on `/products` stay flagged as placeholders pending Jainil's confirmation.

Rules: **no invented numbers** — counts derive from `websites.length` so marquee and stat band cannot drift; **no funding, awards, or press quotes**. International positioning holds: no "Pune" in any rendered string.

## F — Verification

`npm run test` and `npm run build` clean. New route-presence test asserting `/store` and `/demos` both resolve. Browser pass at 1440px and 390px on `/`, `/services`, `/products`, `/demos`, `/store`, `/portfolio/jainil-patel`, `/contact`; reduced-motion emulation check; zero console errors. Then the four demo routes re-verified unchanged — a light-page regression there would mean brand tokens leaked into a scoped site.

Unverifiable by type-checking: whether Source Serif 4 at weight 300 carries the headline the way Pylon does. The hero must be eyeballed at 1440px before the treatment propagates to the other ten bands.
