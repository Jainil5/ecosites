# Two-audience services IA — Website IN brand site

Date: 2026-10-17 · Status: approved by Jainil in chat, sections 1 and 2 · Base commit: `7f00259`
Supersedes: `2026-10-16-get-online-homepage-design.md` for the **information architecture** of the
brand pages. The visual language of `2026-10-17-green-cut-plane-skin-design.md` is inherited
unchanged — this work adds structure inside that skin, it does not restyle it.

## 1. Goal

A visitor should know within one screen whether this site is talking to them. Today it cannot say:
services are organised by a four-step "get online" journey, which is correct advice for a café
owner and noise for a company buying an internal platform. The redesign adds an **audience axis** —
Local Business and Enterprise & Growing — and gives each a hub, a register of English, and routed
detail pages that speak to one kind of buyer.

Success looks like: a restaurant owner lands, sees menus/reservations/orders framed by a site they
can open and click, and messages on WhatsApp. A company evaluating a data platform lands, sees the
three real builds behind the claim, and reaches the same contact channel by a different route.

## 2. Decisions taken during brainstorming

| Decision | Outcome |
| --- | --- |
| Scope | Full architecture: homepage plus routed detail pages (12 indexable pages) |
| Base | `main` at `7f00259`, on the green cut-plane skin |
| Skin | Inherit `gs-*` / sage canvas / green+forest planes / Archivo. Freehand stays rejected |
| Four-step journey | Moves into `/services/local`; not deleted, not doubled onto the homepage |
| Nav | Splits on audience: For Local Business · For Enterprise · Products · Work · Contact |
| Industry/solution imagery | The real delivered builds, framed by `WebsiteCard`. No stock, no AI photos |
| Enterprise substantiation | Every solution proof-links a real build; claims limited to what the artifact shows |
| `WebsiteIn AI` as a product | Not a product entry. Handled as the `ai-automation` solution |
| Execution | `dev` fast-forwarded to base, work in `.worktrees/two-audience-ia`, merge to `main` when green |

## 3. What exists today, and what this changes

Already correct and left alone: `products.ts` holds two real software products (Order Book, Market
Pulse) rather than packages; five delivered sites in `websites.ts` with preview PNGs on disk;
`ProofBand`, `ClientMarquee`, `SiteCompiler`, `GooDefs`, `HeroStage` all on the green skin;
`test/brand-registries.test.ts` already refuses a product whose `demoPath` is an unbuilt route.

Changed: `services.ts`'s four steps stop being the homepage's organising idea and become the local
path's contents. `GrowBand`'s scroll-drawn tree follows them intact — its four tiers are the four
steps, so moving the band moves the animation with no rework.

Removed from `main` since the plan was drafted: `components/brand/SiteFrame.tsx`. Proof screenshots
now render through `components/WebsiteCard.tsx`, which `WorkStrip` and `/demos` already share. This
spec uses `WebsiteCard` and does not reintroduce a second browser-chrome primitive.

## 4. Route map

Route groups are erased by Next.js, so no existing URL changes.

| URL | Purpose | State |
| --- | --- | --- |
| `/` | 9-band homepage, split at band 04 | restructure |
| `/services` | Hub: two paths, one link each | restructure |
| `/services/local` | Journey + `GrowBand` + packages + its industries | new |
| `/services/enterprise` | Six solutions, proof-linked | new |
| `/industries/[slug]` | 6 pages | new |
| `/enterprise/[slug]` | 6 pages | new |
| `/products` | Order Book, Market Pulse | unchanged; Order Book gains `demoPath` |
| `/demos` | Canonical work gallery (nav label "Work") | unchanged |
| `/store` | Delivered-work framing, off-nav, kept for URL continuity | unchanged |
| `/portfolio/[author]/work/[slug]` | Founder proof, newly linked from solution pages | unchanged |
| `/contact` | Contact | unchanged |

12 detail pages from 2 page files. `generateStaticParams` derives slugs from the registries and
`dynamicParams = false`, so an unregistered slug is a real 404 and never a blank shell.

Primary nav: **For Local Business** `/services/local` · **For Enterprise** `/services/enterprise` ·
**Products** · **Work** · **Contact**. `Portfolio` remains footer-only, per the standing decision
that it is founder proof rather than something a shop owner browses. `/services` keeps its route and
sitemap entry so existing links and rankings do not move.

## 5. Content model

Four registries in `content/brand/`, following the pattern `products.ts` sets: data lives in the
registry, never hardcoded in a component.

