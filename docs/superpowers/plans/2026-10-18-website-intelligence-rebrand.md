# Website Intelligence rebrand (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the site from "Website IN" to "Website Intelligence" per the brief, rebuild the homepage to the 11-section blueprint, and publish `/local-business`, `/enterprise`, `/about` — on existing routes, on the existing green skin.

**Architecture:** Registry-driven brand pages. All copy lives in `content/brand/` registries following the `products.ts` pattern; components consume registries and hold no copy of their own. A `Proof` discriminated union plus a filesystem route validator is the honesty mechanism: no card can ship a link or claim without a real built artifact behind it.

**Tech Stack:** Next.js App Router (route group `(site)`), TypeScript, Tailwind tokens (`canvas/plane/forest/lime/ink/hairline/accent`) + existing `gs-*` classes, Vitest, framer-motion@12 (already present — do NOT install anything).

**Spec:** `docs/superpowers/specs/2026-10-18-website-intelligence-rebrand-design.md` — read it fully before starting. It supersedes the 2026-10-17 two-audience spec.

## Global Constraints

- Keep the green cut-plane skin exactly; no navy/blue, no new fonts, no `npm install`.
- No `next build` — concurrent sessions share this tree. Verify with `npx vitest run`, `npx tsc --noEmit`, `npm run lint` only.
- Never `git stash` / `git reset --hard` / bare checkout; another session commits and switches branches in this same tree. Re-run `git status` before every commit and stage only this plan's files (Dream Cafe work is uncommitted here too — leave it alone).
- Commits: ask the user before the first commit of this plan; once approved, commit per task with the messages given. If he declines, skip commit steps and keep working.
- Copy rules (spec §1): no invented numbers/logos/testimonials, no prices/`₹` in marketing fields, no city names in rendered strings, no "demo" wording in `content/websites/sites.ts` copy, roadmap features labelled "coming soon", old name "Website IN"/`WebsiteIN` must not survive in any rendered source.
- Domain stays `websitein.com`; `content/brand/site.ts` unchanged.
- Every new interactive surface gets `focus-ring`; heading order `h1→h2→h3`, no skips; motion stays on existing `gs-reveal` / `prefers-reduced-motion` gates.
- Dev server: check `ps aux | grep next` first; reuse a running `next dev`, else one `next dev` on a pinned free port (never kill the user's server). Browser verification in a NEW Chrome tab, never the user's.

**Available building blocks (do not reinvent):**
`PageHeader({index,label,title,children})`, `SectionIntro({index,label,title,children})`, `ContactCta()`, `ContactRow()`, `WebsiteCard({site,showHeading?})` (takes a `websites.ts` entry), `GrowBand()`, `ServicesJourney({detailed})`, `ProductsGrid({showHeading})`, `Logo({className})`, helpers `whatsappHref/telHref/mailtoHref(contact)` from `content/brand/links.ts`, test helper `resolveRoute(path)` from `test/helpers/resolve-route.ts`.

---

### Task 1: Company rename + wordmark

**Files:**
- Modify: `content/brand/company.ts`
- Modify: `components/Navbar.tsx:43` (wordmark), `components/Footer.tsx:29` (wordmark)
- Modify: `components/brand/SiteCompiler.tsx` (old-name string — grep `Website IN|WebsiteIn`)
- Modify: `components/sites/dream-cafe/Nav.tsx`, `components/sites/savour/Savour.tsx`, `components/sites/hair-adore/HairAdore.tsx`, `components/sites/stock-screener/MarketShell.tsx`, `app/(site)/demos/page.tsx`, `app/(site)/page.tsx:14-16` (comment)
- Modify: `test/brand-registries.test.ts:47`, `test/brand-contact-links.test.ts` (name expectations)
- Test: Create `test/brand-rebrand.test.ts`

**Interfaces:**
- Produces: `company.name === 'Website Intelligence'`, `company.tagline === 'Technology for Every Business.'`, `company.badge === 'Web, Software & AI'` — consumed by every later task; the layout title template (`%s | ${company.name}`) and OG block update automatically from `company.ts`.

- [ ] **Step 1: Write the failing old-name scan**

Create `test/brand-rebrand.test.ts`:

```ts
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { company } from '@/content/brand/company';

// Rendered sources: everything a visitor can see, minus docs and this test.
const SOURCES = [
  'content',
  'components',
  'app',
];

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(tsx?|css)$/.test(full) && !full.includes('brand-rebrand')) yield full;
  }
}

describe('Website Intelligence rename', () => {
  it('carries the new brand fields', () => {
    expect(company.name).toBe('Website Intelligence');
    expect(company.tagline).toBe('Technology for Every Business.');
    expect(company.badge).toBe('Web, Software & AI');
    expect(company.contact.whatsappMessage).toContain('Website Intelligence');
  });

  it('leaves no trace of the old name in rendered sources', () => {
    for (const dir of SOURCES) {
      if (!existsSync(dir)) continue;
      for (const file of files(dir)) {
        const text = readFileSync(file, 'utf8');
        // Case-sensitive: 'Website IN' (space + caps) and 'WebsiteIN' are the
        // old wordmark forms; 'Website Intelligence' cannot match either.
        expect(text, file).not.toMatch(/Website IN(?![a-z])|WebsiteIN(?!telligence)/);
      }
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run test/brand-rebrand.test.ts` → FAIL on the brand fields.

- [ ] **Step 3: Rewrite `content/brand/company.ts`**

```ts
import type { Company } from './types';

export const company: Company = {
  name: 'Website Intelligence',
  tagline: 'Technology for Every Business.',
  pitch:
    'From your first business website to intelligent software, data and AI workflows — practical digital solutions that help businesses get found, run smoother, understand their numbers and grow smarter as they scale. Start with what you need today. Add more as your business grows.',
  badge: 'Web, Software & AI',
  contact: {
    email: 'mail.jainil5@gmail.com',
    phone: '8238889347',
    phoneDisplay: '+91 82388 89347',
    whatsappMessage: 'Hi Website Intelligence! I would like a website for my business.',
  },
};
```

- [ ] **Step 4: Replace the wordmarks and stray strings**

`components/Navbar.tsx:43` — `Website<span className="text-accent">IN</span>` becomes:

```tsx
Website <span className="text-accent">Intelligence</span>
```

`components/Footer.tsx:29` — `Website <span>IN</span>` becomes `Website <span>Intelligence</span>`.

Then grep-locus the remaining hits and reword each to the new name:

Run: `grep -rn "Website IN\|WebsiteIn\|WebsiteIN" content components app`
Expected remaining after edits: test expectations only. Update `test/brand-registries.test.ts:47` to `expect(company.name).toBe('Website Intelligence');` and the same expectation inside `test/brand-contact-links.test.ts`. Client-site credits (`dream-cafe/Nav.tsx`, `savour/Savour.tsx`, `hair-adore/HairAdore.tsx`, `stock-screener/MarketShell.tsx`) and `app/(site)/demos/page.tsx` + `app/(site)/page.tsx` comment: swap the string, touch nothing else. Fix the `globals.css` hit only if it is a rendered selector/content string — if it is a comment, rewrite the comment.

- [ ] **Step 5: Run tests, typecheck, lint**

Run: `npx vitest run && npx tsc --noEmit && npm run lint` → all green.

- [ ] **Step 6: Commit (only after the user approves committing)**

```bash
git add content/brand/company.ts components/Navbar.tsx components/Footer.tsx components/brand/SiteCompiler.tsx components/sites app/(site) test/brand-registries.test.ts test/brand-contact-links.test.ts test/brand-rebrand.test.ts
git commit -m "feat(brand): rebrand Website IN to Website Intelligence"
```

---

### Task 2: OrderBook rename, demoPath, contextual WhatsApp helper

**Files:**
- Modify: `content/brand/products.ts`
- Modify: `content/brand/links.ts`
- Modify: `test/brand-registries.test.ts`

**Interfaces:**
- Produces: `products[0].title === 'OrderBook'`, `products[0].demoPath === '/analytical-register'`; `whatsappHrefMessage(contact, message: string): string` in `links.ts` — consumed by Tasks 4/6/8 (enterprise-prefilled and demo-request CTAs).

- [ ] **Step 1: Write failing tests** — append to the `products registry` describe in `test/brand-registries.test.ts`:

```ts
it('features OrderBook with its live demo and the parent brand', () => {
  expect(products[0].title).toBe('OrderBook');
  expect(products[0].slug).toBe('order-book');
  expect(products[0].demoPath).toBe('/analytical-register');
});
```

And a new describe for the helper:

```ts
import { whatsappHrefMessage } from '@/content/brand/links';
describe('contextual WhatsApp links', () => {
  it('encodes a custom first message once', () => {
    const href = whatsappHrefMessage(company.contact, 'Discuss an enterprise project');
    expect(href).toContain('wa.me/918238889347');
    expect(href).toContain('Discuss%20an%20enterprise%20project');
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run test/brand-registries.test.ts`.

- [ ] **Step 3: Implement**

In `products.ts` change the first entry's `title: 'Order Book'` → `title: 'OrderBook'` and add `demoPath: '/analytical-register',` after `modules`. In `links.ts` refactor so `whatsappHref` delegates:

```ts
export function whatsappHrefMessage(contact: ContactChannels, message: string): string {
  return `https://wa.me/${fullNumber(contact.phone)}?text=${encodeURIComponent(message)}`;
}

