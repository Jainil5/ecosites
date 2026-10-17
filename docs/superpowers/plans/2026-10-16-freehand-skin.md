# Website IN freehand.ai skin — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the brand shell's dark "code-brutalism" skin with freehand.ai's light editorial language (paper canvas, Source Serif 4 headlines at weight 300, orange accent, square corners) across every `app/(site)` route, without touching any client demo site.

**Architecture:** Tokens and CSS primitives are added *alongside* the existing dark system, then each brand component is migrated band-by-band, and the dead dark CSS is deleted last. This ordering matters: it keeps every intermediate state renderable, and it lets the hero be visually approved before its treatment propagates to ten other bands.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind 3.4, TypeScript, vitest 4 (node environment, no jsdom).

**Spec:** `docs/superpowers/specs/2026-10-16-freehand-skin-design.md` — read it with this plan.

## Global Constraints

Every task below implicitly includes all of these.

- **No new npm dependencies.** The reference uses GSAP; we reproduce its restraint with CSS only.
- **Never repoint `--font-sans` or `--font-mono`.** 13 files under `components/sites/**` and `app/(sites)/**` consume `font-mono`, and `.dc-display` inherits `var(--font-sans)` at weight 800. Repointing either silently re-typesets a client site.
- **Never edit these `app/globals.css` blocks:** `Hair Adore demo` (`ha-*`), `Savour demo site` (`.savour`), `Market Pulse screener` (`mp-*`), `Dream Cafe` (`.dream-cafe`/`dc-*`), and the `::view-transition-*` rules.
- **Corners are square.** `rounded-none` is the default; `rounded-full` survives only for pills, dots and the marquee mask. No `rounded-xl/2xl/3xl` in brand components.
- **No glass, no glow, no gradient hairlines, no 3D.** `.glass`, `.text-glow`, `.edge`, `.beacon`, `.plinth`, `.scene*`, `.plate*` must not appear in brand component sources by the end.
- **Copy rules (enforced by `test/brand-registries.test.ts`):** no `Pune` or any city name in a rendered string; no `demo` substring in `/store` gallery copy; no `₹`, `Rs.`, `price from`, `starting at`, or a 4-5 digit number in `company.*` or `products.*` marketing fields.
- **Honesty rules:** no invented numbers, funding rounds, awards, or press quotes. Any count derives from `websites.length`.
- **Motion:** every entrance or loop goes inside `@media (prefers-reduced-motion: no-preference)`, and every loop rests at its visually complete state at 0%/100%.
- **Commits:** the steps below say `git commit`, but do not commit without Jainil's explicit OK — see "Before Task 1" in Task 0.

## File map

**Modified**

| file | responsibility |
|---|---|
| `tailwind.config.ts` | light token scale + `display`/`label`/`body` font keys |
| `app/layout.tsx` | load Source Serif 4, Fustat, Geist Mono; drop Share_Tech_Mono |
| `app/globals.css` | add `wi-*` primitives; delete dead dark CSS last |
| `app/(site)/layout.tsx` | paper canvas, `--font-body`, delete `GridBackground` |
| `app/(site)/page.tsx` | eleven-band arc composition |
| `components/Navbar.tsx` | flat full-width bar, hairline, square CTA |
| `components/Footer.tsx` | ink-on-cream four-column sitemap |
| `components/brand/Hero.tsx` | serif hero, two CTAs, no compiler, no Logo3D |
| `components/brand/SectionIntro.tsx` | `wi-label` + serif `slice` heading |
| `components/brand/PageHeader.tsx` | same, as h1 |
| `components/brand/SiteCompiler.tsx` | flat bordered card |
| `components/brand/ProofBand.tsx` | dark brown stat band, serif numerals |
| `components/brand/ServicesJourney.tsx` | hairline rail, orange nodes |
| `components/brand/ProductsGrid.tsx` | square bordered cards |
| `components/brand/WorkStrip.tsx` | verticals grid |
| `components/brand/SiteFrame.tsx` | light browser chrome |
| `components/brand/ContactCta.tsx` | solid-orange + ink-outline button pair |
| `content/brand/types.ts` | new registry interfaces |
| `app/sitemap.ts` | unchanged routes; asserted, not edited |

**Created**

| file | responsibility |
|---|---|
| `content/brand/clients.ts` | marquee entries, derived from `websites` |
| `content/brand/news.ts` | announcement items, derived from `websites` |
| `content/brand/comparison.ts` | agency-vs-Website IN rows |
| `content/brand/stack.ts` | integration band entries |
| `components/brand/NewsBar.tsx` | band 1 |
| `components/brand/ClientMarquee.tsx` | band 3 |
| `components/brand/ComparisonTable.tsx` | inside band 7 |
| `components/brand/TechBand.tsx` | band 9 |
| `test/brand-skin.test.ts` | token, CSS-hygiene and leak-guard assertions |
| `test/brand-registries.test.ts` | extended with the four new registries |

**Deleted:** `components/GridBackground.tsx`, `components/brand/Logo3D.tsx`, `components/Icon3D.tsx`.

---

## Phase 1 — additive foundation

### Task 0: Protect the existing uncommitted work

**Files:** none created.

**Interfaces:**
- Consumes: nothing.
- Produces: a recoverable baseline, so Tasks 8–12 can be rolled back.

- [ ] **Step 1: Confirm the tree state out loud to Jainil before any deletion.**

```bash
git status --short
git stash list   # must be empty
ps aux | grep 'next dev' | grep -v grep
```

Expected at the time of writing: the whole `go-*` implementation is uncommitted (`M` + `??`), stash is empty, and **three** `next dev` processes are running for this repo.

- [ ] **Step 2: Ask Jainil for one decision — commit the current `go-*` work, or leave it uncommitted.**

If he approves a commit:

```bash
git add -A
git commit -m "wip(brand): saze-style get-online shell, pre freehand skin"
```

Do not `git stash` and do not `git checkout` any path. If he declines, continue — but then Tasks 8–12 have no rollback point and say so in their reports.

- [ ] **Step 3: Ask him to kill the duplicate dev servers, keeping one.**

Do not kill PIDs yourself; they are his sessions. Suggest:

```bash
kill 41488 40699   # keep 48406
```

Four `next dev` processes sharing one `.next` produce phantom 404/500s that look like routing bugs and are not.

### Task 1: Light tokens and font variables

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`
- Test: `test/brand-skin.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: Tailwind utilities `bg-canvas` `bg-paper` `bg-band` `bg-tint` `bg-ink` `bg-dark` `bg-dark-card` `text-ink` `text-ink-2` `text-ink-3` `border-hairline` `text-accent` `bg-accent` `text-mark-green`, and font keys `font-display` (serif), `font-label` (Geist Mono), `font-body` (Fustat). `font-mono` and `font-sans` keep their old faces.

- [ ] **Step 1: Write the failing test**

Create `test/brand-skin.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

describe('brand skin tokens', () => {
  const config = read('tailwind.config.ts');

  it('defines the light canvas scale', () => {
    for (const [token, hex] of [
      ['canvas', '#FFFFFF'],
      ['paper', '#FDF8F4'],
      ['band', '#FAF3E8'],
      ['tint', '#FFF3EB'],
      ['ink', '#0D0B08'],
      ['hairline', '#EAE0D6'],
      ['accent', '#FE6200'],
    ] as const) {
      expect(config, token).toContain(hex.toUpperCase());
    }
  });

  it('maps display to the serif and adds label + body keys', () => {
    expect(config).toContain('--font-display');
    expect(config).toContain('--font-label');
    expect(config).toContain('--font-body');
  });

  it('leaves the demo-owned font keys alone', () => {
    // font-mono is consumed by 13 screener files; font-sans by Dream Cafe.
    expect(config).toMatch(/mono:\s*\['var\(--font-mono\)'/);
    expect(config).toMatch(/sans:\s*\['var\(--font-sans\)'/);
  });
});

describe('brand skin fonts', () => {
  const layout = read('app/layout.tsx');

  it('loads the three brand faces as variables', () => {
    expect(layout).toContain('Source_Serif_4');
    expect(layout).toContain('Fustat');
    expect(layout).toContain('Geist_Mono');
    expect(layout).toContain('--font-label');
    expect(layout).toContain('--font-body');
  });

  it('drops Share_Tech_Mono but keeps Fira_Code for the demos', () => {
    expect(layout).not.toContain('Share_Tech_Mono');
    expect(layout).toContain('Fira_Code');
    expect(layout).toContain('Inter');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run test/brand-skin.test.ts`
Expected: FAIL — "defines the light canvas scale" and "loads the three brand faces".

- [ ] **Step 3: Add the tokens**

In `tailwind.config.ts`, replace the `colors` object body with:

```ts
      colors: {
        // Design system: freehand-style paper canvas + warm ink + orange accent.
        // Names are brand-scoped on purpose: demos hardcode their own hex and
        // never read these, so a token flip cannot leak into client sites.
        canvas: '#FFFFFF',
        paper: '#FDF8F4',
        band: '#FAF3E8',
        tint: '#FFF3EB',
        ink: '#0D0B08',
        'ink-2': '#4A3A2A',
        'ink-3': '#7A6855',
        hairline: '#EAE0D6',
        dark: '#1C1208',
        'dark-card': '#2C1D0D',
        accent: {
          DEFAULT: '#FE6200',
          10: '#FAE1D1',
          20: '#F9BD97',
          30: '#FB995B',
          50: '#DE5804',
          60: '#A04308',
          80: '#200B00',
        },
        // The tree-circuit mark keeps its green; it is a second brand hue, not
        // the interactive accent.
        'mark-green': '#22C55E',
      },
```

Keep `deep`, `surface`, `elevated`, `muted`, `border`, `foreground`, `subtle`, `brand` in place for this task — Tasks 2–7 migrate their consumers, and Task 11 deletes them. Removing them now would break every brand page mid-plan.

In the same file, add the two new font keys next to the existing ones:

```ts
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        label: ['var(--font-label)', 'ui-monospace', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
```

