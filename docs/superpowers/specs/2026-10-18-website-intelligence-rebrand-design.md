# Website Intelligence rebrand — Phase 1

Date: 2026-10-18 · Status: approved by Jainil in chat (sections 1–5) · Supersedes: `2026-10-17-two-audience-services-ia-design.md`

Source brief: "Website Intelligence — Brand Rebrand & Landing Page Restructuring Brief" (attached by Jainil, 2026-10-18).

## 0. Decisions taken during brainstorming

| Decision | Outcome |
| --- | --- |
| Skin | **Keep the green cut-plane skin.** The brief's navy/blue palette is rejected for this pass; rebrand is words + structure only. Navy stays a possible future brand decision. |
| Products | Both remain. **OrderBook is the featured product** ("OrderBook by Website Intelligence"); Market Pulse keeps its name, entry, and live demo. |
| Scope | **Phase 1 only**: rename, homepage rebuild, `/local-business`, `/enterprise`, `/about`, `/services` hub rework, `/contact` framing. Industry detail pages, `/products/orderbook`, case studies → later phases. |
| Approach | One absorbing spec reusing the two-audience content model, on **existing URLs**. No redirects, no new `/services/*` subpages, no `/work` (it is `/demos`), no `/get-started` (it is `/contact`). |
| Domain | `websitein.com` unchanged, per the brief. |
| Working tree | No worktree: concurrent sessions share this tree; work happens directly, one dev server, never `next build`. |

## 1. Brand rename (data-driven)

`content/brand/company.ts` is the single source of truth:

- `name: 'Website Intelligence'`
- `tagline: 'Technology for Every Business.'`
- `pitch`: rewritten from the brief's positioning — practical digital solutions that help businesses get online, operate more efficiently, understand their data, and adopt AI as they grow; start simple, grow smarter.
- `badge`: `Web, Software & AI` (the brand descriptor).
- `contact.whatsappMessage`: `Hi Website Intelligence! I would like a website for my business.`

Rendered strings:

- Navbar + Footer wordmark print `Website` + accent `Intelligence`; no new logo artwork — the existing `Logo` mark carries it (simple wordmark, per the brief).
- Copyright follows `company.name` automatically.
- The title template in the root layout becomes `"%s | Website Intelligence"`; root default title carries the new tagline.
- Every "Website IN / WebsiteIn" string in brand components and pages is replaced (≈19 files, mostly one registry). Client-site credits (Dream Cafe, Savour, Hair Adore footers) print the new name.
- Order Book → **OrderBook** in `products.ts` (`title: 'OrderBook'`, summary/bullets unchanged in substance), plus `demoPath: '/analytical-register'` now that the app is live. `test/brand-registries.test.ts` already refuses a `demoPath` whose route is unbuilt; the route exists.

Standing honesty constraints, carried from the two-audience spec and reinforced by the brief, all test-enforced:

- no invented numbers, funding, awards, press quotes, customer logos or testimonials;
- no prices / `₹` in `company.*` or `products.*` marketing fields;
- no city names in rendered strings;
- `/store` keeps reading as delivered client work — no "demo" wording there;
- capability lists name only what shipped; roadmap items are labelled "coming soon";
- demos on brand pages are labelled as demos.

## 2. Routes

Route groups are erased by Next.js; no existing URL changes.

| URL | Purpose | Action |
| --- | --- | --- |
| `/` | 9-band homepage (section 3) | restructure |
| `/local-business` | "Grow Online" hub (section 4) | new |
| `/enterprise` | "Build Smarter" hub (section 4) | new |
| `/about` | mission, pillars, how we work, early-stage honest | new |
| `/services` | six-capability hub, routes visitors to an audience | restructure |
| `/contact` | keeps WhatsApp/phone/email channels; gains local vs enterprise framing | extend |
| `/products` | OrderBook featured first, Market Pulse second | minor edit |
| `/demos` | canonical work gallery, nav label "Work" | unchanged |
| `/store`, `/portfolio/**`, all client/demo routes | — | unchanged |

Primary nav: **Local Business · Enterprise · Services · Products · Work · About** + button **Get Started** → `/contact`. Contact drops out of the link list (the CTA covers it); Portfolio stays footer-only. `/contact` is the conversion endpoint for every CTA in the brief — there is no `/get-started`, no fake webform: the site has no backend, so enquiry capture is WhatsApp/phone/email deep links with prefilled context.

CTA discipline (brief §3): one primary + one secondary per page.

| Page | Primary | Secondary |
| --- | --- | --- |
| `/` hero | Get Your Business Online → `/local-business` | Explore Enterprise Solutions → `/enterprise` |
| `/` final band | Get Started → `/contact` | Discuss an Enterprise Project → `/contact` (enterprise-prefilled WhatsApp) |
| `/local-business` | Get Your Business Online → `/contact` | See the work → `/demos` |
| `/enterprise` | Discuss Your Project → `/contact` | See the proof (in-page anchor) |
| `/products` | Explore OrderBook (demo) | Request a demo → WhatsApp |
| `/about` | Tell Us What You Need → `/contact` | See the work → `/demos` |