export function whatsappHref(contact: ContactChannels): string {
  return whatsappHrefMessage(contact, contact.whatsappMessage);
}
```

- [ ] **Step 4: Verify** — `npx vitest run && npx tsc --noEmit`. The existing "never points a button at a route that is not built" test now resolves `/analytical-register` through the filesystem walker.

- [ ] **Step 5: Commit** — `git add content/brand/products.ts content/brand/links.ts test/brand-registries.test.ts && git commit -m "feat(brand): brand OrderBook and link it to the live register"`

---

### Task 3: IA registries (audiences, capabilities, industries, solutions, process, why-us) + Proof validator

**Files:**
- Create: `content/brand/proof.ts`
- Create: `content/brand/audiences.ts`
- Create: `content/brand/capabilities.ts`
- Create: `content/brand/industries.ts`
- Create: `content/brand/solutions.ts`
- Create: `content/brand/process.ts`
- Create: `content/brand/whyus.ts`
- Modify: `components/brand/ProofBand.tsx` (industries count fix)
- Test: Modify `test/brand-registries.test.ts`

**Interfaces:**
- Produces (exact shapes later tasks import):

```ts
// proof.ts
export type Proof =
  | { kind: 'site'; path: string }
  | { kind: 'product'; path: string }
  | { kind: 'case'; path: string };