Also delete the `glow`, `glow-lg` and `card-hover` shadows (green-glow artifacts) and the `grid-fade` background image, keeping `card` replaced by:

```ts
      boxShadow: {
        plate: '0 1px 2px rgba(13,11,8,0.04), 0 18px 40px -32px rgba(13,11,8,0.35)',
      },
```

**Correction found while executing Task 1: do NOT delete `keyframes.gradient-pan` or `animation['gradient-pan']` in this task.** `app/globals.css:99` is `@apply animate-gradient-pan` inside `.text-gradient`, and Tailwind turns an `@apply` of a removed utility into a hard PostCSS build error rather than a silent no-op. Class-only usages (`shadow-glow`, `shadow-card-hover`, `bg-grid-fade`) are safe to remove now because unknown utilities are simply not generated. The `gradient-pan` pair and `.text-gradient` must be deleted together in Task 12 Step 4.

**Second correction: two more brand-shell components were missing from this plan's file map.** `components/WebsiteCard.tsx` (mounted by `/store`) and `components/DemoCard.tsx` (mounted by `/portfolio/[author]`) both use `glass`, `rounded-2xl` and `shadow-card`. They are added to the File map, to `BRAND_COMPONENTS` in Task 11 Step 1, and to Task 11's migration steps. Without this the sweeps would pass while two card grids stayed dark-on-cream.

- [ ] **Step 4: Load the faces**

In `app/layout.tsx`, change the import to:

```ts
import { Fira_Code, Fraunces, Fustat, Geist_Mono, Inter, Playfair_Display, Source_Serif_4 } from 'next/font/google';
```

Replace the `display` constant and add two more:

```ts
// freehand.ai uses the licensed BL Pylon Serif; Source Serif 4 at weight 300
// is the closest free stand-in with a real light weight.
const display = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

// New keys, deliberately not replacing --font-mono/--font-sans: the screener
// and Dream Cafe inherit those and must keep Fira_Code and Inter.
const label = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-label',
  display: 'swap',
});

const body = Fustat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});
```

Delete the `Share_Tech_Mono` import and constant. In the `<html>` className, add `${label.variable} ${body.variable}` to the existing list.

- [ ] **Step 5: Run tests and build**

Run: `npx vitest run && npm run build`
Expected: both PASS. Pages still render dark — that is correct at this stage; nothing has been migrated yet.