## 3. Homepage bands

| # | Band | Component | Content source |
| --- | --- | --- | --- |
| 01 | Hero: eyebrow `WEB • SOFTWARE • DATA • AI`, headline "Technology for Every Business.", brief hero paragraph, two CTAs; `SiteCompiler` stays inside the band | `Hero`, `HeroStage`, `GooDefs` | `company.ts`, `audiences.ts` |
| 02 | Choose Your Path: "Grow Online." vs "Build Smarter." | `AudiencePaths` (new) | `audiences.ts` |
| 03 | Services: six capability cards, CTA → `/services` | `ServicesGrid` (new) | `capabilities.ts` |
| 04 | Industry Solutions: eight cards, proof-chipped, non-linked where no page exists | `IndustryGrid` (new) | `industries.ts` |
| 05 | Featured product: "Know your orders. Understand your sales." + real `/analytical-register` screenshot via `WebsiteCard`; shipped features only | `ProductFeature` (new) | `products.ts` |
| 06 | How We Work: Understand → Plan → Build → Improve, four flat planes, mono indices | `ProcessBand` (new) | `content/brand/process.ts` |
| 07 | Work & Proof: counters + marquee + delivered strip | `ProofBand`, `ClientMarquee`, `WorkStrip` | registries; `industries served` must read `industries.length` (number fix carried from the 10-17 spec) |
| 08 | Why Website Intelligence: five points | `WhyUs` (new) | `content/brand/whyus.ts` |
| 09 | Final CTA: "Let's build what your business needs next." | existing closing band + `ContactCta` | `audiences.ts` |

`ServicesJourney` and `GrowBand` leave the homepage and land on `/local-business` intact — GrowBand's four tiers are the four journey steps, so the animation moves with no rework.

## 4. Hub pages

**`/local-business`** (brief §6): hero "Grow Online." + brief pitch; the four-step journey (`serviceSteps`: Get Found / Get Known / Get Running / Get Smart) as the "what you can start with" content, with `GrowBand` after it; industry cards; FAQ — only truthfully answerable questions (mobile-first: yes; WhatsApp enquiries: yes; own the site and content: yes; bookings/orders later: yes, that is the growth path; no maintenance-SLA or turnaround promises). No fixed prices, per the brief.

**`/enterprise`** (brief §7): hero "Build better systems. Make smarter decisions."; five capabilities, each proof-linked (section 5); engagement approach (Discovery → Scope & plan → Build → Test & launch → Optional support); CTA to `/contact`.

**`/about`**: mission, vision, five brand pillars, how we work, honest early-stage framing — demos and delivered builds shown as what they are; no fabricated proof.

**`/services`** restructured as the hub of six capabilities (Websites, Digital Commerce, Business Software, Data & Analytics, AI & Automation, Cloud & Integrations), each with the brief's example list and a CTA that routes to the right audience page. No `/services/*` subpages this pass.

## 5. Content model

Registries in `content/brand/`, following `products.ts`: data lives in the registry, never hardcoded in a component. Helpers match the existing `getWebsiteBySlug` convention.

```ts
// audiences.ts
export interface Audience {
  key: 'local' | 'enterprise';
  name: string;            // 'Local Business' | 'Enterprise & Growing'
  campaign: string;        // 'Grow Online.' | 'Build Smarter.'
  headline: string;
  pitch: string;           // 1-2 sentences, that buyer's vocabulary
  path: string;            // '/local-business' | '/enterprise'
  cta: string;             // button label, not 'Learn more'
}

// industries.ts — eight brief verticals
export interface Industry {
  slug: string;            // 'restaurants'
  name: string;            // 'Cafés & Restaurants'
  blurb: string;           // one sentence on the card
  deliverables: string[];  // plainly what gets built
  proof: Proof | null;     // null renders a plane, never a fake screenshot; card is non-linked
}

// capabilities.ts — six services on /services and homepage band 03
export interface Capability {
  slug: string;            // 'websites'
  name: string;            // 'Websites & Digital Presence'
  blurb: string;
  examples: string[];      // the brief's example lists
  audience: 'local' | 'enterprise' | 'both';
}

// solutions.ts — five enterprise capabilities on /enterprise
export interface Solution {
  slug: string;            // 'data-and-bi'
  name: string;
  blurb: string;
  builds: string[];
  proof: Proof;            // required at this tier
}

export type Proof =
  | { kind: 'site'; path: string }      // '/dream-cafe', '/hair-adore', '/savour'
  | { kind: 'product'; path: string }   // '/analytical-register', '/stock-screener'
  | { kind: 'case'; path: string };     // '/portfolio/jainil-patel/work/<slug>'
```

Proof mapping (all paths verified to exist on 2026-10-18):