// audiences.ts
export interface Audience {
  key: 'local' | 'enterprise';
  name: string;
  campaign: string;   // 'Grow Online.' | 'Build Smarter.'
  headline: string;
  pitch: string;
  path: string;
  cta: string;
}
export const audiences: Audience[];

// capabilities.ts
export interface Capability {
  slug: string; name: string; blurb: string; examples: string[];
  audience: 'local' | 'enterprise' | 'both';
}
export const capabilities: Capability[];

// industries.ts
export interface Industry {
  slug: string; name: string; blurb: string; deliverables: string[];
  proof: Proof | null;
}
export const industries: Industry[];
export function getIndustryBySlug(slug: string): Industry | undefined;

// solutions.ts
export interface Solution {
  slug: string; name: string; blurb: string; builds: string[]; proof: Proof;
}
export const solutions: Solution[];
export function getSolutionBySlug(slug: string): Solution | undefined;

// process.ts
export interface ProcessStep { key: string; name: string; detail: string }
export const processSteps: ProcessStep[];

// whyus.ts
export interface WhyPoint { title: string; detail: string }
export const whyPoints: WhyPoint[];
```

- [ ] **Step 1: Write failing registry tests** — append to `test/brand-registries.test.ts`:

```ts
import { capabilities } from '@/content/brand/capabilities';
import { industries } from '@/content/brand/industries';
import { solutions } from '@/content/brand/solutions';
import { audiences } from '@/content/brand/audiences';
import { processSteps } from '@/content/brand/process';
import { whyPoints } from '@/content/brand/whyus';
import type { Proof } from '@/content/brand/proof';

const allProofs: Proof[] = [
  ...industries.map((i) => i.proof).filter(Boolean) as Proof[],
  ...solutions.map((s) => s.proof),
];