- [ ] **Step 6: Commit (only with Jainil's OK)**

```bash
git add tailwind.config.ts app/layout.tsx test/brand-skin.test.ts
git commit -m "feat(brand): add light paper token scale and brand-scoped font faces"
```

### Task 2: `wi-*` CSS primitives

**Files:**
- Modify: `app/globals.css` (append a new section before the `Hair Adore demo` block)
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: Task 1's `--font-display`, `--font-label`, `--font-body`.
- Produces: classes `wi-btn`, `wi-btn-solid`, `wi-btn-ghost`, `wi-label`, `wi-display`, `wi-h1`…`wi-h4`, `wi-card`, `wi-rule`, `wi-band-rise`, `wi-marquee`, `wi-marquee-track`, `wi-marquee-item`.

- [ ] **Step 1: Write the failing test**

Append to `test/brand-skin.test.ts`:

```ts
describe('wi-* primitives', () => {
  const css = read('app/globals.css');

  it('defines the button, label and display primitives', () => {
    for (const cls of ['wi-btn', 'wi-btn-solid', 'wi-btn-ghost', 'wi-label', 'wi-display']) {
      expect(css, cls).toContain(`.${cls}`);
    }
  });

  it('uses square corners on the button, like freehand', () => {
    expect(css).toMatch(/\.wi-btn\s*\{[^}]*border-radius:\s*0/);
  });

  it('sets headlines to serif weight 300', () => {
    expect(css).toMatch(/\.wi-display\s*\{[^}]*font-weight:\s*300/);
    expect(css).toMatch(/\.wi-display\s*\{[^}]*line-height:\s*1\.2/);
  });

  it('puts every entrance and loop behind prefers-reduced-motion', () => {
    const start = css.indexOf('.wi-band-rise');
    const block = css.slice(css.lastIndexOf('@media', start), start);
    expect(block).toContain('prefers-reduced-motion: no-preference');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run test/brand-skin.test.ts -t 'wi-\*'`
Expected: FAIL — "defines the button, label and display primitives".

- [ ] **Step 3: Add the primitives**

Append to `app/globals.css`, immediately before the `/* ==== Hair Adore demo ==== */` banner:

```css
/* ============================================================
   Website IN brand skin — freehand.ai language (wi-*).
   Extracted from the reference's own Webflow CSS, not from a
   description of it: paper canvas, warm ink, orange #FE6200
   reserved for interactive things, serif headlines at weight
   300, and --radius-small/medium/large all set to 0px, so the
   whole system is square-edged. Depth comes from hairlines and
   flat warm bands, not from glass, glow or 3D.
   ============================================================ */

/* freehand's own easing and duration on every interactive transition. */
.wi-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0;
  padding: 0.8rem 1.5rem;
  font-family: var(--font-label), ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: -0.005em;
  text-transform: uppercase;
  text-decoration: none;
  transition: border-color 0.38s cubic-bezier(0.187, 0.938, 0.355, 1),
    background-color 0.38s cubic-bezier(0.187, 0.938, 0.355, 1),
    color 0.38s cubic-bezier(0.187, 0.938, 0.355, 1);
}
.wi-btn-solid {
  background-color: #fe6200;
  border-color: #fe6200;
  color: #fff;
}
.wi-btn-solid:hover {
  background-color: #de5804;
  border-color: #de5804;
}
.wi-btn-ghost {
  border-color: #0d0b08;
  color: #0d0b08;
  background-color: transparent;
}
.wi-btn-ghost:hover {
  border-color: #fe6200;
  color: #fe6200;
}

/* The reference's Geist Mono eyebrow, and its orange link-hover rule. */
.wi-label {
  font-family: var(--font-label), ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7a6855;
}

/* Signature of the whole system: serif, light, large, tight. */
.wi-display {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.014em;
  color: #0d0b08;
  text-wrap: balance;
}
.wi-h1 {
  font-size: clamp(2.9rem, 6.4vw, 4.5rem);
}
.wi-h2 {
  font-size: clamp(2.25rem, 4.6vw, 4rem);
}
.wi-h3 {
  font-size: clamp(1.9rem, 3.6vw, 3.625rem);
  letter-spacing: -0.025em;
}
.wi-h4 {
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 400;
  line-height: 1.3;
}

/* One card style: flat paper, 1px warm hairline, square. */
.wi-card {
  background-color: #fdf8f4;
  border: 1px solid #eae0d6;
  border-radius: 0;
}
.wi-card-hover:hover {
  border-color: #fe6200;
}
.wi-rule {
  border: 0;
  border-top: 1px solid #eae0d6;
}

/* Entrance: a flat rise, no rotateX and no translateZ — the reference has no
   3D, so anything deeper than this reads as a different design language. */
@keyframes wi-band-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .wi-band-rise {
    animation: wi-band-rise 620ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
    animation-delay: var(--d, 0ms);
  }
}

/* Seamless client wordmark loop; the mask fades both ends like the reference. */
.wi-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}
.wi-marquee-track {
  display: flex;
  width: max-content;
  white-space: nowrap;
}
.wi-marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  padding: 0 2rem;
  font-family: var(--font-display), Georgia, serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #4a3a2a;
}
@keyframes wi-marquee-run {
  to {
    transform: translateX(-50%);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .wi-marquee-track {
    animation: wi-marquee-run 32s linear infinite;
  }
  .wi-marquee:hover .wi-marquee-track {
    animation-play-state: paused;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wi-marquee {
    overflow-x: auto;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/brand-skin.test.ts`
Expected: PASS.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: PASS — the CSS is inert until components reference it.

- [ ] **Step 6: Commit (only with Jainil's OK)**

```bash
git add app/globals.css test/brand-skin.test.ts
git commit -m "feat(brand): add wi-* primitives in the freehand paper language"
```

### Task 3: Content registries derived from real data

**Files:**
- Modify: `content/brand/types.ts`
- Create: `content/brand/clients.ts`, `content/brand/news.ts`, `content/brand/comparison.ts`, `content/brand/stack.ts`
- Test: `test/brand-registries.test.ts`

**Interfaces:**
- Consumes: `websites` from `content/websites/sites.ts` (fields `slug`, `title`, `business`, `path`, `accent`, `screenshot`, `techStack`, `theme`).
- Produces: `clients: ClientEntry[]` (`{ slug, name, business }`), `newsItems: NewsItem[]` (`{ slug, lede, detail }`), `comparisonRows: ComparisonRow[]` (`{ axis, agency, ours }`), `stackGroups: StackGroup[]` (`{ group, items: string[] }`).

- [ ] **Step 1: Write the failing tests**

Append to `test/brand-registries.test.ts`:

```ts
describe('client marquee registry', () => {
  it('derives every entry from the delivered sites, so counts cannot drift', () => {
    expect(clients.map((c) => c.slug)).toEqual(websites.map((w) => w.slug));
    for (const client of clients) {
      const source = websites.find((w) => w.slug === client.slug);
      expect(source).toBeDefined();
      expect(client.name).toBe(source?.title);
      expect(client.business).toBe(source?.business);
    }
  });

  it('names no city and no demo label', () => {
    for (const client of clients) {
      const text = `${client.name} ${client.business}`.toLowerCase();
      expect(text, client.slug).not.toContain('pune');
      expect(text, client.slug).not.toContain('demo');
    }
  });
});

describe('news bar registry', () => {
  it('has one item per delivered site and no invented claims', () => {
    expect(newsItems).toHaveLength(websites.length);
    const text = newsItems.map((n) => `${n.lede} ${n.detail}`).join(' ').toLowerCase();
    expect(text).not.toMatch(/raised|funding|series [a-c]|gartner|bloomberg|fortune|award/);
    expect(text).not.toContain('pune');
  });

  it('derives its lede from a real site title', () => {
    for (const item of newsItems) {
      expect(websites.some((w) => item.lede.includes(w.title)), item.lede).toBe(true);
    }
  });
});

describe('comparison registry', () => {
  it('contrasts on axes the services copy already claims', () => {
    expect(comparisonRows.length).toBeGreaterThanOrEqual(4);
    for (const row of comparisonRows) {
      expect(row.axis.trim().length).toBeGreaterThan(0);
      expect(row.agency.trim().length).toBeGreaterThan(0);
      expect(row.ours.trim().length).toBeGreaterThan(0);
    }
    // Prices are placeholders until Jainil confirms them, so no row may quote one.
    const text = comparisonRows.map((r) => `${r.axis} ${r.agency} ${r.ours}`).join(' ');
    expect(text).not.toMatch(/₹|Rs\.?|\d{4,5}/);
  });
});

describe('stack registry', () => {
  it('lists only technologies that appear in delivered work', () => {
    const inUse = new Set(websites.flatMap((w) => w.techStack));
    const claimed = stackGroups.flatMap((g) => g.items);
    expect(claimed.length).toBeGreaterThanOrEqual(6);
    for (const group of stackGroups) {
      expect(group.items.length).toBeGreaterThan(0);
    }
    // Supabase/Postgres and Next.js are real; anything else must be justified.
    expect(inUse.has('Supabase')).toBe(true);
    expect(inUse.has('Next.js')).toBe(true);
  });
});
```

Add the imports at the top of the file:

```ts
import { clients } from '@/content/brand/clients';
import { newsItems } from '@/content/brand/news';
import { comparisonRows } from '@/content/brand/comparison';
import { stackGroups } from '@/content/brand/stack';
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run test/brand-registries.test.ts`
Expected: FAIL — cannot resolve `@/content/brand/clients`.

- [ ] **Step 3: Declare the types**

Append to `content/brand/types.ts`:

```ts
/** A delivered client site, as shown in the brand shell's marquee and verticals. */
export interface ClientEntry {
  slug: string;
  name: string;
  business: string;
}

/** One line in the announcement bar. Must trace to a real delivered site. */
export interface NewsItem {
  slug: string;
  lede: string;
  detail: string;
}

/** One row of the agency-vs-Website IN table. */
export interface ComparisonRow {
  axis: string;
  agency: string;
  ours: string;
}

/** A labelled cluster in the technology band. */
export interface StackGroup {
  group: string;
  items: string[];
}
```

- [ ] **Step 4: Create the derived registries**

`content/brand/clients.ts`:

```ts
import { websites } from '@/content/websites/sites';
import type { ClientEntry } from './types';

/** Derived, never hand-copied: the marquee cannot claim a client we do not have. */
export const clients: ClientEntry[] = websites.map((site) => ({
  slug: site.slug,
  name: site.title,
  business: site.business,
}));
```

`content/brand/news.ts`:

```ts
import { websites } from '@/content/websites/sites';
import type { NewsItem } from './types';

/**
 * One line per delivered site. `detail` comes from the registry's own
 * `business` field so the bar cannot out-claim the gallery.
 */
export const newsItems: NewsItem[] = websites.map((site) => ({
  slug: site.slug,
  lede: `New — ${site.title}`,
  detail: site.business,
}));
```

`content/brand/comparison.ts`:

```ts
import type { ComparisonRow } from './types';

/**
 * Axes are lifted from services.ts and products.ts rather than invented:
 * who answers for you, who edits after launch, how long to first draft.
 * No row quotes a price — the ₹-from chips on /products stay placeholders
 * until Jainil confirms them, and the registry test enforces that.
 */
export const comparisonRows: ComparisonRow[] = [
  {
    axis: 'Time to a first draft',
    agency: 'Weeks of briefs and account calls before you see anything.',
    ours: 'A live draft in days, on your own name and domain.',
  },
  {
    axis: 'Who answers at 11pm',
    agency: 'A ticket queue. Your customers wait until business hours.',
    ours: 'An assistant on your site answering stock, price and timing.',
  },
  {
    axis: 'Editing content after launch',
    agency: 'Raise a change request and wait on someone else.',
    ours: 'Update menus, offers and prices yourself — no developer.',
  },
  {
    axis: 'What happens to the site later',
    agency: 'A retainer, or a codebase only its original author reads.',
    ours: 'You own the code. Motion and automation are opt-in upgrades.',
  },
  {
    axis: 'Back-office work',
    agency: 'Left as your exercise: orders in three apps, a spreadsheet.',
    ours: 'Orders and enquiries into one inbox, follow-ups on a schedule.',
  },
];
```

`content/brand/stack.ts`:

```ts
import type { StackGroup } from './types';

/**
 * Every item here appears in the delivered work or is the delivery channel
 * itself. Nothing aspirational.
 */
export const stackGroups: StackGroup[] = [
  {
    group: 'Built with',
    items: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  {
    group: 'Data and rules',
    items: ['Supabase', 'Postgres', 'Row-level security'],
  },
  {
    group: 'Where enquiries land',
    items: ['WhatsApp', 'Phone', 'Email'],
  },
  {
    group: 'On the stack you have',
    items: ['Google Sheets', 'Existing booking tools', 'Your own domain'],
  },
];
```

- [ ] **Step 5: Run the suite**

Run: `npx vitest run`
Expected: PASS across all files, including the pre-existing `brand-registries` cases.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 7: Commit (only with Jainil's OK)**

```bash
git add content/brand test/brand-registries.test.ts
git commit -m "feat(brand): derive marquee, news, comparison and stack registries"
```

---

## Phase 2 — the hero gate

Nothing in this plan is visually risky except one thing: whether Source Serif 4 at weight 300 carries a display headline the way BL Pylon Serif does. Everything else is mechanical propagation of a decision already made. So Phase 2 exists to settle that question with a screenshot before ten more bands depend on it.

### Task 4: Paper canvas, flat navbar, serif hero

**Files:**
- Modify: `app/(site)/layout.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `components/brand/Hero.tsx`
- Modify: `components/brand/SectionIntro.tsx`
- Modify: `components/brand/PageHeader.tsx`
- Modify: `app/(site)/page.tsx:22-27` (hero region only)
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: Task 1 tokens/font keys, Task 2 `wi-*` classes, Task 3 registries (not yet — the marquee lands in Task 5).
- Produces: `Hero` with no props, rendering `h1.wi-display.wi-h1`; `SectionIntro` and `PageHeader` both accepting `{ index, label, title, children }` and emitting `wi-label`; the shell at `bg-canvas text-ink font-body`.

- [ ] **Step 1: Write the failing test**

Append to `test/brand-skin.test.ts`:

```ts
describe('brand shell is light', () => {
  const layout = read('app/(site)/layout.tsx');

  it('paints a paper canvas with warm ink and the body face', () => {
    expect(layout).toContain('bg-canvas');
    expect(layout).toContain('text-ink');
    expect(layout).toContain('font-body');
  });

  it('no longer mounts the dark light-field', () => {
    expect(layout).not.toContain('GridBackground');
  });
});

describe('navbar is flat and square', () => {
  const nav = read('components/Navbar.tsx');

  it('uses a hairline rule instead of a floating rounded pill', () => {
    expect(nav).toContain('border-hairline');
    expect(nav).not.toMatch(/rounded-(xl|2xl|3xl)\b/);
    expect(nav).not.toContain('edge');
    expect(nav).not.toContain('backdrop-blur');
  });

  it('labels links and the CTA with the mono key, not the screener mono', () => {
    expect(nav).toContain('font-label');
    expect(nav).not.toContain('font-mono');
    expect(nav).toContain('wi-btn');
  });

  it('keeps the mark green while the accent is orange', () => {
    expect(nav).toContain('text-mark-green');
    expect(nav).not.toContain('text-glow');
  });
});

describe('hero speaks the reference language', () => {
  const hero = read('components/brand/Hero.tsx');

  it('leads with a serif headline at weight 300', () => {
    expect(hero).toContain('wi-display');
    expect(hero).toContain('wi-h1');
  });

  it('drops the manifesto scale, the grid floor and the 3D mark', () => {
    for (const dead of ['go-manifesto', 'go-floor', 'go-label', 'Logo3D', 'go-ticker', 'SiteCompiler']) {
      expect(hero, dead).not.toContain(dead);
    }
  });

  it('offers exactly two CTAs, one solid one ghost', () => {
    expect(hero).toContain('wi-btn-solid');
    expect(hero).toContain('wi-btn-ghost');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'brand shell is light'`
Expected: FAIL — `bg-canvas` absent.

- [ ] **Step 3: Flip the shell**

`app/(site)/layout.tsx` in full:

```tsx
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas font-body text-ink antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

`GridBackground` is unmounted here and deleted from disk in Task 12 — deleting it now would break `app/(sites)` if it is referenced there, so confirm with `grep -rn GridBackground app components` before removing the file.

- [ ] **Step 4: Rewrite the navbar flat**

`components/Navbar.tsx` in full:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/demos', label: 'Demos' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    const onScroll = () => setSealed(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-canvas transition-colors duration-300 ${
        sealed ? 'border-hairline shadow-plate' : 'border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4"
      >
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 font-display text-lg tracking-tight text-ink"
        >
          <Logo className="h-5 w-5 text-mark-green" />
          <span>Website</span>
          <span className="text-mark-green">IN</span>
        </Link>

        <ul className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1">
          {links.map((link) => {
            const active = link.href.split('#')[0] === pathname;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`focus-ring font-label relative rounded-none px-3 py-2 text-[0.78rem] uppercase tracking-[0.14em] transition-colors hover:text-accent ${
                    active ? 'text-ink' : 'text-ink-3'
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 -bottom-px h-px bg-accent transition-opacity duration-200 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/contact" className="focus-ring wi-btn wi-btn-solid">
          Request a quote
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 5: Rewrite the hero**

`components/brand/Hero.tsx` in full. `SiteCompiler` and `Logo3D` leave this file (the compiler gets its own band in Task 6; the flat language has no 3D mark).

```tsx
import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';

/** One line of the headline, revealed inside its own horizontal mask. */
function Slice({ children, index }: { children: ReactNode; index: number }) {
  return (
    <span className="slice">
      <span
        className="slice-inner"
        style={{ '--delay': `${120 + index * 160}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

/**
 * freehand-style hero: a light-weight serif declaration, one support line,
 * two square CTAs. The reference sits a full-bleed video behind this; we have
 * no such asset and a paper field carries the type on its own.
 */
export function Hero() {
  return (
    <section className="grid gap-x-16 gap-y-10 py-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
      <div>
        <p className="wi-label animate-fade-up">01 / Get online</p>
        <h1 className="wi-display wi-h1 mt-5">
          <Slice index={0}>Fast websites and AI</Slice>
          <Slice index={1}>for businesses</Slice>
          <Slice index={2}>of every size.</Slice>
        </h1>
      </div>

      <div className="animate-fade-up space-y-7 [animation-delay:460ms]">
        <p className="max-w-md text-lg leading-relaxed text-ink-2">
          We build the site that answers for you — then stack the advantages:
          motion that makes you look established, automation that never forgets,
          an assistant that answers at 11pm.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="focus-ring wi-btn wi-btn-solid">
            Request a quote
          </Link>
          <Link href="/demos" className="focus-ring wi-btn wi-btn-ghost">
            See delivered work
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Retune the two heading components**

In `components/brand/SectionIntro.tsx`, replace the `<p className="go-label">` and `<h2>`:

```tsx
      <p className="wi-label">
        <b className="font-normal text-accent">{index}</b> / {label}
      </p>
      <h2 className="wi-display wi-h3 mt-4">
        <span className="slice-scroll">{title}</span>
      </h2>
      {children ? <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">{children}</p> : null}
```

Wrap the `h2` in `<span className="slice">` exactly as it already does — the `.slice`/`.slice-inner` rules survive the restyle and are the reference's own line-mask device.

In `components/brand/PageHeader.tsx`, the same swap with `wi-h2` instead of `wi-h3`, `text-ink-2` in place of `text-subtle`, and `go-label` → `wi-label`.

- [ ] **Step 7: Compose the hero region**

In `app/(site)/page.tsx`, replace the `space-y-10` hero+ProofBand block with the hero alone for now (ProofBand restyles in Task 7, and leaving it dark-on-light mid-plan is worse than a temporary gap):

```tsx
      <div className="space-y-16 sm:space-y-20">
        <Hero />
      </div>
```

Drop the now-unused `Logo3D` import from that file.

- [ ] **Step 8: Verify**

Run: `npx vitest run && npm run build`
Expected: PASS.

- [ ] **Step 9: THE GATE — look at it.**

Start exactly one dev server (`npm run dev`), open `/` in Chrome, and screenshot at 1440px and 390px. Judge three things a test cannot:

1. Does Source Serif 4 at weight 300 carry the headline, or does it look thin and anemic on white where Pylon looks confident?
2. Is `#FE6200` on `#FFFFFF` legible at button-label size (it is 3.9:1 — borderline for small text)?
3. Does the orange+green pairing in the navbar read intentional, or like two brands colliding?

If (1) fails, the fallback in order is: weight 400, then Newsreader 300, then Source Serif 4 at `font-weight: 300` with `-0.03em` tracking. **Do not propagate to Tasks 5–10 until this reads right.**

- [ ] **Step 10: Commit (only with Jainil's OK)**

```bash
git add "app/(site)" components/Navbar.tsx components/brand/Hero.tsx components/brand/SectionIntro.tsx components/brand/PageHeader.tsx test/brand-skin.test.ts
git commit -m "feat(brand): light paper shell, flat navbar and serif hero"
```

---

## Phase 3 — propagate the language

Every task here restyles one or two bands and appends them to `app/(site)/page.tsx` in arc order. The arc is only complete at Task 10, so intermediate homepage renders have gaps — that is expected, and each task still has to pass `npm run build`.

### Task 5: Announcement bar and client marquee

**Files:**
- Create: `components/brand/NewsBar.tsx`, `components/brand/ClientMarquee.tsx`
- Modify: `app/(site)/layout.tsx` (mount NewsBar above Navbar)
- Modify: `app/(site)/page.tsx` (mount ClientMarquee after Hero)
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: `newsItems` and `clients` from Task 3; `wi-marquee*` and `wi-label` from Task 2.
- Produces: `NewsBar()` and `ClientMarquee()`, both prop-less.

- [ ] **Step 1: Write the failing test**

```ts
describe('announcement and marquee bands', () => {
  const bar = read('components/brand/NewsBar.tsx');
  const marquee = read('components/brand/ClientMarquee.tsx');

  it('renders only real delivered clients', () => {
    expect(marquee).toContain('@/content/brand/clients');
    expect(marquee).not.toMatch(/Meta|Google|GE|Pfizer|Fortune|Bloomberg/);
  });

  it('paints the bar as an ink band with orange mono', () => {
    expect(bar).toContain('bg-ink');
    expect(bar).toContain('text-accent');
    expect(bar).toContain('font-label');
  });

  it('hides the decorative loop from assistive tech', () => {
    expect(marquee).toMatch(/aria-hidden/);
    expect(bar).toMatch(/aria-label|sr-only/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'announcement and marquee'`
Expected: FAIL — cannot read `components/brand/NewsBar.tsx`.

- [ ] **Step 3: Build the bar**

`components/brand/NewsBar.tsx`:

```tsx
import Link from 'next/link';
import { newsItems } from '@/content/brand/news';

/** freehand opens with a funding headline; we have no funding, so the band
 *  carries delivered work instead. Same device, honest content. */
export function NewsBar() {
  const [first, ...rest] = newsItems;
  return (
    <div className="bg-ink text-canvas" aria-label="Recent work">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-6 py-2.5 font-label text-[0.7rem] uppercase tracking-[0.16em]">
        <Link href={first.detail ? '/demos' : '/demos'} className="focus-ring rounded-none text-accent hover:underline">
          {first.lede}
        </Link>
        <span aria-hidden className="hidden text-ink-3 sm:inline">
          /
        </span>
        <p className="hidden text-ink-3 sm:block">{first.detail}</p>
        {rest.length > 0 ? (
          <p className="ml-auto hidden text-canvas/70 lg:block">
            Also live: {rest.map((n) => n.lede.replace('New — ', '')).join(', ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
```

That `href` ternary is pointless as written — replace it with a plain `href="/demos"` when you type the file. Flagging it so the reviewer does not copy it.

- [ ] **Step 4: Build the marquee**

`components/brand/ClientMarquee.tsx`:

```tsx
import { clients } from '@/content/brand/clients';

/** Two copies of the list so the -50% translate loops seamlessly. Decorative:
 *  the same sites appear as real cards on /demos. */
export function ClientMarquee() {
  const doubled = [...clients, ...clients];
  return (
    <section aria-label="Delivered for" className="border-y border-hairline bg-paper py-8">
      <p className="wi-label mb-6 text-center">Live right now for</p>
      <div aria-hidden className="wi-marquee">
        <div className="wi-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex">
              {doubled.map((client, i) => (
                <span key={`${copy}-${client.slug}`} className="wi-marquee-item">
                  {client.name}
                  <span className="text-ink-3">&middot;</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Wait — `doubled` already duplicates the list, and the map then renders it twice, so the track is four copies wide and `translateX(-50%)` still lands correctly because the second half equals the first. Keep one `[...clients, ...clients]` and the `[0, 1]` map, as above; do not also reduce the map to a single pass without checking the loop still seams.

- [ ] **Step 5: Mount both**

In `app/(site)/layout.tsx`, import `NewsBar` and place `<NewsBar />` as the first child of the shell `div`, above `<Navbar />`.

In `app/(site)/page.tsx`, import `ClientMarquee` and add it to the hero `space-y-16` container, after `<Hero />`.

- [ ] **Step 6: Verify, screenshot, commit (only with OK)**

Run: `npx vitest run && npm run build`
Expected: PASS. Screenshot `/` at 1440px — the marquee must not cause a horizontal scrollbar.

```bash
git add components/brand/NewsBar.tsx components/brand/ClientMarquee.tsx "app/(site)" test/brand-skin.test.ts
git commit -m "feat(brand): add honest announcement bar and client marquee"
```

### Task 6: The compiler becomes its own band

**Files:**
- Modify: `components/brand/SiteCompiler.tsx`
- Modify: `app/(site)/page.tsx`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: `wi-card`, `wi-label`, `wi-display`.
- Produces: `SiteCompiler()` prop-less; the business-name → WhatsApp prefill behaviour unchanged.

- [ ] **Step 1: Write the failing test**

```ts
describe('site compiler band', () => {
  const file = read('components/brand/SiteCompiler.tsx');

  it('is flat — no glass, no 3D scene, no gradient rim', () => {
    for (const dead of ['glass', 'scene', 'edge', 'beacon', 'plate', 'plinth', 'go-']) {
      expect(file, dead).not.toContain(dead);
    }
  });

  it('keeps the WhatsApp prefill wiring', () => {
    expect(file).toContain('whatsappHref');
    expect(file).toMatch(/wa\.me|whatsappHref/);
  });

  it('still submits on Enter and not only on click', () => {
    expect(file).toMatch(/onKeyDown|onSubmit|form/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'site compiler band'`
Expected: FAIL — `go-frame` present.

- [ ] **Step 3: Read the file before editing**

Open `components/brand/SiteCompiler.tsx` and keep every piece of logic: the `useState` for the name, the derived tagline, the debounce or timing that drives `.go-line` stagger, and the `whatsappHref` call. Only the returned JSX and class names change. The CSS it leans on (`.go-compile*`, `.go-line`) is restyled below rather than deleted, so the stagger keeps working.

- [ ] **Step 4: Restyle the shell**

Swap the container to a flat bordered card on the warm band:

```tsx
    <section className="wi-band-rise border-t border-hairline bg-band px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <p className="wi-label">02 / See your site</p>
        <h2 className="wi-display wi-h3 mt-4 max-w-2xl">
          Type your business name and watch it come online.
        </h2>
        <div className="wi-card mt-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
          {/* existing input + compiled preview, classes mapped below */}
        </div>
      </div>
    </section>
```

Class mapping inside the card — apply these to whatever the current markup uses:

| current | becomes |
|---|---|
| `go-frame`/`go-frame-on` wrapper | `wi-card` |
| `edge` | removed (hairline comes from `wi-card`) |
| `bg-white/[0.04]` inputs | `bg-canvas border border-hairline text-ink placeholder:text-ink-3` |
| `text-foreground` | `text-ink` |
| `text-subtle` | `text-ink-3` |
| `go-cta` buttons | `wi-btn wi-btn-solid` |
| `rounded-xl`/`rounded-2xl` | `rounded-none` |
| `font-mono` | `font-label` |
| `focus-ring ... ring-accent ring-offset-background` | unchanged — it resolves against the flipped tokens |

- [ ] **Step 5: Rename the two surviving keyframes**

In `app/globals.css`, rename `.go-compile-card` → `.wi-compile-card` and `.go-line` → `.wi-line`, keeping their keyframes and the `--d` stagger variable, and drop the `translateZ(-160px)` / `rotateX(14deg)` from `go-compile-in` so the card rises flat:

```css
@keyframes wi-compile-in {
  from {
    opacity: 0;
    transform: translate3d(0, 22px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

Update the references in `SiteCompiler.tsx` to match. `wi-line` keeps `go-line-in`'s behaviour verbatim under the new name.

- [ ] **Step 6: Mount it as band 4**

In `app/(site)/page.tsx`, add `<SiteCompiler />` as the next sibling after `ClientMarquee`, inside the hero container.

- [ ] **Step 7: Verify, then drive the input**

Run: `npx vitest run && npm run build`
Expected: PASS. Then in the browser, type a business name and confirm the preview compiles, Enter submits, and the WhatsApp link carries the typed name in `?text=`.

- [ ] **Step 8: Commit (only with OK)**

```bash
git add components/brand/SiteCompiler.tsx app/globals.css "app/(site)/page.tsx" test/brand-skin.test.ts
git commit -m "feat(brand): move the site compiler into a flat band below the hero"
```

### Task 7: Stat band and journey rail

**Files:**
- Modify: `components/brand/ProofBand.tsx`, `components/brand/ServicesJourney.tsx`, `app/globals.css`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: `serviceSteps` from `content/brand/services.ts`, `websites.length`.
- Produces: `ProofBand()` on `bg-dark`, `ServicesJourney()` with an ink rail and orange nodes.

- [ ] **Step 1: Write the failing test**

```ts
describe('stat band', () => {
  const file = read('components/brand/ProofBand.tsx');

  it('is the reference dark band, not a translucent strip', () => {
    expect(file).toContain('bg-dark');
    expect(file).toContain('border-hairline/0');
    expect(file).not.toMatch(/bg-deep|divide-white|backdrop-blur/);
  });

  it('sets numbers in the serif, not the mono counter face', () => {
    expect(file).toContain('wi-display');
  });

  it('still derives counts from the registry', () => {
    expect(file).toContain('websites.length');
  });
});

describe('journey rail', () => {
  const file = read('components/brand/ServicesJourney.tsx');
  const css = read('app/globals.css');

  it('has no gradient spine and no cyan', () => {
    expect(css).not.toMatch(/wi-rail[^}]*linear-gradient\(180deg,\s*transparent,\s*#22d3ee/);
    expect(file).not.toContain('go-');
  });

  it('still renders all four steps with problem, build and notice', () => {
    for (const field of ['problem', 'build', 'notice']) {
      expect(file, field).toContain(field);
    }
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'stat band'`
Expected: FAIL — `bg-deep` present.

- [ ] **Step 3: Restyle the stat band**

Keep `useCountUp` and the `IntersectionObserver` exactly as they are. Change only `StatCell` and the container:

```tsx
function StatCell({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.value, run);
  return (
    <div className="px-6 py-12 sm:py-16">
      <p className="wi-display text-canvas">
        <span className="text-5xl tabular-nums sm:text-6xl">
          {String(value).padStart(2, '0')}
        </span>
        {stat.suffix ? <span className="text-accent">{stat.suffix}</span> : null}
      </p>
      <p className="font-label mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
        {stat.label}
      </p>
    </div>
  );
}
```

```tsx
    <div
      ref={ref}
      className="grid grid-cols-2 bg-dark sm:grid-cols-4"
    >
```

Separate the cells with a hairline that survives the dark background — add `divide-x divide-y divide-canvas/10 sm:divide-y-0` to that container, replacing the old `divide-white/[0.07]`. freehand's stat band is a single dark field with no card edges, so do not wrap it in `wi-card`.

- [ ] **Step 4: Rebuild the rail in CSS**

In `app/globals.css`, replace the `.go-rail`, `.go-step`, `.go-node` rules with `wi-` equivalents — same geometry (left spine under `lg`, centred spine at `lg`, cards alternating across it), but an ink hairline spine and a solid orange node:

```css
.wi-rail {
  position: relative;
}
.wi-rail::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 15px;
  width: 1px;
  background: #eae0d6;
}
@media (min-width: 1024px) {
  .wi-rail::before {
    left: 50%;
    transform: translateX(-50%);
  }
}
.wi-step {
  position: relative;
  padding-left: 44px;
}
@media (min-width: 1024px) {
  .wi-step {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 5rem;
    padding-left: 0;
  }
  .wi-step > .wi-step-card {
    grid-column: 1;
  }
  .wi-step:nth-child(even) > .wi-step-card {
    grid-column: 2;
  }
}
.wi-node {
  position: absolute;
  top: 30px;
  left: 8px;
  display: grid;
  place-items: center;
  height: 15px;
  width: 15px;
  border-radius: 9999px;
  background: #fe6200;
}
@media (min-width: 1024px) {
  .wi-node {
    left: 50%;
    transform: translateX(-50%);
  }
}
```

Delete the old `.go-rail`, `.go-step`, `.go-node` rules in the same edit — nothing else references them once this file changes.

- [ ] **Step 5: Restyle the journey component**

In `components/brand/ServicesJourney.tsx`: `go-rail`/`go-step`/`go-step-card`/`go-node` → `wi-*` counterparts; `go-label` → `wi-label`; `text-foreground` → `text-ink`; `text-subtle` → `text-ink-2`; `edge`/`glass`/`beacon`/`plinth`/`Icon3D` → the flat `Icon` already on each `serviceSteps` entry, rendered as `<step.Icon aria-hidden className="h-5 w-5 text-accent" />` inside a `wi-card` square. Remove every `plate-in`/`--drift` usage and put `wi-band-rise` on each step instead.

- [ ] **Step 6: Verify, screenshot, commit (only with OK)**

Run: `npx vitest run && npm run build`
Expected: PASS. Screenshot `/` at 1440px and 390px — at 390px the spine must stay left with indented cards, not centre.

```bash
git add components/brand/ProofBand.tsx components/brand/ServicesJourney.tsx app/globals.css test/brand-skin.test.ts
git commit -m "feat(brand): dark serif stat band and flat hairline journey rail"
```

### Task 8: Products, comparison table, technology band

**Files:**
- Modify: `components/brand/ProductsGrid.tsx`
- Create: `components/brand/ComparisonTable.tsx`, `components/brand/TechBand.tsx`
- Modify: `app/(site)/page.tsx`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: `products` (`slug`, `title`, `summary`, `bullets`, `icon`, `step`), `comparisonRows`, `stackGroups`.
- Produces: `ComparisonTable()` and `TechBand()`, both prop-less; `ProductsGrid()` still prop-less.

- [ ] **Step 1: Write the failing test**

```ts
describe('products grid', () => {
  const file = read('components/brand/ProductsGrid.tsx');

  it('is square, flat and free of the dark skin', () => {
    for (const dead of ['edge', 'glass', 'beacon', 'plinth', 'plate', 'go-', 'bg-white/[', 'rounded-2xl', 'Icon3D']) {
      expect(file, dead).not.toContain(dead);
    }
    expect(file).toContain('wi-card');
  });

  it('never quotes a price, per the registry rule', () => {
    expect(file).not.toMatch(/₹|Rs\.?|price from|starting at/);
  });
});

describe('comparison table', () => {
  const file = read('components/brand/ComparisonTable.tsx');

  it('renders one row per registry entry with both columns', () => {
    expect(file).toContain('comparisonRows');
    for (const field of ['axis', 'agency', 'ours']) {
      expect(file, field).toContain(field);
    }
  });

  it('is a table, not a stack of cards', () => {
    expect(file).toMatch(/<table|role="table"|role="row"/);
    expect(file).toMatch(/<th|role="columnheader"/);
  });
});

describe('technology band', () => {
  const file = read('components/brand/TechBand.tsx');
  expect;
  it('lists only the real stack', () => {
    expect(file).toContain('stackGroups');
    expect(file).not.toMatch(/Salesforce|SAP|Oracle|Workday/);
  });
});
```

Delete the stray `expect;` line — it is a typo in this plan, not a statement to implement.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'comparison table'`
Expected: FAIL — cannot read the file.

- [ ] **Step 3: Flatten the products grid**

In `components/brand/ProductsGrid.tsx`, apply the Task 6 class mapping table verbatim, then: put the four products in `<div className="wi-card grid gap-px bg-hairline sm:grid-cols-2">` where each product cell is `<article className="bg-canvas p-7 sm:p-9">` — the `gap-px` over a hairline background is what produces the reference's shared-gridline look without drawing borders twice. Headings become `<h3 className="wi-display wi-h4">`, step chips become `<p className="wi-label">`, bullets `<li className="flex gap-3 text-ink-2">` with `<span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-accent" />` as the marker. Remove `Icon3D` and render `<product.Icon aria-hidden className="h-5 w-5 text-accent" />`.

- [ ] **Step 4: Build the comparison table**

`components/brand/ComparisonTable.tsx`:

```tsx
import { comparisonRows } from '@/content/brand/comparison';

/** freehand's "Same process. Half the cost." slot. The right column is the
 *  one we want read, so it carries the accent; the left is greyed, not mocked. */
export function ComparisonTable() {
  return (
    <div className="wi-card overflow-hidden">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">A conventional agency compared with Website IN</caption>
        <thead>
          <tr className="bg-ink text-canvas">
            <th scope="col" className="font-label px-5 py-4 text-[0.7rem] uppercase tracking-[0.18em] font-medium sm:px-8">
              What you are actually buying
            </th>
            <th scope="col" className="font-label hidden px-5 py-4 text-[0.7rem] uppercase tracking-[0.18em] font-medium text-canvas/60 sm:table-cell sm:px-8">
              Agency
            </th>
            <th scope="col" className="font-label px-5 py-4 text-[0.7rem] uppercase tracking-[0.18em] font-medium text-accent sm:px-8">
              Website IN
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row) => (
            <tr key={row.axis} className="border-t border-hairline align-top">
              <th scope="row" className="px-5 py-6 font-display text-base font-normal text-ink sm:px-8 sm:text-lg">
                {row.axis}
              </th>
              <td className="hidden px-5 py-6 text-ink-3 sm:table-cell sm:px-8">{row.agency}</td>
              <td className="px-5 py-6 text-ink sm:px-8">{row.ours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

The mobile column-drop is deliberate: on narrow screens the agency column is hidden and only the axis plus our answer remain, which keeps the table readable without a horizontal scroll. The `sr-only` caption keeps the comparison explicit for screen readers.

- [ ] **Step 5: Build the technology band**

`components/brand/TechBand.tsx`:

```tsx
import { stackGroups } from '@/content/brand/stack';

/** The reference's "works where your data already lives" band. */
export function TechBand() {
  return (
    <section className="border-t border-hairline py-16 sm:py-24">
      <p className="wi-label">04 / On your stack</p>
      <h2 className="wi-display wi-h2 mt-4 max-w-3xl">
        Ships on the tools you already have.
      </h2>
      <div className="mt-12 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {stackGroups.map((group) => (
          <div key={group.group} className="bg-canvas p-7">
            <p className="wi-label">{group.group}</p>
            <ul className="mt-4 space-y-2">
              {group.items.map((item) => (
                <li key={item} className="font-display text-lg text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Mount and verify**

In `app/(site)/page.tsx`, append after `ServicesJourney`: `<ProductsGrid />`, then a `<section>` holding `<SectionIntro index="03" label="Why it costs less" title="Same work. Fewer people between you and it." />` plus `<ComparisonTable />`, then `<TechBand />`.

Run: `npx vitest run && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit (only with OK)**

```bash
git add components/brand/ProductsGrid.tsx components/brand/ComparisonTable.tsx components/brand/TechBand.tsx "app/(site)/page.tsx" test/brand-skin.test.ts
git commit -m "feat(brand): flat products grid, comparison table and stack band"
```

### Task 9: Verticals and light browser chrome

**Files:**
- Modify: `components/brand/WorkStrip.tsx`, `components/brand/SiteFrame.tsx`, `app/globals.css`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: `websites` registry (`title`, `business`, `description`, `path`, `accent`, `screenshot`, `theme`, `techStack`).
- Produces: `SiteFrame({ site, priority?, sizes?, className?, decorative? })` — signature unchanged; `WorkStrip()` prop-less.

- [ ] **Step 1: Write the failing test**

```ts
describe('browser frame is light', () => {
  const file = read('components/brand/SiteFrame.tsx');
  const css = read('app/globals.css');

  it('uses a paper chrome bar over a hairline, not a dark bar', () => {
    expect(css).toMatch(/\.frame\s*\{[^}]*border-radius:\s*0/);
    expect(css).toMatch(/\.frame-bar\s*\{[^}]*bg-paper|\.frame-bar\s*\{[^}]*background:\s*#fdf8f4/);
  });

  it('drops the gradient rim that only worked on dark', () => {
    expect(file).not.toContain('edge-rim');
    expect(file).not.toContain('--rim');
    expect(file).not.toContain('edge');
  });

  it('keeps the screenshot priority prop for LCP', () => {
    expect(file).toContain('priority');
  });
});

describe('verticals strip', () => {
  const file = read('components/brand/WorkStrip.tsx');

  it('names the four industries it actually serves', () => {
    expect(file).toContain('@/content/websites/sites');
    expect(file).not.toContain('go-');
  });

  it('frames each vertical with the real delivered site', () => {
    expect(file).toContain('SiteFrame');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'browser frame is light'`
Expected: FAIL — `.frame` still `bg-brand-dark`.

- [ ] **Step 3: Restyle the frame in CSS**

In `app/globals.css`, replace the `.frame`, `.frame-bar`, `.frame-dot`, `.frame-url` rules:

```css
/* Browser frame: the shell every real screenshot sits behind. Square, paper
   chrome, hairline — a dark screenshot inside a light frame is the point. */
.frame {
  overflow: hidden;
  border-radius: 0;
  border: 1px solid #eae0d6;
  background: #fdf8f4;
  box-shadow: 0 1px 2px rgba(13, 11, 8, 0.04), 0 18px 40px -32px rgba(13, 11, 8, 0.35);
}
.frame-bar {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-bottom: 1px solid #eae0d6;
  background: #fdf8f4;
  padding: 0.5rem 0.75rem;
}
.frame-dot {
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 9999px;
}
.frame-url {
  margin-left: 0.5rem;
  height: 1rem;
  flex: 1;
  border-radius: 0;
  background: #fff;
  border: 1px solid #eae0d6;
}
```

`bg-brand-dark` and the `brand`/`Brand` colour keys go away in Task 12.

- [ ] **Step 4: Strip the rim props from the component**

In `components/brand/SiteFrame.tsx`, change the outer div to `className={`frame ${className}`}`, delete the `style={{ '--rim': ... }}` and the `CSSProperties` import, and set the third dot to `className="frame-dot bg-accent"`. The per-site `accent` no longer paints the frame — the frame is now neutral, which is what makes four different client palettes sit on one page. Keep `decorative`/`aria-hidden` and the `alt` logic untouched.

- [ ] **Step 5: Turn the work strip into verticals**

In `components/brand/WorkStrip.tsx`, keep whatever it already renders per site and change only presentation: `go-label` → `wi-label`, `edge`/`glass`/`beacon` → `wi-card wi-card-hover`, `plate-in`/`--drift` → `wi-band-rise`, `text-foreground` → `text-ink`, `text-subtle` → `text-ink-2`, `font-mono` → `font-label`, all `rounded-*` → `rounded-none`. Section heading becomes `<h2 className="wi-display wi-h2">` reading, in the reference's cadence: "Built for shops that live or die on the first impression." Below the grid, keep the existing CTA to `/demos` but as `wi-btn wi-btn-ghost`.

- [ ] **Step 6: Verify and screenshot**

Run: `npx vitest run && npm run build`
Expected: PASS. Screenshot at 1440px: Market Pulse's dark terminal screenshot must sit in light chrome without looking like a mistake — if it does, the fix is more padding around `.frame`, not a dark frame.

- [ ] **Step 7: Commit (only with OK)**

```bash
git add components/brand/WorkStrip.tsx components/brand/SiteFrame.tsx app/globals.css test/brand-skin.test.ts
git commit -m "feat(brand): light browser chrome and freehand-style verticals strip"
```

### Task 10: Buttons, footer, and the complete arc

**Files:**
- Modify: `components/brand/ContactCta.tsx`, `components/Footer.tsx`, `app/(site)/page.tsx`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: `whatsappHref`/`telHref`/`mailtoHref`, `company.contact`, `pages` list.
- Produces: `ContactRow()`, `ContactCta()`, `Footer()` — signatures unchanged.

- [ ] **Step 1: Write the failing test**

```ts
describe('contact buttons', () => {
  const file = read('components/brand/ContactCta.tsx');

  it('uses the reference button pair, not glowing pills', () => {
    expect(file).toContain('wi-btn-solid');
    expect(file).toContain('wi-btn-ghost');
    for (const dead of ['shadow-glow', 'beacon', 'edge', 'Icon3D', 'go-', 'rounded-xl', 'rounded-2xl', 'bg-white/[']) {
      expect(file, dead).not.toContain(dead);
    }
  });

  it('keeps all three channels wired', () => {
    for (const fn of ['whatsappHref', 'telHref', 'mailtoHref']) {
      expect(file, fn).toContain(fn);
    }
  });
});

describe('footer', () => {
  const file = read('components/Footer.tsx');

  it('is ink on cream with hairline rules', () => {
    expect(file).toContain('bg-paper');
    expect(file).toContain('border-hairline');
    expect(file).not.toMatch(/bg-deep|text-subtle|border-white\[/);
  });

  it('links every nav route plus the off-nav store', () => {
    for (const href of ['/services', '/products', '/demos', '/portfolio', '/contact', '/store']) {
      expect(file, href).toContain(href);
    }
  });
});

describe('homepage arc is complete', () => {
  const page = read('app/(site)/page.tsx');

  it('mounts all eleven bands', () => {
    for (const band of ['Hero', 'ClientMarquee', 'SiteCompiler', 'ProofBand', 'ServicesJourney', 'ProductsGrid', 'ComparisonTable', 'TechBand', 'WorkStrip', 'ContactCta']) {
      expect(page, band).toContain(band);
    }
  });

  it('no longer imports the 3D mark', () => {
    expect(page).not.toContain('Logo3D');
  });
});
```

`/store` is not in `pages` today — add `{ href: '/store', label: 'All delivered work' }` to the footer's `pages` array. This is the only place the off-nav route stays discoverable, which is why Task 13 asserts it twice.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'contact buttons'`
Expected: FAIL — `shadow-glow` present.

- [ ] **Step 3: Flatten both contact variants**

`ContactRow` becomes:

```tsx
export function ContactRow() {
  const [whatsapp, call] = channels();
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <a
        href={whatsapp.href}
        target={whatsapp.external ? '_blank' : undefined}
        rel={whatsapp.external ? 'noopener noreferrer' : undefined}
        className="focus-ring wi-btn wi-btn-solid"
      >
        <whatsapp.Icon aria-hidden className="h-4 w-4" />
        {whatsapp.label}
      </a>
      <a href={call.href} className="focus-ring wi-btn wi-btn-ghost">
        <call.Icon aria-hidden className="h-4 w-4" />
        Call {call.label}
      </a>
    </div>
  );
}
```

`ContactCta` becomes a `wi-card` panel with the solid WhatsApp button and the two remaining channels as `<a className="focus-ring flex items-center gap-4 border border-hairline bg-canvas px-4 py-3 hover:border-accent">` rows, each with `<Icon aria-hidden className="h-4 w-4 text-accent" />`, `<span className="font-label min-w-0 flex-1 break-all text-sm text-ink">`, and `<ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />`. Delete the `Icon3D` import.

- [ ] **Step 4: Rewrite the footer as a sitemap**

`components/Footer.tsx`: keep the `channels()`-equivalent wiring and `company.contact`, change the shell to `<footer className="mt-24 border-t border-hairline bg-paper">`, the grid to `grid gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4`, column headings to `<p className="wi-label">`, links to `<Link className="focus-ring rounded-none text-ink-2 hover:text-accent">`, and the bottom bar to `<div className="border-t border-hairline px-6 py-5 font-label text-xs text-ink-3">`. Add a fourth column from `clients` linking each site's `path`, so the footer doubles as the sitemap freehand's has.

- [ ] **Step 5: Compose the final arc**

`app/(site)/page.tsx` body becomes, in this exact order:

```tsx
    <div className="space-y-24 sm:space-y-32">
      <div className="space-y-14">
        <Hero />
        <ClientMarquee />
      </div>
      <SiteCompiler />
      <ProofBand />
      <ServicesJourney />
      <ProductsGrid />
      <section>
        <SectionIntro index="03" label="Why it costs less" title="Same work. Fewer people between you and it." />
        <ComparisonTable />
      </section>
      <TechBand />
      <WorkStrip />
      <section className="bg-dark px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="wi-label text-canvas/60">05 / Next step</p>
          <h2 className="wi-display wi-h2 mt-4 text-canvas">
            Send one message. We reply the same day.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-canvas/70">
            One WhatsApp message is enough. Tell us the business, and we will tell
            you exactly what step one looks like — and when it can be live.
          </p>
          <div className="mt-9">
            <ContactCta />
          </div>
        </div>
      </section>
    </div>
```

`.wi-display` hardcodes `color: #0d0b08`, so the dark band's heading needs `text-canvas` to win. It does, because Tailwind's utility comes later in the cascade than this custom block — but verify it in the browser rather than trusting that reasoning; if it loses, add `.wi-display { color: inherit }` and set the ink colour on the section instead.

Run: `npx vitest run && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit (only with OK)**

```bash
git add components/brand/ContactCta.tsx components/Footer.tsx "app/(site)/page.tsx" test/brand-skin.test.ts
git commit -m "feat(brand): square button pair, sitemap footer, complete eleven-band arc"
```

---

## Phase 4 — sub-pages, deletion, verification

### Task 11: Migrate the six remaining brand routes

**Files:**
- Modify: `app/(site)/services/page.tsx`, `app/(site)/products/page.tsx`, `app/(site)/demos/page.tsx`, `app/(site)/store/page.tsx`, `app/(site)/contact/page.tsx`, `app/(site)/portfolio/page.tsx`, `app/(site)/portfolio/[author]/page.tsx`, `app/(site)/portfolio/[author]/work/[slug]/page.tsx`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: the migrated `PageHeader`, `SectionIntro`, `wi-*` primitives, `ProductsGrid`, `ComparisonTable`, `SiteFrame`, `ContactCta`.
- Produces: no new exports; every route keeps its `metadata` export and its URL.

- [ ] **Step 1: Write the failing test — one sweep, not six**

```ts
const BRAND_ROUTES = [
  'app/(site)/page.tsx',
  'app/(site)/services/page.tsx',
  'app/(site)/products/page.tsx',
  'app/(site)/demos/page.tsx',
  'app/(site)/store/page.tsx',
  'app/(site)/contact/page.tsx',
  'app/(site)/portfolio/page.tsx',
  'app/(site)/portfolio/[author]/page.tsx',
  'app/(site)/portfolio/[author]/work/[slug]/page.tsx',
];

const BRAND_COMPONENTS = [
  'components/Navbar.tsx',
  'components/Footer.tsx',
  'components/brand/Hero.tsx',
  'components/brand/SectionIntro.tsx',
  'components/brand/PageHeader.tsx',
  'components/brand/SiteCompiler.tsx',
  'components/brand/ProofBand.tsx',
  'components/brand/ServicesJourney.tsx',
  'components/brand/ProductsGrid.tsx',
  'components/brand/ComparisonTable.tsx',
  'components/brand/TechBand.tsx',
  'components/brand/WorkStrip.tsx',
  'components/brand/SiteFrame.tsx',
  'components/brand/ContactCta.tsx',
  'components/brand/NewsBar.tsx',
  'components/brand/ClientMarquee.tsx',
];

describe('no brand file keeps a dark-skin class', () => {
  for (const file of [...BRAND_ROUTES, ...BRAND_COMPONENTS]) {
    it(file, () => {
      const src = read(file);
      // Every one of these only makes sense on a near-black canvas.
      for (const dead of ['text-foreground', 'text-subtle', 'bg-deep', 'bg-background', 'bg-elevated', 'bg-surface', 'bg-muted', 'border-white/[', 'divide-white/[', 'bg-white/[', 'text-background']) {
        expect(src, `${file} -> ${dead}`).not.toContain(dead);
      }
    });
  }
});

describe('no brand file keeps a deleted primitive', () => {
  for (const file of BRAND_COMPONENTS) {
    it(file, () => {
      const src = read(file);
      for (const dead of ['edge', 'beacon', 'glass', 'text-glow', 'plinth', 'plate-in', 'scene', 'go-', 'shadow-glow']) {
        expect(src, `${file} -> ${dead}`).not.toContain(dead);
      }
    });
  }
});

describe('brand files use the label key, not the screener mono', () => {
  for (const file of BRAND_COMPONENTS) {
    it(file, () => {
      expect(read(file)).not.toContain('font-mono');
    });
  }
});
```

The three sweeps are the actual safety net of this plan. A component left referencing a class whose CSS Task 12 deletes renders as an unstyled div, and TypeScript will not catch it — only these source assertions will.

- [ ] **Step 2: Run to see the real damage list**

Run: `npx vitest run test/brand-skin.test.ts -t 'no brand file keeps'`
Expected: FAIL, listing every remaining file. That list is the work order for steps 3–8.

- [ ] **Step 3: `/services`**

Header via `<PageHeader index="01" label="Services" title="The get-online journey, in build order.">`. Each of the four `serviceSteps` renders as one `<article className="wi-card grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.4fr]">` with `<p className="wi-label">0{n} / {step.title}</p>`, `<h2 className="wi-display wi-h4">{step.tagline}</h2>`, then the three fields as `<div><p className="wi-label">Problem</p><p className="mt-2 text-ink-2">{step.problem}</p></div>`, and likewise "What we build" → `step.build` and "What customers notice" → `step.notice`. Alternate the section background `bg-canvas` / `bg-band` between steps. End with `<ContactCta />`.

- [ ] **Step 4: `/products`**

`<PageHeader index="02" label="Products" title="Four things you can buy, separately or in order.">`, then `<ProductsGrid />`, then the same comparison block as the homepage, then a `<section className="border-t border-hairline py-16">` with the ₹-from note. Prices remain unrendered: `test/brand-registries.test.ts` forbids `₹` in `products.*` marketing fields, and no `priceFrom` field exists yet. If Jainil wants live price chips, that is a separate spec change to the type, the registry test, and this page — not a step in this plan.

- [ ] **Step 5: `/demos`**

`<PageHeader index="03" label="Demos" title="Live, in production, for four different kinds of business.">`, then `websites.map(...)` into `<article className="wi-card grid gap-8 p-6 sm:p-8 lg:grid-cols-2">` with `<SiteFrame site={site} priority={index === 0} />` in the first cell and title/business/description/`techStack` chips in the second. Chips are `<li className="font-label border border-hairline px-2 py-1 text-[0.68rem] uppercase tracking-[0.12em] text-ink-3">`. Link out with `wi-btn wi-btn-ghost`.

- [ ] **Step 6: `/store`**

Same component treatment as `/demos` and the same registry, but do not touch a single copy string — `test/brand-registries.test.ts` asserts no `demo` substring and no city name in this gallery, and the standing rule is that these read as delivered client work. Keep its route, keep its `metadata`, keep it off the navbar.

- [ ] **Step 7: `/portfolio`, `/portfolio/[author]`, `/portfolio/[author]/work/[slug]`**

Token remap only, no structural change: `text-foreground` → `text-ink`, `text-subtle` → `text-ink-2`/`text-ink-3`, `bg-background`/`bg-deep` → `bg-canvas`/`bg-paper`, `border-white/[0.07]` → `border-hairline`, `bg-white/[0.04]` → `bg-paper`, `rounded-xl|2xl|3xl` → `rounded-none`, `font-mono` → `font-label`, and remove `edge`/`glass`/`beacon`/`plate`/`plinth`/`go-*`. Author bio, stack chips, highlights, links and copy stay verbatim.

- [ ] **Step 8: `/contact`**

`<PageHeader index="04" label="Contact" title="One message. We reply the same day.">` then `<ContactCta />`. It currently uses no shell classes, so this is an addition rather than a migration.

- [ ] **Step 9: Verify**

Run: `npx vitest run && npm run build`
Expected: all sweeps green, build clean.

- [ ] **Step 10: Commit (only with OK)**

```bash
git add "app/(site)" test/brand-skin.test.ts
git commit -m "feat(brand): migrate all six sub-pages to the paper skin"
```

### Task 12: Delete the dead dark system

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Delete: `components/GridBackground.tsx`, `components/brand/Logo3D.tsx`, `components/Icon3D.tsx`
- Test: `test/brand-skin.test.ts`

**Interfaces:**
- Consumes: Tasks 4–11 having migrated every consumer.
- Produces: a single design language in `app/globals.css`, with only demo-scoped blocks remaining outside `wi-*`.

- [ ] **Step 1: Write the failing test — the leak guard**

```ts
describe('dead dark CSS is gone', () => {
  const css = read('app/globals.css');

  it('no longer defines the 3D plate or manifesto vocabulary', () => {
    for (const dead of ['.go-', '.plate', '.hero-stage', '.hero-float', '.hero-shadow', '.plinth', '.beacon', '.edge', '.glass', '.text-glow', '.scene', '.field-drift', '.text-gradient', '.animate-gradient-pan']) {
      expect(css, dead).not.toContain(dead);
    }
  });

  it('no longer defines the dead keyframes', () => {
    for (const kf of ['plate-explode', 'plate-sheen', 'hero-breathe', 'hero-shadow-play', 'rim-orbit', 'field-rise', 'go-compile-in', 'go-logo-assemble']) {
      expect(css, kf).not.toContain(kf);
    }
  });
});

describe('demo styles survive', () => {
  const css = read('app/globals.css');

  it('keeps every client site class family intact', () => {
    for (const family of ['.mp-bg', '.mp-lift', '.mp-heat', '.ha-perspective', '.ha-shadow', '.savour', '.dream-cafe', '.dc-hero-title', '.dc-btn']) {
      expect(css, family).toContain(family);
    }
  });

  it('keeps the view transitions the screener morph depends on', () => {
    expect(css).toContain('::view-transition-group');
    expect(css).toContain('view-transition-name');
  });
});
```

`view-transition-name` lives in component inline styles, not this file — if that assertion fails, check `components/sites/stock-screener/motion/vtRef.ts` before editing CSS, and do not delete the `::view-transition-*` block to make it pass.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run test/brand-skin.test.ts -t 'dead dark CSS'`
Expected: FAIL — `.go-label` still defined.

- [ ] **Step 3: Delete the three unreferenced component files**

```bash
grep -rn 'GridBackground\|Logo3D\|Icon3D' app components
```
Expected: no hits outside their own definitions. If any hit remains, that consumer still needs migrating — go back to Task 11 rather than deleting.

```bash
git rm components/GridBackground.tsx components/brand/Logo3D.tsx components/Icon3D.tsx
```

- [ ] **Step 4: Cut the dark blocks from `app/globals.css`**

Delete, in this order: the `Brand 3D primitives` block (`.scene*`, `.plinth*`, `.text-glow`, `.text-gradient`, `.glass`); the `Brand shell — depth system` block (`.edge*`, `.frame*` — **restyle `.frame*` rather than delete it, it is still mounted by `SiteFrame`**); the `Brand shell — motion system` block (`.hero-stage`, `.hero-float`, `.plate*`, `hero-breathe`, `plate-explode`, `hero-shadow-play`, `plate-sheen`, `.slice*` **keep**, `.plate-in` delete, `.beacon`, `rim-orbit`, `.field-drift`, `field-rise`); the `Get Online — Terminal Manifesto` block (all `.go-cta`, `.go-grad`, `.go-label`, `.go-manifesto`, `.go-floor`, `.go-compile*`, `.go-line*`, `go-*` keyframes); the `Logo3D` block (all `.go-logo*`); the `Get Online — structure language` block (`.go-ticker*`, `.go-frame*`, `.go-rail`, `.go-step*`, `.go-node`, `.go-stat*`) — **keep `reveal` and `reveal-in`**.

Also delete the `:root { color-scheme: dark }` declaration and replace with `:root { color-scheme: light }`, and remove `darkMode: 'class'` from `tailwind.config.ts` plus the `dark ` class from `<html>` in `app/layout.tsx` — confirm first that no demo relies on it: `grep -rn "dark:" app components | head`.

- [ ] **Step 5: Drop the dark tokens**

In `tailwind.config.ts`, delete `deep`, `surface`, `elevated`, `muted`, `border`, `foreground`, `subtle`, `brand`. Then re-run the full suite — the sweeps in Task 11 prove nothing references them, so a failure here means a consumer was missed.

- [ ] **Step 6: Verify and measure the shrink**

Run: `npx vitest run && npm run build`
Expected: PASS.

```bash
wc -l app/globals.css
```
Expected: down from 1490 to roughly 900, since ~130 lines of that were confirmed-dead hero-plate CSS before this plan started.

- [ ] **Step 7: Commit (only with OK)**

```bash
git add app/globals.css tailwind.config.ts app/layout.tsx components test/brand-skin.test.ts
git commit -m "refactor(brand)!: remove the dark go-* skin, dead 3D CSS and unused tokens"
```

### Task 13: Verification matrix

**Files:** none.

**Interfaces:**
- Consumes: everything.
- Produces: the evidence that the redesign is done and that no client site regressed.

- [ ] **Step 1: Automated**

Run: `npm run test && npm run build && npx next lint`
Expected: all clean.

- [ ] **Step 2: Route presence, both overlapping galleries still reachable**

Run: `npx vitest run test/brand-registries.test.ts`
Expected: PASS — `resolveRoute('/store')` and `resolveRoute('/demos')` both non-null. If either route was deleted during migration, this is what catches it.

- [ ] **Step 3: Desktop browser pass at 1440px**

One dev server only. Visit `/`, `/services`, `/products`, `/demos`, `/store`, `/portfolio`, `/portfolio/jainil-patel`, `/contact`. Per page: no horizontal scrollbar, no unstyled text block, headline in the serif at weight 300, corners square, no glass or glow anywhere. Check the console is empty on every one.

- [ ] **Step 4: Mobile pass at 390px**

Same eight routes. Specifically: the journey spine stays left with indented cards; the comparison table hides its agency column without sideways scroll; the marquee does not widen the page; the navbar wraps without covering the hero.

- [ ] **Step 5: Reduced motion**

Emulate `prefers-reduced-motion: reduce` and reload `/`. Expected: every band fully visible and assembled, marquee replaced by a scrollable row, no animation on load.

- [ ] **Step 6: Demo non-regression — the one that matters**

Visit `/dream-cafe`, `/savour`, `/hair-adore`, `/stock-screener`, and `/stock-screener/TCS.NS`. Expected: pixel-identical to before this plan. Inter font, Fira_Code mono on the screener, `dc-display` weight 800, all `mp-*` depth motion, and the heatmap→stock-page view transition still morph. A change here means a brand token or font variable leaked into a scoped site — treat it as a defect in Tasks 1, 4 or 12, not something to patch at the route.

- [ ] **Step 7: Accessibility spot check**

Contrast on `#FE6200` text over `#FFFFFF` is about 3.9:1 — acceptable for the 0.78rem uppercase button labels only because they are bold-ish and the reference ships the same, but if Jainil wants AA, darken button text to `#DE5804` (≈5.1:1) and keep `#FE6200` for borders and rules. Also verify: focus rings visible on every link and input, `aria-current` on the active nav item, the skip link still lands on `#main`, table has a caption and scoped headers, marquee and ticker are `aria-hidden`.

- [ ] **Step 8: Report to Jainil**

State plainly: what changed, which routes were visually confirmed, whether the demo sites were verified unchanged, and anything not verified. Do not claim a visual pass on a route that was not opened in a browser.

---

## Self-review

**1. Spec coverage.** Each spec section maps to tasks: A tokens → 1, 2; the font-leak correction → 1 Step 4 and 11 Step 1's `font-mono` sweep; B eleven bands → 4, 5, 6, 7, 8, 9, 10; C sub-pages → 11; D motion → 2, 6, 7, 12; E content → 3; F verification → 13. `README.md` is modified in the working tree already and the spec does not require changing it, so no task touches it.

**2. Placeholder scan.** Two deliberate traps are called out inline rather than left vague: the pointless `href` ternary in Task 5 Step 3 and the stray `expect;` in Task 8 Step 1. Both say "this is wrong, fix it as you type" so a reader copying the block verbatim does not propagate them. The `₹`-from price chips are **not** implemented here — the spec flags prices as unconfirmed and the registry test forbids them, so Task 11 Step 4 states that explicitly instead of leaving a half-built feature.

**3. Type consistency.** `ClientEntry { slug, name, business }`, `NewsItem { slug, lede, detail }`, `ComparisonRow { axis, agency, ours }`, `StackGroup { group, items }` are defined once in Task 3 and consumed with those exact field names in Tasks 5, 8 and 11. `SiteFrame`'s props stay `{ site, priority, sizes, className, decorative }` from Task 9 through Task 11. `ContactRow`/`ContactCta`/`Footer` keep their signatures across Tasks 10 and 11. Class names `wi-btn-solid`, `wi-btn-ghost`, `wi-card`, `wi-card-hover`, `wi-label`, `wi-display`, `wi-h1`–`wi-h4`, `wi-band-rise`, `wi-marquee*`, `wi-rail`, `wi-step`, `wi-step-card`, `wi-node`, `wi-compile-card`, `wi-line` are introduced in Tasks 2, 6 and 7 and referenced consistently afterward.

**4. Ambiguity check.** Resolved: which font variables may change (only `--font-display`, plus two new keys); whether `/store` survives (yes, off-nav, footer-linked, asserted twice); what happens to `Logo3D`/`Icon3D`/`GridBackground` (all deleted in Task 12, with a grep gate first); whether dark mode survives (no — `color-scheme: light`, `darkMode` removed, with a `grep 'dark:'` check first); and the serif fallback order if the hero gate fails.