| Entry | Proof | Artifact |
| --- | --- | --- |
| restaurants | `site` | `/dream-cafe` (Savour also referenced in the card copy) |
| salons-and-spas | `site` | `/hair-adore` |
| retail-and-boutiques | `product` | `/analytical-register` (OrderBook) |
| professional-services | `product` | `/stock-screener` (Market Pulse) |
| clinics-and-healthcare | `null` | plane composition |
| real-estate | `null` | plane composition |
| home-services | `null` | plane composition |
| b2b | `null` | plane composition |
| custom-software | `case` | `/portfolio/jainil-patel/work/teamsync` |
| data-and-bi | `case` | `/portfolio/jainil-patel/work/portfolio-advisor` |
| ai-and-automation | `case` | `/portfolio/jainil-patel/work/enterprise-productivity-agents` |
| apis-and-integrations | `case` | `/portfolio/jainil-patel/work/teamsync` |
| cloud-and-modernisation | `product` | `/stock-screener` |

`proof.path` must resolve and the validator enforces it at test time — that is the honesty mechanism: the site cannot ship a card promising a page that is not built.

## 6. Components as bounded units

New: `AudiencePaths`, `ServicesGrid`, `IndustryGrid` (+ `IndustryCard`), `SolutionGrid` (+ `SolutionCard`), `ProductFeature`, `ProcessBand`, `WhyUs`, plus page files for `/local-business`, `/enterprise`, `/about`. Existing `WebsiteCard` renders proof screenshots; no second browser-chrome primitive. Each unit consumes registries and props and holds no copy of its own, so a page file stays under ~40 lines.

## 7. Visual treatment

The existing `gs-*` grammar only: pale sage canvas, `#22C55E` plane, `#14532D` forest, `#BEF264` lime mono labels, Archivo heavy caps, visible grid, zero radius. Persistent audience code: local renders on plane green, enterprise on forest — corner label, divider rule, card top edge. A `proof: null` industry renders a flat rotated plane with its mono index, deliberately different so an unbuilt vertical never reads as delivered. No `npm install`; `framer-motion@12` and the repo's 3D vocabulary are already present. No robot/circuit imagery (brief agrees with the skin here).

## 8. Metadata, sitemap, robots

Per-page `title`/`description` generated from the registry entries; template `"%s | Website Intelligence"`; canonical via the existing `siteUrl` (`websitein.com`); `og:type` `website`. `app/sitemap.ts` gains `/local-business`, `/enterprise`, `/about`. `robots.ts` unchanged. No new OG images this pass.

## 9. Failure modes

- **Proof path that no longer exists** → registry validator fails the test run before ship.
- **`proof: null`** → first-class plane branch, not an error state.
- **Missing screenshot for `ProductFeature`** → registry test asserts every referenced `screenshot` file exists under `public/` (pattern already used for `/demos`).
- **Old brand string left behind** → `test/brand-rebrand.test.ts` greps rendered content sources for `Website IN`/`WebsiteIn` and fails on any hit (spec/plan docs excluded).
- **Dark legacy tokens** → unchanged rule: new bands are written green-first; legacy `go-*` scale is not deleted in this pass.

## 10. Accessibility

One link per card, no nested anchors; card title is the accessible name. Heading order `h1 → h2 → h3` per band, no skipped levels. `gs-reveal`, plane drift and gooey filter stay behind `prefers-reduced-motion`. `alt` text derived from registry fields. `focus-ring` on every new interactive surface, including both hero CTAs. Non-linked industry cards use `div` semantics, never a disabled link.

## 11. Testing

- Extend `test/brand-registries.test.ts`: every industry/capability/solution `proof.path` and `demoPath` resolves to a real route; slugs unique; every industry reachable from its hub page.
- New `test/brand-rebrand.test.ts`: no rendered brand string contains the old name; `company` fields match the brief; nav/footer link sets asserted; sitemap lists all Phase-1 routes exactly once.
- `test/brand-skin.test.ts` unchanged — its passing is the proof no accidental reskin happened.
- Verification at every task end: `npx vitest run`, `npx tsc --noEmit`, `npm run lint`. **No `next build`** (concurrent sessions share this tree). Browser pass at 1440px and 390px against a single dev server on a pinned free port (never `:3000` if it is occupied by the stale `npm start` build; check `ps aux | grep next` first); reduced-motion emulation; client routes `/dream-cafe`, `/savour`, `/hair-adore`, `/stock-screener`, `/analytical-register` visually unchanged.

## 12. Out of scope

- Navy/blue reskin.
- Industry detail pages, `/products/[slug]`, `/products/orderbook`, case studies (brief Phases 2–3; the 10-17 spec's `/industries/*` and `/enterprise/*` detail routes are deferred with them).
- `/get-started`, `/work` URL changes; redirects of any kind.
- Backend enquiry form (site is static; capture stays WhatsApp/phone/email).
- Fixed prices, service-level promises.
- OrderBook Supabase persistence and coupons.
- Deleting the legacy dark colour scale and `go-*` CSS.

## 13. Known risks

`main`/`dev` move under this work: another session commits and switches branches in the same tree. Re-anchor against current `dev` before each task rather than file contents quoted here. The 10-17 spec remains on disk as history; this file supersedes it and says so at the top.