describe('IA registries', () => {
  it('has exactly two audiences', () => {
    expect(audiences.map((a) => a.key)).toEqual(['local', 'enterprise']);
    expect(audiences.map((a) => a.campaign)).toEqual(['Grow Online.', 'Build Smarter.']);
  });

  it('has six capabilities and eight industries with unique slugs', () => {
    expect(capabilities).toHaveLength(6);
    expect(industries).toHaveLength(8);
    for (const list of [capabilities, industries, solutions]) {
      expect(new Set(list.map((e) => e.slug)).size).toBe(list.length);
    }
  });

  it('resolves every proof path to a real route', () => {
    for (const proof of allProofs) {
      expect(resolveRoute(proof.path), `${proof.kind} -> ${proof.path}`).not.toBeNull();
    }
  });

  it('keeps verticals without a delivered build unproven, not faked', () => {
    const unproven = industries.filter((i) => i.proof === null).map((i) => i.slug);
    expect(unproven.sort()).toEqual(
      ['b2b', 'clinics-and-healthcare', 'home-services', 'real-estate'].sort(),
    );
  });

  it('requires proof for every enterprise solution', () => {
    for (const solution of solutions) expect(solution.proof).toBeTruthy();
    expect(solutions.map((s) => s.slug)).toEqual([
      'custom-software', 'data-and-bi', 'ai-and-automation',
      'apis-and-integrations', 'cloud-and-modernisation',
    ]);
  });

  it('has four process steps and five why points', () => {
    expect(processSteps.map((p) => p.name)).toEqual(['Understand', 'Plan', 'Build', 'Improve']);
    expect(whyPoints).toHaveLength(5);
  });

  it('keeps city names and prices out of registry copy', () => {
    const text = [...capabilities, ...industries, ...solutions, ...audiences]
      .map((e) => JSON.stringify(e)).join(' ').toLowerCase();
    expect(text).not.toContain('pune');
    expect(text).not.toMatch(/₹|price[d]? from|starting at/);
  });
});
```

- [ ] **Step 2: Run to verify failure** (module-not-found counts as failure).

- [ ] **Step 3: Create the registries**

`proof.ts` exactly as the union above. `audiences.ts`:

```ts
import type { Audience } from './audiences'; // (define the interface in the file, same shape as above)
export const audiences: Audience[] = [
  {
    key: 'local',
    name: 'Local Business',
    campaign: 'Grow Online.',
    headline: 'A professional online presence that turns searches into customers.',
    pitch:
      'Get found, get understood, get contacted. Websites, digital menus and catalogues, enquiry and booking flows, and optional ongoing support for shops, clinics and service providers.',
    path: '/local-business',
    cta: 'Get Your Business Online',
  },
  {
    key: 'enterprise',
    name: 'Enterprise & Growing',
    campaign: 'Build Smarter.',
    headline: 'Software, data and AI systems that make your team more effective.',
    pitch:
      'Custom applications, business dashboards, data pipelines, automation and AI integrations — engineered around your business problem, not a template.',
    path: '/enterprise',
    cta: 'Discuss Your Project',
  },
];
```

`capabilities.ts` — six entries, copy condensed verbatim from brief §5 section 4: `websites` (Websites & Digital Presence), `digital-commerce`, `business-software`, `data-analytics`, `ai-automation`, `cloud-integrations`; `audience` values `local`, `both`, `both`, `enterprise`, `both`, `enterprise`. Each `examples` list is the brief's 4–5 bullet list, trimmed to shipped-honest wording (e.g. data-analytics keeps 'Sales and performance dashboards', 'Data integration and pipelines', 'Reporting automation'; drop nothing the brief lists since these describe offered work, not claims of past results).

`industries.ts` — eight entries from brief §5 section 5; `blurb` = the brief's one-liner; `deliverables` = 3–4 items from its "Possible services" list. Proof per spec §5 table: restaurants `{kind:'site',path:'/dream-cafe'}`, salons-and-spas `{kind:'site',path:'/hair-adore'}`, retail-and-boutiques `{kind:'product',path:'/analytical-register'}`, professional-services `{kind:'product',path:'/stock-screener'}`, the other four `null`.

`solutions.ts` — five entries per spec §5; `builds` from brief §7 capability paragraphs; proofs: custom-software and apis-and-integrations `{kind:'case',path:'/portfolio/jainil-patel/work/teamsync'}`, data-and-bi `{kind:'case',path:'/portfolio/jainil-patel/work/portfolio-advisor'}`, ai-and-automation `{kind:'case',path:'/portfolio/jainil-patel/work/enterprise-productivity-agents'}`, cloud-and-modernisation `{kind:'product',path:'/stock-screener'}`.

`process.ts` — Understand / Plan / Build / Improve with the brief's four detail sentences. `whyus.ts` — the brief's five points: 'One partner, multiple capabilities', 'A right-sized approach', 'Room to grow', 'Practical outcomes', 'Clear communication'.

- [ ] **Step 4: Fix ProofBand counting** — in `components/brand/ProofBand.tsx`, the stat that counts industries must import `industries` and use `industries.length` (spec §3 band 07). Read the file, find the stat currently derived from `websites.length` labelled like "industries", repoint it. If no such stat exists, skip and note it in the task report.

- [ ] **Step 5: Verify** — `npx vitest run && npx tsc --noEmit && npm run lint`.

- [ ] **Step 6: Commit** — `git add content/brand components/brand/ProofBand.tsx test/brand-registries.test.ts && git commit -m "feat(brand): add audience, capability, industry and solution registries"`

---

### Task 4: `/local-business`, `/enterprise`, `/about` pages + sitemap

**Files:**
- Create: `app/(site)/local-business/page.tsx`
- Create: `app/(site)/enterprise/page.tsx`
- Create: `app/(site)/about/page.tsx`
- Modify: `app/sitemap.ts`
- Test: Create `test/brand-ia.test.ts`

**Interfaces:**
- Consumes: `audiences`, `industries`, `solutions`, `processSteps`, `whyPoints`, `serviceSteps`, `whatsappHrefMessage`, `PageHeader`, `SectionIntro`, `ContactCta`, `GrowBand`, `ServicesJourney`, `WebsiteCard`, `resolveRoute`.
- Produces: routes `/local-business`, `/enterprise`, `/about` (verified by `resolveRoute`, used by nav in Task 9 and proof validators in Task 3 already green).

- [ ] **Step 1: Write failing IA tests** — `test/brand-ia.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { resolveRoute } from './helpers/resolve-route';
import { siteUrl } from '@/content/brand/site';