```ts
// audiences.ts — the two paths and their framing, in one place
export interface Audience {
  key: 'local' | 'enterprise';
  name: string;            // 'Local Business' | 'Enterprise & Growing'
  headline: string;        // the band title this audience sees about itself
  pitch: string;           // 1-2 sentences, in that buyer's vocabulary
  path: string;            // '/services/local' | '/services/enterprise'
  cta: string;             // button label, not 'Learn more'
  items: string[];         // ordered slugs: industries for local, solutions for enterprise
}

// industries.ts
export interface Industry {
  slug: string;            // 'restaurants'
  name: string;            // 'Cafés & Restaurants'
  blurb: string;           // one sentence on the card
  pains: string[];         // what the owner struggles with, in their words
  deliverables: string[];  // menus, reservations, WhatsApp orders, loyalty
  proof: Proof | null;     // null renders a plane, never a fake screenshot
}

// solutions.ts
export interface EnterpriseSolution {
  slug: string;            // 'ai-automation'
  name: string;            // 'AI & Automation'
  blurb: string;
  builds: string[];        // what is constructed, plainly
  outcomes: string[];      // what changes afterwards
  proof: Proof;            // required for this tier
}

export type Proof =
  | { kind: 'site'; path: string }      // '/hair-adore', '/dream-cafe', '/savour'
  | { kind: 'product'; path: string }   // '/analytical-register', '/stock-screener'
  | { kind: 'case'; path: string };     // '/portfolio/jainil-patel/work/teamsync'
```

Helpers match the existing `getWebsiteBySlug` convention: `getIndustryBySlug`, `getSolutionBySlug`,
`audiences`.

### Proof mapping

Derived only from routes that exist at `7f00259` and from `websites.ts` / `content/demos/sites.ts`.

| Entry | Proof | Artifact |
| --- | --- | --- |
| restaurants | `site` | Dream Cafe, Savour |
| salons-and-spas | `site` | Hair Adore |
| retail-and-boutiques | `product` | Order Book |
| professional-services | `product` | Market Pulse |
| clinics-and-healthcare | `null` | plane composition |
| real-estate | `null` | plane composition |
| custom-software | `case` | TeamSync |
| cloud-integrations | `case` | TeamSync |
| ai-automation | `case` | Enterprise Productivity Agents |
| data-and-bi | `case` | AI Portfolio Advisor |
| digital-commerce | `product` | Order Book |
| technology-consulting | `case` | AI Portfolio Advisor |

`proof` is a discriminated union whose `path` must resolve, and the validator in
`test/brand-registries.test.ts` is extended to enforce it for industries and solutions exactly as it
already does for products. That check is the honesty mechanism: the site cannot ship a card promising
a page that is not built.

## 6. Copy discipline

Two registers, written per audience in the registries rather than once in `company.ts`:

- **Local** names concrete outcomes in the owner's vocabulary — customers find you, orders reach
  your phone, you edit the menu yourself. No stack names.
- **Enterprise** may name technology (RAG, pipelines, Kubernetes) because the buyer searches for it,
  but every capability sentence sits beside the artifact that shows it.

Standing rules carried from the green spec, unchanged: no invented numbers, funding, awards or press
quotes; no city names in rendered strings; no `demo` wording on `/store`; no `₹` or prices in
`company.*` / `products.*` marketing fields.

No image from the originating brief is used or referenced. Those are signed CDN links to third-party
work — they do not load from the site's own domain and are not licensed to sell services with. All
visual assets are the repo's existing `public/showcase/**` previews plus `gs-*` plane compositions;
any new artwork is generated for this project and owned by it.

## 7. Homepage bands

| # | Band | Component | Action |
| --- | --- | --- | --- |
| 01 | Hero, "Technology for every stage of business", two CTAs | `Hero` + `HeroStage` + `GooDefs` | extend: second CTA, split headline from `audiences.ts` |
| 02 | Who we help — local business, growing brand, startup, enterprise | `AudiencePaths` | new |
| 03 | Proof — counters + the existing marquee | `ProofBand`, `ClientMarquee` | fix one number: `industries served` must read `industries.length`, not `websites.length` |
| 04 | Services split — two columns, one per audience | `ServicesSplit` | new |
| 05 | Industries — six cards, proof-framed | `IndustryGrid` | new |
| 06 | Products — Order Book, Market Pulse | `ProductsGrid` | unchanged + Order Book `demoPath` |
| 07 | Work — five businesses live | `WorkStrip` | unchanged |
| 08 | How it works — tell us → plan → build → support | `ProcessBand` | new, four flat planes, mono indices |
| 09 | Contact CTA | existing closing band | headline becomes "Let's build something that grows your business." |

`SiteCompiler` stays inside the hero band — it is the strongest local-business hook on the site.
`ServicesJourney` and `GrowBand` move out of the homepage into `/services/local`.

## 8. Visual treatment

The existing `gs-*` grammar only: pale sage canvas, `#22C55E` plane, `#14532D` forest, `#BEF264`
lime mono corner labels, Archivo heavy caps, visible grid, zero radius. No `npm install`; `framer-
motion@12` and the repo's 3D vocabulary are already present.

**Persistent audience code.** Local renders on `plane` green, enterprise on `forest` — applied to
that audience's corner label, divider rule and card top edge, so the split is legible before any
reading. Same code on the hub pages and detail pages.