const PHASE1 = ['/', '/services', '/local-business', '/enterprise', '/about', '/contact', '/products', '/demos', '/store'];

describe('Phase 1 IA', () => {
  it('serves every phase-1 route', () => {
    for (const route of PHASE1) expect(resolveRoute(route), route).not.toBeNull();
  });

  it('lists every phase-1 route exactly once in the sitemap', () => {
    const urls = (sitemap() as { url: string }[]).map((e) => e.url);
    for (const route of PHASE1) {
      const count = urls.filter((u) => u === `${siteUrl}${route === '/' ? '/' : route}`).length;
      expect(count, route).toBe(1);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure** — route assertions fail until pages exist (file creation below satisfies `resolveRoute` — Next path groups are erased by the helper, so pages go in `app/(site)/`).

- [ ] **Step 3: Create the three pages**

`app/(site)/local-business/page.tsx` — structure (page file ~60 lines max, all copy from registries):

```tsx
<PageHeader index="02" label="local business" title="Grow Online.">
  {audiences[0].pitch + the brief's §6 line: 'Whether you run a café, salon, boutique, clinic,
  or local service, we can help you choose a digital solution that fits your business.'}
</PageHeader>
<ServicesJourney detailed />        {/* the four 'what you can start with' steps */}
<GrowBand />                        /* travels with the journey, unchanged */}
<IndustryTeaser />                  {/* new local component in this page file or components/brand/IndustryTeaser.tsx:
   maps `industries`, renders WebsiteCard where proof?.kind is site/product (look up the
   matching websites.ts entry by path), a flat gs-plane with the mono index where null.
   Cards are never links in Phase 1 (no industry pages exist). */}
FAQ section: h2 'Common questions' + <details> pairs for exactly these Q/A:
  Q: Will my website work on mobile phones? A: Every site we build is mobile-first — phones are where your customers are.
  Q: Can customers contact me through WhatsApp? A: Yes. Enquiry buttons land straight on your phone.
  Q: Can I update content or products myself? A: Where you need it — menus, offers and pages you edit without a developer are part of the automation step.
  Q: Can I add online bookings or orders later? A: Yes, that is the growth path: start with a site, add enquiries, then orders and analytics.
  Q: Who owns the website and its content? A: You do — domain, content and code are yours.
  (No maintenance-SLA, turnaround, or 'help with hosting' promises beyond what we actually do.)
<ContactCta /> with primary framing 'Get Your Business Online' (WhatsApp default message)
```

Metadata: `title: 'Local Business'`, description = audiences[0].pitch.

`app/(site)/enterprise/page.tsx`:

```tsx
<PageHeader index="04" label="enterprise & growing" title="Build better systems. Make smarter decisions.">
  {audiences[1].pitch}
</PageHeader>
Section id="capabilities": h2 'Enterprise capabilities' — map `solutions`:
  each block: gs-label mono index (01..05) + forest field (audience code),
  name (h3), blurb, `builds` as bullets, and proof link:
    kind 'case' → Link to proof.path, label 'See the build'
    kind 'product' → Link to proof.path, label 'Open the live app'
Section: h2 'How an engagement runs' — ol of the five steps:
  Discovery and requirements / Scope, architecture, and delivery plan / Prototype or implementation /
  Testing, launch, and handover / Optional ongoing support
ContactCta with secondary WhatsApp link 'Discuss Your Project' via
  whatsappHrefMessage(company.contact, 'Discuss an enterprise project with Website Intelligence')
```

Metadata: `title: 'Enterprise'`, description = audiences[1].pitch.

`app/(site)/about/page.tsx`:

```tsx
<PageHeader index="05" label="about" title="Practical digital solutions for businesses at every stage.">
  mission + vision copy from brief §1.2/1.3, plus the early-stage honesty line:
  'We are a young company. What we show here is real: every site, app and build on this
  page was designed and shipped by us — explore the work rather than take our word for it.'
</PageHeader>
h2 'What we believe' — dl of the five brand pillars (brief §1.5, condensed:
  Accessible by design / Useful technology / Built to grow / Intelligence with purpose /
  Long-term partnership)
h2 'How we work' — map `processSteps` (four flat planes, mono indices)
Links: 'See the work' → /demos, ContactCta 'Tell Us What You Need'
```

Metadata: `title: 'About'`, description derived from `company.pitch`.

- [ ] **Step 4: Extend `app/sitemap.ts`** — add `{ url: `${siteUrl}/local-business` }`, `{ url: `${siteUrl}/enterprise` }`, `{ url: `${siteUrl}/about` }` to the hand-written block.

- [ ] **Step 5: Verify** — `npx vitest run && npx tsc --noEmit && npm run lint`; then in the running `next dev`, load all three routes in a NEW browser tab at 1440px and 390px and screenshot; no hydration/SSR warnings in the terminal.

- [ ] **Step 6: Commit** — `git add "app/(site)" app/sitemap.ts test/brand-ia.test.ts components/brand && git commit -m "feat(brand): add local-business, enterprise and about pages"`

---

### Task 5: `/services` hub rework + `ServicesGrid`

**Files:**
- Create: `components/brand/ServicesGrid.tsx`
- Modify: `app/(site)/services/page.tsx`

**Interfaces:**
- Consumes: `capabilities`, `audiences`, `SectionIntro`, `Link`.
- Produces: `ServicesGrid({ withHeading = true }: { withHeading?: boolean })` — reused by the homepage in Task 7.

- [ ] **Step 1:** Replace `/services` body: `PageHeader` keeps index/label, title "The right technology for your next stage.", intro = brief §5 section 4 lead ('Choose a focused service or combine capabilities into a solution designed around your business.'). Then `<ServicesGrid />`, then an audience routing band: the two `audiences` as plain link rows (campaign + cta), then `ContactCta`. Delete the old `ServicesJourney detailed` block from this page (it now lives on `/local-business`); update the page `metadata.description` to the six-capability framing.

- [ ] **Step 2:** `ServicesGrid.tsx` — export the component; grid of six cards (`sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline`, cells `bg-canvas p-6` like the hero FACTS strip): mono index, `name` in `gs-display`, `blurb`, `examples` as a tight `ul` in `text-sm`, no per-card link (Phase 1 has no `/services/*` subpages — cards are `div`s, never fake links). Heading row via `SectionIntro index="03" label="services" title="Six capabilities, one partner."` when `withHeading`.

- [ ] **Step 3:** Verify — `npx vitest run && npx tsc --noEmit && npm run lint`; load `/services` on dev, 1440px + 390px.

- [ ] **Step 4:** Commit `feat(brand): rework the services hub onto six capabilities`.

---

### Task 6: Homepage path/industry/product/process/why components

**Files:**
- Create: `components/brand/AudiencePaths.tsx`
- Create: `components/brand/IndustryGrid.tsx`
- Create: `components/brand/ProductFeature.tsx`
- Create: `components/brand/ProcessBand.tsx`
- Create: `components/brand/WhyUs.tsx`

**Interfaces:**
- Consumes: `audiences`, `industries`, `products`, `websites` (for `WebsiteCard`'s `site` prop — find entry by `proof.path`), `processSteps`, `whyPoints`, `whatsappHrefMessage`.
- Produces: five no-prop components consumed by Task 8's homepage.

- [ ] **Step 1:** Write `test/brand-home.test.ts` pinning the data contracts the components render (no DOM tests exist in this repo — assert registries the way the bands consume them):

```ts
it('industry cards only link where a page exists', () => {
  // Phase 1: no industry routes are built, so IndustryGrid renders zero links.
  expect(industries.every((i) => i.proof === null || resolveRoute(i.proof.path) !== null)).toBe(true);
});
it('features OrderBook first with a live demo', () => {
  expect(products[0].demoPath).toBe('/analytical-register');
});
```

- [ ] **Step 2:** Implement:
  - `AudiencePaths`: `SectionIntro index="02" label="choose your path"` + two half-width cards from `audiences` — local card on `bg-plane`, enterprise on `bg-forest text-canvas`; each: campaign as `gs-display` headline, pitch, CTA `Link` to `a.path` with `a.cta` (the card's only link; `focus-ring`).
  - `IndustryGrid`: `SectionIntro index="05" label="industry solutions" title="Built around the way your industry works."` + intro sentence (brief §5 section 5 lead). Grid `sm:grid-cols-2 lg:grid-cols-4 gap-px`: entries with `proof` render `name`/`blurb`/`deliverables.slice(0,3)` + proof chip row (mono label `proof.kind === 'site' ? 'live build' : 'product'` — a `span`, not a link) and the screenshot is NOT embedded (grid density matters; screenshots live on `/demos`); `proof === null` renders the flat rotated `gs-plane` corner with the mono index, exactly the spec §7 rule. Cards are `div`s.
  - `ProductFeature`: full-bleed `gs-plane-b` band, eyebrow `A PRODUCT BY WEBSITE INTELLIGENCE` (`gs-label`), h2 `OrderBook by Website Intelligence` with display line "Know your orders. Understand your sales.", body = products[0].summary + `bullets` (shipped-only), `WebsiteCard site={websites.find(w => w.path === '/analytical-register')!}` labelled "Live demo — your data, not stock screenshots" (it IS a demo app; honest label off-`/store`), CTAs: **Explore OrderBook** → `/products`, **Request a Demo** → `whatsappHrefMessage(company.contact, 'Request an OrderBook demo')`.
  - `ProcessBand`: `SectionIntro index="07" label="how we work" title="A clear path from idea to impact."` + four flat planes with mono indices (reuse the hero's `gs-plane`/`gs-grid` grammar as static decoration): `processSteps.map` → `0N` + `name` (h3) + `detail`.
  - `WhyUs`: `SectionIntro index="08" label="why website intelligence"` (lowercase gs-label; caps come from CSS) + `whyPoints` as a `dl`, title h3 / detail p. No SLA/turnaround claims (brief §5 section 9 caveat respected — copy only).

- [ ] **Step 3:** Verify — `npx vitest run && npx tsc --noEmit && npm run lint`. (Components render only after Task 8; page-level browser check happens there.)

- [ ] **Step 4:** Commit `feat(brand): add homepage path, industry, product, process and why bands`.

---

### Task 7: Hero rewrite + homepage restructure

**Files:**
- Modify: `components/brand/Hero.tsx`
- Modify: `app/(site)/page.tsx`

**Interfaces:**
- Consumes: Task 3 registries + Task 6 components + existing `ClientMarquee`, `ProofBand`, `WorkStrip`, `ContactCta`, `SiteCompiler`.

- [ ] **Step 1: Hero copy.** `h1` → two caps lines `Technology for` / `Every Business.` (keep `gs-caps-rise` timings). Paragraph (brief verbatim): "From your first business website to intelligent software and AI-powered workflows, we help you build the digital tools your business needs to grow." Eyebrow label: `WEB / SOFTWARE / DATA / AI` (mono, `gs-label-hot` on `WEB`). Replace the `ContactRow` CTA block with the two routed CTAs:

```tsx
<div className="flex flex-wrap gap-3">
  <Link href="/local-business" className="focus-ring gs-btn bg-plane px-5 py-3 gs-display text-ink">
    {audiences[0].cta}
  </Link>
  <Link href="/enterprise" className="focus-ring gs-btn border border-ink px-5 py-3 gs-display text-ink">
    {audiences[1].cta === 'Discuss Your Project' ? 'Explore Enterprise Solutions' : audiences[1].cta}
  </Link>
</div>
<p className="gs-label mt-3 text-ink-3">Start with what you need today. Add more as your business grows.</p>
```

(If no `gs-btn` class exists in `globals.css`, style the two links with the same utility combo `ContactRow`'s primary button uses — read `ContactCta.tsx` and mirror it.) Keep planes, goo, `SiteCompiler`, FACTS. Update the hero's "manifesto" label to `01 / web · software · data · ai`.

- [ ] **Step 2: Homepage bands.** Rewrite `app/(site)/page.tsx` to the spec §3 order: `<Hero />`, `<AudiencePaths />`, `<ServicesGrid />`, `<IndustryGrid />`, `<ProductFeature />`, `<ProcessBand />`, `<ProofBand />`, `<ClientMarquee />`, `<WorkStrip />`, `<WhyUs />`, closing band. The closing band keeps the existing gs-plane markup but with brief §5 section 10 copy: h2 "Let's build what your business needs next.", p = brief's sentence, CTAs **Get Started** (→ `/contact`) and **Discuss an Enterprise Project** (`whatsappHrefMessage(..., 'Discuss an enterprise project with Website Intelligence')`). Delete `GrowBand`/`ServicesJourney` imports and their band from this file. Update the page comment about the title (it still references the old brand phrasing — Task 1 may have caught it; verify).

- [ ] **Step 3: Verify** — tests + tsc + lint; then browser pass on dev: full page 1440px and 390px screenshots, scroll through all 9 bands, both hero CTAs route correctly, reduced-motion emulation shows no broken layout.

- [ ] **Step 4:** Commit `feat(brand): rebuild the homepage on the Website Intelligence blueprint`.

---

### Task 8: Navigation, footer, enquiry framing on `/contact`

**Files:**
- Create: `content/brand/nav.ts`
- Modify: `components/Navbar.tsx`, `components/Footer.tsx`, `app/(site)/contact/page.tsx`
- Test: extend `test/brand-ia.test.ts`

**Interfaces:**
- Consumes: `audiences`, link helpers.
- Produces:

```ts
// content/brand/nav.ts
export const navLinks = [
  { href: '/local-business', label: 'Local Business' },
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/demos', label: 'Work' },
  { href: '/about', label: 'About' },
] as const;
export const ctaLink = { href: '/contact', label: 'Get Started' } as const;
export const footerLinks = [...navLinks entries..., { href: '/contact', label: 'Contact' }, { href: '/portfolio', label: 'Portfolio' }] — dedupe keep order: Services, Local Business, Enterprise, Products, Work, About, Contact, Portfolio;
```

- [ ] **Step 1: Failing IA test additions:**

```ts
it('nav points only at built routes with the agreed labels', () => {
  expect(navLinks.map((l) => l.href)).toEqual([
    '/local-business', '/enterprise', '/services', '/products', '/demos', '/about',
  ]);
  for (const l of navLinks) expect(resolveRoute(l.href), l.href).not.toBeNull();
  expect(ctaLink).toEqual({ href: '/contact', label: 'Get Started' });
});
```

- [ ] **Step 2:** Navbar consumes `navLinks`/`ctaLink` (replace the hardcoded `links` array); add the CTA as a filled button after the list (`bg-forest text-canvas` treatment; `focus-ring`); wordmark stays from Task 1. Footer's `pages` array → `footerLinks`; footer brand block keeps `company.tagline` (now "Technology for Every Business."). `/contact` gains the two-audience framing: two short rows above `ContactCta` — "Local business? Tell us the business…" and "Enterprise project? Send the problem you want solved…" — each with its own prefilled WhatsApp link via `whatsappHrefMessage` (default + enterprise message). No webform (static site).

- [ ] **Step 3: Verify** — full `npx vitest run && npx tsc --noEmit && npm run lint`; browser: nav active states on each new route, mobile 390px nav wrap + CTA reachable, footer links all resolve.

- [ ] **Step 4:** Commit `feat(brand): split navigation across the two audiences`.

---

### Task 9: Full-suite verification + regression sweep

- [ ] **Step 1:** `npx vitest run` (expect every suite green, incl. `brand-skin.test.ts` — its passing is the no-reskin proof), `npx tsc --noEmit`, `npm run lint` (pre-existing stock-screener warnings are tolerated; no new).
- [ ] **Step 2:** Browser sweep on the dev server (NEW tab): `/`, `/local-business`, `/enterprise`, `/about`, `/services`, `/products`, `/contact`, `/demos`, `/store`, `/portfolio` at 1440px; `/`, `/local-business`, `/enterprise` at 390px; reduced-motion emulation once on `/`. Client routes `/dream-cafe`, `/savour`, `/hair-adore`, `/stock-screener`, `/analytical-register` render unchanged.
- [ ] **Step 3:** grep audit: `grep -rn "Website IN\|WebsiteIn\|WebsiteIN" content components app` → zero hits; `grep -rni "pune" content components app/(site)` → zero in rendered strings (Savour venue data exempt).
- [ ] **Step 4:** Report results to the user with screenshots; ask about committing anything still held.

---

## Self-review notes (plan author)

- Spec coverage: §1 rename → T1/T2; §2 routes/nav/CTA table → T4/T7/T8; §3 bands → T6/T7; §4 hubs → T4/T5; §5 registries → T3; §6 components → T5/T6; §7 skin → global constraints; §8 metadata/sitemap → T4 + T1 (template auto); §9 failure modes → T3/T9 validators; §10 a11y → every component step; §11 tests → T1–T9. Navy reskin, industry pages, `/products/orderbook`: explicitly out of scope.
- Task 3's registry tests import Task-3 files — they are the red step; Task 4's `brand-ia.test.ts` fails first on missing routes; both orders hold.
- `ProductsGrid` renders "Open it live" once OrderBook's `demoPath` resolves (Task 2) — no component change needed there.