Industry and solution cards use `WebsiteCard` on the audience's field. A `proof: null` industry
renders a flat rotated plane with its mono index instead of a screenshot — deliberately different in
shape, so an unbuilt vertical never reads as a delivered one.

## 9. Components as bounded units

`AudiencePaths`, `ServicesSplit`, `IndustryGrid` + `IndustryCard`, `SolutionGrid` + `SolutionCard`,
`ProcessBand`, and one shared `ServiceDetail` shell that both `/industries/[slug]` and
`/enterprise/[slug]` render through, taking a registry entry as its only prop.

Each unit consumes registries and props and holds no copy of its own, so a page file stays under
about 40 lines and a component can be understood without reading its siblings. `ServiceDetail` is
shared because the two namespaces need the same arc — headline, pains or builds, outcomes, proof,
contact — in different vocabulary, and the difference belongs in the data.

## 10. Metadata, sitemap, robots

Per-page `title` and `description` generated from the registry entry; canonical via the existing
`siteUrl`; `og:type` `website`. `app/sitemap.ts` is hand-written today, so a forgotten slug is
silent — it gains registry-generated entries for `/services/local`, `/services/enterprise`,
`/industries/*` and `/enterprise/*`, mapped from the same arrays the pages use. `robots.ts` is
unchanged. No new OG images in this pass.

## 11. Failure modes

- **Unregistered slug** → `notFound()` plus `dynamicParams = false`. 404, not an empty shell.
- **Proof path that no longer exists** → caught by the extended registry validator at test time,
  before it can ship.
- **Missing preview PNG** → `WebsiteCard` renders `site.screenshot` straight into `next/image` with
  no fallback, so an absent file is a broken image, not a cover. The registry test asserts every
  `screenshot` path exists on disk, which is what keeps `/demos`, `WorkStrip` and the industry grid
  from ever shipping one.
- **`proof: null`** → renders the plane composition path, which is a first-class branch, not an
  error state.
- **Dark legacy tokens** → the legacy scale in `tailwind.config.ts` is still referenced by
  un-migrated `go-*` CSS and must not be deleted in this pass; see out of scope.

## 12. Accessibility

One link per card with no nested anchors; card title is the link's accessible name. Heading order
`h1 → h2 → h3` per band with no skipped levels. `gs-reveal`, plane drift and the gooey filter stay
behind the existing `prefers-reduced-motion` gates. Every `alt` is derived from registry fields, not
handwritten per call site. `focus-ring` on all new interactive surfaces, including the two hero CTAs.

## 13. Testing

Extend `test/brand-registries.test.ts`: every `proof.path` and `demoPath` resolves to a real route;
every `websites[].screenshot` file exists under `public/`; slugs unique across both namespaces;
every industry and solution reachable from its hub page.

Add `test/brand-ia.test.ts`: sitemap contains one entry per registered slug and both hubs; page
files assert `dynamicParams = false`; new brand components reference no legacy dark token
(`bg-deep`, `text-subtle`, `text-foreground`).

`test/brand-skin.test.ts` keeps asserting that `--font-sans` and `--font-mono` are not repointed —
Dream Cafe and the screener own them.

Verification at every task end: `npx vitest run` and `npm run build` clean; browser pass at 1440px
and 390px on a **pinned free port, never `:3000`** (that is the stale `npm start` build);
reduced-motion emulation; goo filter checked in Safari as well as Chrome; and the demo routes
`/stock-screener`, `/hair-adore`, `/savour`, `/dream-cafe`, `/analytical-register` visually
unchanged.

## 14. Execution model

`dev` fast-forwards to `7f00259` (it is a strict ancestor, so no merge commit). Work happens in
`.worktrees/two-audience-ia` with `dev` checked out, because `main` is checked out in the primary
tree and a second session is actively committing there — it moved twice during this brainstorm. One
dev server, pinned free port. Merge `dev` → `main` only with `vitest` and `build` green.

## 15. Out of scope

- Deleting the legacy dark colour scale and `go-*` CSS (still referenced; the green spec's own task).
- OrderBook's Supabase persistence, and coupons.
- Consolidating `/store` with `/demos`.
- A `WebsiteIn AI` product entry.
- A `/products/[slug]` detail route. `ProductsGrid` already renders modules and bullets for both
  products on one page, and neither product needs an audience-specific argument to sell itself.
- Per-industry copy depth beyond these sections, and real client outcome numbers.

## 16. Known risks

The base is a moving target: `main` gained screener motion, Dream Cafe, OrderBook and the green skin
inside one afternoon while this design was being written. If the concurrent session restyles the
same bands during implementation, re-anchor against `dev` rather than the file contents quoted here.

Second: the green skin migration is not finished — 24 files read the new tokens while the legacy
dark scale still backs `go-*` rules. Any band added in this pass must be written green-first so the
eventual cleanup does not have to revisit it.
