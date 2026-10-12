# Website IN brand site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `ecosites` Next.js app into the Website IN business site, with `/` as the company page, `/store` as delivered client work, and the personal portfolio kept but demoted.

**Architecture:** One rebranded shell. The existing `(portfolio)` route group is renamed `(site)` and keeps supplying `GridBackground` + `Navbar` + `Footer` chrome to every new page, so no second layout is created. All business copy lives in `content/brand/` registries; components never hard-code text. Contact hrefs are derived by pure functions from a single phone/email string and unit-tested, because a malformed WhatsApp link silently costs customers.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.7, Tailwind 3.4 (existing tokens), lucide-react, vitest 4 (node environment, no DOM).

**Spec:** `docs/superpowers/specs/2026-10-12-website-in-brand-site-design.md`

## Global Constraints

- No new runtime or dev dependencies.
- Node `>=20` (`.nvmrc` = 20).
- Existing palette and type tokens are reused verbatim: `background #0F172A`, `accent #22C55E`, `foreground #F8FAFC`, `subtle #94A3B8`, `font-display` (Share Tech Mono), `glass`, `shadow-card`, `animate-fade-up`.
- No price points or package tiers anywhere in copy.
- Email is exactly `mail.jainil5@gmail.com`; phone is stored exactly `8238889347` (national digits, no `+91`, no spaces) and displayed as `+91 82388 89347`.
- Business **facts** live only in `content/brand/company.ts` and `content/brand/products.ts`:
  no component or page may hard-code the company name, tagline, pitch, city, email, or phone.
  Section headings, button labels and one-off connective sentences stay in their components —
  they are UI copy, they are used once, and pulling them into a registry would scatter the page
  across two files.
- URLs that must not change: `/hair-adore`, `/savour`, `/savour/[slug]`, `/stock-screener`, `/portfolio`, `/portfolio/demos`, `/portfolio/demos/[slug]`, `/portfolio/resume`, `/api/stocks/*`.
- The app must still build and run with an empty `.env.local`.
- Components are verified by `npm run build` + a route sweep + a browser look, not unit tests: vitest runs `environment: 'node'` with no DOM library, so there is no component test harness in this repo. Pure modules get real tests.
- Do not create a `getProductBySlug` helper. The spec lists one, but no task in this plan has a per-product route, so it would be dead code.

---

### Task 1: Rename the route group to `(site)`

A pure rename with zero URL change, done first so every later task targets a stable path.

**Files:**
- Move: `app/(portfolio)/` → `app/(site)/`
- Modify: none

**Interfaces:**
- Consumes: nothing.
- Produces: `app/(site)/layout.tsx` as the shared chrome, and `app/(site)/page.tsx` still rendering the Apps gallery at `/`.

- [ ] **Step 1: Confirm the current routes work, to have a baseline**

```bash
cd /Users/jainil/Documents/development/ecosites
for p in / /portfolio /portfolio/demos /portfolio/resume /hair-adore /savour /stock-screener; do
  printf "%s  %s\n" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "http://localhost:3000$p")" "$p"
done
```
Expected: `200` on all seven. If `localhost:3000` is refused, start the server first with `npm run dev` and re-run after "Ready".

- [ ] **Step 2: Rename the folder**

```bash
git mv "app/(portfolio)" "app/(site)"
```
Route groups in parentheses are excluded from the URL, so `/portfolio` stays `/portfolio`.

- [ ] **Step 3: Verify no URL moved**

```bash
npm run build 2>&1 | grep -E "Route \(app\)|^├|^┌|^└|Error"
```
Expected: the same route list as before the rename — `/`, `/portfolio`, `/portfolio/demos`, `/portfolio/demos/[slug]`, `/portfolio/resume`, `/hair-adore`, `/savour`, `/savour/[slug]`, `/stock-screener`, `/api/stocks/*`. No `/(site)/...` prefix in any path.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: rename the portfolio route group to site

The group now holds brand pages as well as portfolio pages, and its layout is
the shared chrome for both."
```

---

### Task 2: Brand types, company registry, contact link helpers

TDD on the pure helpers. This task has no UI.

**Files:**
- Create: `content/brand/types.ts`
- Create: `content/brand/company.ts`
- Create: `content/brand/links.ts`
- Test: `test/brand-contact-links.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `ContactChannels { email: string; phone: string; phoneDisplay: string; whatsappMessage: string }`
  - `Company { name: string; tagline: string; pitch: string; city: string; contact: ContactChannels }`
  - `ProductIcon = 'globe' | 'sparkles' | 'workflow'`
  - `Product { slug: string; title: string; summary: string; bullets: string[]; icon: ProductIcon }`
  - `company: Company`
  - `whatsappHref(contact: ContactChannels): string`, `telHref(contact: ContactChannels): string`, `mailtoHref(contact: ContactChannels): string`

- [ ] **Step 1: Write the failing test**

Create `test/brand-contact-links.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';
import type { ContactChannels } from '@/content/brand/types';

const contact: ContactChannels = {
  email: 'mail.jainil5@gmail.com',
  phone: '8238889347',
  phoneDisplay: '+91 82388 89347',
  whatsappMessage: 'Hi Website IN! I would like a website for my business.',
};

describe('whatsappHref', () => {
  it('builds a wa.me link with the 91 country code and an encoded message', () => {
    expect(whatsappHref(contact)).toBe(
      'https://wa.me/918238889347?text=Hi%20Website%20IN!%20I%20would%20like%20a%20website%20for%20my%20business.',
    );
  });

  it('strips spaces and dashes from a loosely typed number', () => {
    expect(whatsappHref({ ...contact, phone: '82388-89 347' })).toContain('/918238889347');
  });

  it('does not double the country code when one is already present', () => {
    expect(whatsappHref({ ...contact, phone: '+918238889347' })).toContain('/918238889347');
  });
});

describe('telHref', () => {
  it('produces an E.164 href', () => {
    expect(telHref(contact)).toBe('tel:+918238889347');
  });
});

describe('mailtoHref', () => {
  it('produces a plain mailto for the business address', () => {
    expect(mailtoHref(contact)).toBe('mailto:mail.jainil5@gmail.com');
  });
});

it('exposes the phone in national form and a separate display form', () => {
  expect(contact.phone).toBe('8238889347');
  expect(contact.phoneDisplay).toBe('+91 82388 89347');
});
```

- [ ] **Step 2: Run it and watch it fail on the missing module**

```bash
npx vitest run test/brand-contact-links.test.ts
```
Expected: FAIL — `Failed to load url @/content/brand/links ... Does ... exist?`

- [ ] **Step 3: Write the types**

Create `content/brand/types.ts`:

```ts
export interface ContactChannels {
  /** Exact business address, e.g. 'mail.jainil5@gmail.com'. */
  email: string;
  /** National significant digits only: no '+91', no spaces, no dashes. */
  phone: string;
  /** What visitors read on screen. */
  phoneDisplay: string;
  /** Prefilled first message for the WhatsApp tap. */
  whatsappMessage: string;
}

export interface Company {
  name: string;
  tagline: string;
  pitch: string;
  city: string;
  contact: ContactChannels;
}

export type ProductIcon = 'globe' | 'sparkles' | 'workflow';

export interface Product {
  slug: string;
  title: string;
  /** One sentence, written for a shop owner, not an engineer. */
  summary: string;
  /** 3-4 concrete deliverables. */
  bullets: string[];
  icon: ProductIcon;
}
```

- [ ] **Step 4: Write the company registry**

Create `content/brand/company.ts`:

```ts
import type { Company } from './types';

export const company: Company = {
  name: 'Website IN',
  tagline: 'Websites, AI and automation for local businesses',
  pitch:
    'We put shops, clinics and studios online with fast, affordable websites — then add the AI and automation that saves an owner a few hours every week. Built in Pune, priced for businesses that are just getting started.',
  city: 'Pune',
  contact: {
    email: 'mail.jainil5@gmail.com',
    phone: '8238889347',
    phoneDisplay: '+91 82388 89347',
    whatsappMessage: 'Hi Website IN! I would like a website for my business.',
  },
};
```

- [ ] **Step 5: Write the link helpers**

Create `content/brand/links.ts`:

```ts
import type { ContactChannels } from './types';

const COUNTRY_CODE = '91';

/** Digits only, with the Indian country code added exactly once. */
function fullNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `${COUNTRY_CODE}${digits}`;
  if (digits.startsWith(COUNTRY_CODE)) return digits;
  return digits;
}

export function whatsappHref(contact: ContactChannels): string {
  const message = encodeURIComponent(contact.whatsappMessage);
  return `https://wa.me/${fullNumber(contact.phone)}?text=${message}`;
}

export function telHref(contact: ContactChannels): string {
  return `tel:+${fullNumber(contact.phone)}`;
}

export function mailtoHref(contact: ContactChannels): string {
  return `mailto:${contact.email}`;
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run test/brand-contact-links.test.ts
```
Expected: PASS, 7 tests.

- [ ] **Step 7: Commit**

```bash
git add content/brand test/brand-contact-links.test.ts
git commit -m "feat: add Website IN company registry and contact link helpers

The phone is stored once in national digits and every href is derived, so one
typo cannot break the only route a customer has to reach us."
```

---

### Task 3: Products registry and its invariants

**Files:**
- Create: `content/brand/products.ts`
- Test: `test/brand-registries.test.ts` (products assertions only in this task; the store assertions arrive in Task 4)

**Interfaces:**
- Consumes: `Product`, `ProductIcon` from `content/brand/types.ts`.
- Produces: `products: Product[]` with slugs `websites`, `ai-services`, `automation`.

- [ ] **Step 1: Write the failing test**

Create `test/brand-registries.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { company } from '@/content/brand/company';
import { products } from '@/content/brand/products';

describe('products registry', () => {
  it('lists three offerings in selling order', () => {
    expect(products.map((p) => p.slug)).toEqual(['websites', 'ai-services', 'automation']);
  });

  it('has unique slugs', () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it('gives every product 3-4 bullets and a one-sentence summary', () => {
    for (const product of products) {
      expect(product.bullets.length).toBeGreaterThanOrEqual(3);
      expect(product.bullets.length).toBeLessThanOrEqual(4);
      expect(product.summary.split('.').filter(Boolean).length).toBe(1);
      expect(product.title).toBe(product.title.trim());
    }
  });
});

describe('company registry', () => {
  it('has no empty marketing fields', () => {
    expect(company.name).toBe('Website IN');
    for (const field of [company.tagline, company.pitch, company.city]) {
      expect(field.trim().length).toBeGreaterThan(0);
    }
  });

  it('never quotes a price in marketing copy', () => {
    const text = `${company.tagline} ${company.pitch} ${products
      .map((p) => `${p.title} ${p.summary} ${p.bullets.join(' ')}`)
      .join(' ')}`;
    expect(text).not.toMatch(/₹|Rs\.?|price[d]? from|starting at/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run test/brand-registries.test.ts
```
Expected: FAIL — cannot resolve `@/content/brand/products`.

- [ ] **Step 3: Write the registry**

Create `content/brand/products.ts`:

```ts
import type { Product } from './types';

export const products: Product[] = [
  {
    slug: 'websites',
    title: 'Websites',
    summary: 'A fast site that sells for you — services, photos, prices and bookings.',
    icon: 'globe',
    bullets: [
      'Business site with your services, gallery and prices',
      'Booking or enquiry button that lands on your phone',
      'Update menus and offers yourself, no developer needed',
      'Built mobile-first, because that is where customers are',
    ],
  },
  {
    slug: 'ai-services',
    title: 'AI services',
    summary: 'An assistant that answers customers in your voice, at any hour.',
    icon: 'sparkles',
    bullets: [
      'Website assistant for timings, stock and pricing questions',
      'Drafts for offers, posts and menus from your own details',
      'Reports that read your numbers so you do not have to',
    ],
  },
  {
    slug: 'automation',
    title: 'Automation',
    summary: 'The repetitive back-office work runs itself: orders, lists and reminders.',
    icon: 'workflow',
    bullets: [
      'Orders and enquiries into one inbox or sheet',
      'Follow-up messages on a schedule, not from memory',
      'Month-end summary without rebuilding a spreadsheet',
    ],
  },
];
```

- [ ] **Step 4: Run the tests**

```bash
npx vitest run test/brand-registries.test.ts
```
Expected: PASS, 5 tests (3 product, 2 company).

- [ ] **Step 5: Commit**

```bash
git add content/brand/products.ts test/brand-registries.test.ts
git commit -m "feat: add Website IN product registry"
```

---

### Task 4: Move the Apps gallery to `/store`

**Files:**
- Create: `app/(site)/store/page.tsx`
- Delete: `app/(site)/page.tsx` (its gallery body moves into `/store`; Task 8 replaces this file with the company page)
- Create: `app/(site)/store/work-links.ts` — route-resolution helper shared by the test
- Test: modify `test/brand-registries.test.ts` (append store assertions)

**Interfaces:**
- Consumes: `websites` from `content/websites/sites`, `WebsiteCard`, `SectionHeading`.
- Produces: route `/store`; `resolveRoute(route: string): string | null` used by the registry test.

- [ ] **Step 1: Append the failing store assertions**

Add to `test/brand-registries.test.ts`, below the existing describes, and add the import at the top:

```ts
import { resolveRoute } from './helpers/resolve-route';
```

```ts
describe('store registry', () => {
  it('points every entry at a route that exists', () => {
    for (const site of websites) {
      expect(resolveRoute(site.path), `${site.slug} -> ${site.path}`).not.toBeNull();
    }
  });

  it('has a screenshot file on disk for every entry', () => {
    for (const site of websites) {
      const file = path.join(process.cwd(), 'public', site.screenshot.replace(/^\//, ''));
      expect(existsSync(file), site.screenshot).toBe(true);
    }
  });

  it('uses unique slugs', () => {
    expect(new Set(websites.map((w) => w.slug)).size).toBe(websites.length);
  });
});
```

Also extend the imports at the top of the test file:

```ts
import { existsSync } from 'node:fs';
import path from 'node:path';
import { websites } from '@/content/websites/sites';
```

- [ ] **Step 2: Write the route resolver helper**

Create `test/helpers/resolve-route.ts`. It maps a URL path to a `page.tsx` under `app/`, dropping route-group folders (the `@/` alias in `vitest.config.ts` points at the repo root, so the `app` tree is not importable as a module).

```ts
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(process.cwd(), 'app');

/** Route groups like `(site)` are erased from the URL, so drop those segments. */
function visibleSegments(dirs: string[]): string[] {
  return dirs.filter((d) => !(d.startsWith('(') && d.endsWith(')')));
}

const routes = new Set<string>();

function walk(dirs: string[]): void {
  const abs = path.join(APP_DIR, ...dirs);
  if (!existsSync(abs)) return;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const next = [...dirs, entry.name];
    if (existsSync(path.join(APP_DIR, ...next, 'page.tsx'))) {
      routes.add(`/${visibleSegments(next).join('/')}`);
    }
    walk(next);
  }
}

walk([]);

/** Returns the normalized route, or null when no page.tsx serves it. */
export function resolveRoute(route: string): string | null {
  const normalized = route === '/' ? '/' : route.replace(/\/+$/, '');
  return routes.has(normalized) ? normalized : null;
}
```

`app/(site)/page.tsx` resolves to `/`, because dropping the group leaves no segments —
`visibleSegments(['(site)'])` is `[]` and `'/'.concat('')` is `/`. That is deliberate: it is how
the resolver proves the placeholder page in Step 5 serves the base URL.

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run test/brand-registries.test.ts
```
Expected: FAIL on `resolveRoute` returning `null` for every `site.path`, because `app/(site)/page.tsx` is about to move and `/store` does not exist yet.

- [ ] **Step 4: Create the store page**

Create `app/(site)/store/page.tsx`. This is the former Apps page with copy that reads as delivered client work:

```tsx
import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';
import { WebsiteCard } from '@/components/WebsiteCard';
import { SectionHeading } from '@/components/SectionHeading';
import { websites } from '@/content/websites/sites';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Websites and tools Website IN has built and shipped for local businesses — each one live, each with its own look.',
};

export default function StorePage() {
  return (
    <div className="space-y-12">
      <SectionHeading eyebrow="Delivered work" title="What we have shipped">
        <span className="inline-flex items-center gap-2">
          <Briefcase aria-hidden className="h-4 w-4" />
          {websites.length} businesses live, each with its own theme and stack. Open any one of
          them — they are real working sites, not mockups.
        </span>
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {websites.map((site, i) => (
          <div
            key={site.slug}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <WebsiteCard site={site} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Empty the old Apps page so the resolver finds `/store`**

Replace the whole of `app/(site)/page.tsx` with a placeholder that Task 8 overwrites. It must render, or the build breaks:

```tsx
export default function HomePage() {
  return <div />;
}
```

- [ ] **Step 6: Run the registry tests**

```bash
npx vitest run test/brand-registries.test.ts
```
Expected: PASS, 8 tests (5 from before plus 3 store assertions). If `resolveRoute` still misses `/hair-adore`, read the set it built — the three client sites live under `app/(sites)/`, and group folders must be dropped.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: move the site gallery to /store as delivered work"
```

---

### Task 5: Let store cards point at a client's own domain

**Files:**
- Modify: `content/websites/types.ts`
- Modify: `components/WebsiteCard.tsx`

**Interfaces:**
- Consumes: `SampleWebsite`.
- Produces: `SampleWebsite.liveUrl?: string` and `SampleWebsite.year?: number`, consumed by `WebsiteCard` and later by `WorkStrip`.

- [ ] **Step 1: Add the optional fields**

In `content/websites/types.ts`, insert above the closing brace of the interface:

```ts
  /** Public production URL, when the client has their own domain. */
  liveUrl?: string;
  /** Year it shipped. */
  year?: number;
```

- [ ] **Step 2: Branch the card link**

In `components/WebsiteCard.tsx`, replace the `<Link href={site.path} ...>` opening tag and its matching close tag. The card is one link today; with `liveUrl` it must be a plain anchor, because a Next `<Link>` to an external host bypasses the router and drops prefetch semantics.

Replace line 14 (`      <Link`) through line 55 (`      </Link>`) with:

```tsx
      {site.liveUrl ? (
        <a
          href={site.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group focus-ring flex h-full flex-col overflow-hidden rounded-2xl glass shadow-card transition-shadow hover:shadow-card-hover"
        >
          <CardBody site={site} external />
        </a>
      ) : (
        <Link
          href={site.path}
          className="group focus-ring flex h-full flex-col overflow-hidden rounded-2xl glass shadow-card transition-shadow hover:shadow-card-hover"
        >
          <CardBody site={site} />
        </Link>
      )}
```

- [ ] **Step 3: Extract the card body**

Still in `components/WebsiteCard.tsx`, add this component above `WebsiteCard`. It holds the markup that was inside the link, so both branches share it, and the `external` flag swaps the arrow icon:

```tsx
function CardBody({ site, external = false }: { site: SampleWebsite; external?: boolean }) {
  return (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
        <Image
          src={site.screenshot}
          alt={`Preview of ${site.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-85 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-accent">
              {site.title}
            </h3>
            <p className="font-mono text-xs text-subtle">{site.business}</p>
          </div>
          {external ? (
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-accent"
            />
          ) : (
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          )}
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm text-subtle">{site.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] text-foreground/85"
            style={{ borderColor: `${site.accent}55`, color: site.accent }}
          >
            <Layers aria-hidden className="h-3 w-3" />
            {site.theme}
          </span>
          {site.year ? (
            <span className="font-mono text-[11px] text-subtle">{site.year}</span>
          ) : null}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Typecheck and build**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
```
Expected: no type errors, build succeeds. `liveUrl` is unset on all three entries, so every card still routes in-app.

- [ ] **Step 5: Commit**

```bash
git add content/websites/types.ts components/WebsiteCard.tsx
git commit -m "feat: allow store entries to link to a client's live domain"
```

---

### Task 6: `ContactCta` — the three channels, defined once

**Files:**
- Create: `components/brand/ContactCta.tsx`

**Interfaces:**
- Consumes: `company` from `content/brand/company`, `whatsappHref`/`telHref`/`mailtoHref` from `content/brand/links`.
- Produces: `<ContactCta />` (no props) and `<ContactRow />` for the hero's compact variant. Both are used by Tasks 7 and 9.

- [ ] **Step 1: Write the component**

Create `components/brand/ContactCta.tsx`:

```tsx
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';

function channels() {
  const { contact } = company;
  return [
    { key: 'whatsapp', label: 'WhatsApp', href: whatsappHref(contact), Icon: MessageCircle, external: true },
    { key: 'call', label: company.contact.phoneDisplay, href: telHref(contact), Icon: Phone, external: false },
    { key: 'email', label: company.contact.email, href: mailtoHref(contact), Icon: Mail, external: false },
  ] as const;
}

/** Compact pill row for the hero. */
export function ContactRow() {
  const [whatsapp, call] = channels();
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <a
        href={whatsapp.href}
        target={whatsapp.external ? '_blank' : undefined}
        rel={whatsapp.external ? 'noopener noreferrer' : undefined}
        className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5"
      >
        <whatsapp.Icon aria-hidden className="h-4 w-4" />
        {whatsapp.label}
      </a>
      <a
        href={call.href}
        className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-foreground transition-transform hover:-translate-y-0.5"
      >
        <call.Icon aria-hidden className="h-4 w-4 text-accent" />
        Call {call.label}
      </a>
    </div>
  );
}

/** Full three-channel block for the closing section and the contact page. */
export function ContactCta() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {channels().map(({ key, label, href, Icon, external }) => (
        <a
          key={key}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="focus-ring group flex cursor-pointer items-center gap-3 rounded-2xl glass p-5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <Icon aria-hidden className="h-5 w-5 shrink-0 text-accent" />
          <span className="min-w-0 break-all font-mono text-sm text-foreground group-hover:text-accent">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```
Expected: no errors. Nothing renders it yet.

- [ ] **Step 3: Commit**

```bash
git add components/brand/ContactCta.tsx
git commit -m "feat: add the Website IN contact call-to-action"
```

---

### Task 7: Hero, products grid, work strip

**Files:**
- Create: `components/brand/Hero.tsx`
- Create: `components/brand/ProductsGrid.tsx`
- Create: `components/brand/WorkStrip.tsx`

**Interfaces:**
- Consumes: `company`, `products`, `websites`, `ContactRow`, `SectionHeading`, `TiltCard`.
- Produces: three server components composed by Task 8, and the `id="services"` anchor that the nav links to.

- [ ] **Step 1: Hero**

Create `components/brand/Hero.tsx`:

```tsx
import { MapPin } from 'lucide-react';
import { ContactRow } from '@/components/brand/ContactCta';
import { company } from '@/content/brand/company';

export function Hero() {
  return (
    <section className="animate-fade-up space-y-6 pt-6">
      <p className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 font-mono text-xs text-accent">
        <MapPin aria-hidden className="h-3.5 w-3.5" />
        {company.city} · for local businesses
      </p>

      <h1 className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
        <span className="text-foreground">Your business, </span>
        <span className="text-gradient text-glow">online</span>
        <span className="text-foreground"> and working for you.</span>
      </h1>

      <p className="max-w-2xl text-lg text-subtle">{company.pitch}</p>

      <ContactRow />
    </section>
  );
}
```

- [ ] **Step 2: Products grid with the `#services` anchor**

Create `components/brand/ProductsGrid.tsx`. The icon map is a literal record, because a dynamic lucide name is not statically analyzable and would render `undefined`:

```tsx
import Link from 'next/link';
import { ArrowRight, Globe, MessageSquareQuestion, Sparkles, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { TiltCard } from '@/components/TiltCard';
import { products } from '@/content/brand/products';
import type { ProductIcon } from '@/content/brand/types';

const ICONS: Record<ProductIcon, LucideIcon> = {
  globe: Globe,
  sparkles: Sparkles,
  workflow: Workflow,
};

export function ProductsGrid() {
  return (
    <section id="services" className="scroll-mt-24">
      <SectionHeading eyebrow="What we do" title="Three ways we help a shop grow">
        Start with a website, add the AI and automation when it earns for you.
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => {
          const Icon = ICONS[product.icon];
          return (
            <TiltCard key={product.slug} max={8} className="rounded-2xl">
              <div
                className="animate-fade-up flex h-full flex-col rounded-2xl glass p-6 shadow-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon aria-hidden className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-xl text-foreground">{product.title}</h3>
                <p className="mt-2 text-sm text-subtle">{product.summary}</p>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {product.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm text-foreground/85">
                      <span aria-hidden className="text-accent">
                        ·
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          );
        })}

        <TiltCard max={8} className="rounded-2xl">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-dashed border-accent/40 p-6">
            <div>
              <MessageSquareQuestion aria-hidden className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-xl text-foreground">Something else</h3>
              <p className="mt-2 text-sm text-subtle">
                Not sure what you need? Tell us what hurts in your business and we will say
                honestly whether we can help.
              </p>
            </div>
            <Link
              href="/contact"
              className="focus-ring mt-5 inline-flex cursor-pointer items-center gap-2 font-mono text-sm text-accent"
            >
              Talk to us
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Work strip, derived from the store registry**

Create `components/brand/WorkStrip.tsx`. It returns `null` on an empty registry rather than rendering "0 businesses":

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { websites } from '@/content/websites/sites';

export function WorkStrip() {
  if (websites.length === 0) return null;

  return (
    <section className="rounded-2xl glass p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-display text-4xl text-accent">{websites.length}</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-subtle">
            businesses live
          </p>
        </div>
        <Link
          href="/store"
          className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-background transition-transform hover:-translate-y-0.5"
        >
          See the work
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5">
        {websites.map((site) => (
          <li key={site.slug} className="font-mono text-sm text-subtle">
            <span className="text-foreground">{site.title}</span> — {site.business}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Check every lucide icon name actually exists in the installed version**

`lucide-react@0.454` is a pinned snapshot; a name that does not exist imports as `undefined` and
crashes at render, not at compile time. Check before building:

```bash
node -e "
const l = require('lucide-react');
for (const n of ['Globe','Sparkles','Workflow','Globe2','Briefcase','MapPin','MessageSquareQuestion','MessagesSquare','ArrowRight','ArrowUpRight','Layers','Mail','Phone','MessageCircle']) {
  console.log((l[n] ? 'ok  ' : 'MISSING ') + n);
}"
```

If `MessageSquareQuestion` prints `MISSING`, use `MessagesSquare` in both the import and the JSX
of `ProductsGrid.tsx`. If `Workflow` prints `MISSING`, use `Repeat` and update both the icon map
and `ProductIcon` in `content/brand/types.ts` so the union still describes the real options.

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit && npm run build 2>&1 | tail -5
```
Expected: no type errors; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add components/brand
git commit -m "feat: add hero, products grid and work strip for the company page"
```

---

### Task 8: The company page at `/`

**Files:**
- Modify: `app/(site)/page.tsx` (currently the empty placeholder from Task 4)

**Interfaces:**
- Consumes: `Hero`, `ProductsGrid`, `WorkStrip`, `ContactCta`.
- Produces: the `/` route as the business landing page.

- [ ] **Step 1: Replace the placeholder**

Overwrite `app/(site)/page.tsx` entirely:

```tsx
import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { Hero } from '@/components/brand/Hero';
import { ProductsGrid } from '@/components/brand/ProductsGrid';
import { WorkStrip } from '@/components/brand/WorkStrip';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  // No title: the root default from app/layout.tsx is already
  // "Website IN — <tagline>", and setting one here would push it through the
  // "%s | Website IN" template and print the brand name twice.
  description: company.pitch,
};

export default function HomePage() {
  return (
    <div className="space-y-24">
      <Hero />
      <ProductsGrid />
      <WorkStrip />
      <section className="space-y-6">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          Send one message. We reply the same day.
        </h2>
        <ContactCta />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders the business, not the gallery**

```bash
npm run build 2>&1 | grep -E "Route \(app\)|^├|^┌|^└"
curl -s http://localhost:3000/ | grep -oE "(Website IN|WhatsApp|businesses live|82388 89347)" | sort -u
```
Expected: `/` in the route list, and all four strings present in the HTML. `WhatsApp` proves the contact href reached the server render.

- [ ] **Step 3: Open it and look**

```bash
open -a "Google Chrome" "http://localhost:3000/"
```
Check: the wordmark still says `jainil.dev` (fixed in Task 10), the hero reads as a business, products show three cards plus the invitation, and every card is readable at mobile width.

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: make the base URL the Website IN company page"
```

---

### Task 9: Contact page

**Files:**
- Create: `app/(site)/contact/page.tsx`

**Interfaces:**
- Consumes: `ContactCta`, `company`.
- Produces: route `/contact`.

- [ ] **Step 1: Write the page**

Create `app/(site)/contact/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { SectionHeading } from '@/components/SectionHeading';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Talk to ${company.name} about a website, AI or automation job for your business in ${company.city}.`,
};

export default function ContactPage() {
  return (
    <div className="space-y-10">
      <SectionHeading eyebrow="Contact" title="Tell us what you need">
        WhatsApp is fastest. A call works too, and email is best when you want to send photos or
        a list of what you already have.
      </SectionHeading>

      <ContactCta />

      <p className="max-w-2xl font-mono text-sm text-subtle">
        Serving {company.city} and anywhere a link can reach.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run build 2>&1 | grep -E "/contact|Error"
curl -s http://localhost:3000/contact | grep -oE "wa\.me/918238889347|tel:\+918238889347|mailto:mail\.jainil5@gmail\.com" | sort -u
```
Expected: `/contact` in the route list and all three hrefs in the HTML.

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/contact"
git commit -m "feat: add the Website IN contact page"
```

---

### Task 10: Rebrand the shell — Navbar and Footer

**Files:**
- Modify: `components/Navbar.tsx`
- Modify: `components/Footer.tsx`

**Interfaces:**
- Consumes: `company`, `whatsappHref`/`telHref`/`mailtoHref`.
- Produces: nav pointing at `/#services`, `/store`, `/contact`; footer carrying the portfolio links that left the nav.

- [ ] **Step 1: Replace the nav model**

In `components/Navbar.tsx`, replace lines 1-9 (imports plus the `links` array) with:

```tsx
import Link from 'next/link';
import { Globe2 } from 'lucide-react';
import { company } from '@/content/brand/company';

const links = [
  { href: '/#services', label: 'Services' },
  { href: '/store', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];
```

Then replace the wordmark block — the `<Link href="/">` containing `<Terminal>` and the
`jainil` / `.dev` spans — with:

```tsx
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-lg font-display text-base tracking-tight text-foreground"
        >
          <Globe2 aria-hidden className="h-5 w-5 text-accent" />
          <span className="text-glow">Website</span>
          <span className="text-accent">IN</span>
        </Link>
```

- [ ] **Step 2: Rewrite the footer**

Overwrite `components/Footer.tsx` completely. It stops importing `content/resume/data` so the
brand chrome and the personal resume data are no longer coupled:

```tsx
import Link from 'next/link';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { company } from '@/content/brand/company';
import { mailtoHref, telHref, whatsappHref } from '@/content/brand/links';

const portfolioLinks = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/portfolio/resume', label: 'Resume' },
];

export function Footer() {
  const { contact } = company;
  const channels = [
    { href: whatsappHref(contact), label: 'WhatsApp', Icon: MessageCircle, external: true },
    { href: telHref(contact), label: contact.phoneDisplay, Icon: Phone, external: false },
    { href: mailtoHref(contact), label: 'Email', Icon: Mail, external: false },
  ];

  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="font-display text-base text-foreground">
            {company.name} <span className="text-subtle">· {company.city}</span>
          </p>
          <p className="font-mono text-xs text-subtle">
            © {new Date().getFullYear()} {company.name} — {company.tagline.toLowerCase()}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {channels.map(({ href, label, Icon, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="focus-ring inline-flex items-center gap-1.5 rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
            >
              <Icon aria-hidden className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
          {portfolioLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded font-mono text-sm text-subtle transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify the anchor target exists, in the browser**

```bash
open -a "Google Chrome" "http://localhost:3000/"
```
Click **Services** — the products section must scroll into view, not sit still. A nav link to a
missing anchor is invisible in a build log. `id="services"` came from Task 7 Step 2.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx components/Footer.tsx
git commit -m "feat: rebrand the shell from jainil.dev to Website IN

The footer keeps Portfolio and Resume reachable after they left the primary nav."
```

---

### Task 11: Root metadata, domain, and the README

**Files:**
- Modify: `app/layout.tsx:40-49`
- Modify: `README.md`

**Interfaces:**
- Consumes: `company`.
- Produces: correct `<title>`, Open Graph base, and documentation matching the new route map.

- [ ] **Step 1: Point metadata at the brand**

In `app/layout.tsx`, add the import beside the others:

```ts
import { company } from '@/content/brand/company';
```

Replace the `metadata` object (lines 40-49) with:

```ts
export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in Vercel to the real origin; this fallback keeps
  // canonical tags correct on a preview build that has no env var.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://websitein.com'),
  title: {
    default: `${company.name} — ${company.tagline}`,
    template: `%s | ${company.name}`,
  },
  description: company.pitch,
};
```

- [ ] **Step 2: Verify the title tag**

```bash
curl -s http://localhost:3000/ | grep -oE "<title>[^<]*</title>"
```
Expected: `<title>Website IN — Websites, AI and automation for local businesses</title>`

- [ ] **Step 3: Rewrite the README route table and nav copy**

In `README.md`, replace the first two rows of the route table in §3 so they read:

```markdown
| Route | Purpose |
| --- | --- |
| `/` | Website IN company page — positioning, products, client proof, contact |
| `/store` | Delivered client work, from `content/websites/sites.ts` |
```

and add directly beneath the portfolio rows:

```markdown
| `/contact` | WhatsApp, call and email channels |
```

Then update the "Architecture" bullets: `app/(site)/layout.tsx` replaces `app/(portfolio)/layout.tsx`,
`content/brand/` is added as the company and product registries, and "Adding a new demo site"
becomes "Adding a client project" — step 1 is now `app/(sites)/<slug>/page.tsx`, step 3 is an
entry in `content/websites/sites.ts` with `path: '/<slug>'`, and `liveUrl` is optional.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx README.md
git commit -m "feat: brand the site metadata for websitein.com"
```

---

### Task 12: Full verification gate

**Files:** none — this task proves the previous eleven.

**Interfaces:**
- Consumes: everything above.
- Produces: a shippable `main`.

- [ ] **Step 1: Unit tests**

```bash
npm test
```
Expected: `Test Files 9 passed`, `Tests 85 passed` — 70 existing, 7 contact links, 8 registries. If a count differs, read which file failed; do not adjust an assertion to match the code.

- [ ] **Step 2: Lint, comparing against the known baseline**

```bash
npm run lint 2>&1 | tail -15
```
Expected: only the pre-existing `components/sites/stock-screener/ChartPanel.tsx:115`
ref-in-cleanup warning. Any new warning is this change's fault.

- [ ] **Step 3: Production build**

```bash
npm run build 2>&1 | grep -E "Route \(app\)|^├|^┌|^└|Error|Warning"
```
Expected routes: `/`, `/store`, `/contact`, `/hair-adore`, `/savour`, `/savour/[slug]`,
`/stock-screener`, `/portfolio`, `/portfolio/demos`, `/portfolio/demos/[slug]`,
`/portfolio/resume`, `/api/stocks/{chart,news,ohlc}`. No `/(site)/` prefix anywhere.

- [ ] **Step 4: Route sweep, including a link audit**

```bash
for p in "/" "/store" "/contact" "/portfolio" "/portfolio/demos" "/portfolio/resume" "/hair-adore" "/savour" "/stock-screener"; do
  printf "%s  %s\n" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 40 "http://localhost:3000$p")" "$p"
done
curl -s http://localhost:3000/ | grep -oE 'href="(https://wa\.me/[^"]*|tel:[^"]*|mailto:[^"]*)"' | sort -u
```
Expected: nine `200`s, and the three contact href forms present with `wa.me/918238889347` spelled exactly that way.

- [ ] **Step 5: Walk the page in the browser**

```bash
open -a "Google Chrome" "http://localhost:3000/"
```
Check in order: wordmark reads **WebsiteIN**; nav is Services / Work / Contact; Services
scrolls to the products; three product cards plus the invitation card; work strip shows 3
businesses; footer carries the contact channels and Portfolio + Resume; `/store` cards open the
three sites; no card links to `/showcase/*`. Then narrow the window to 375 px and confirm the nav,
phone number and product bullets do not overflow.

- [ ] **Step 6: Confirm the personal portfolio still reads as personal**

Open `http://localhost:3000/portfolio` and `http://localhost:3000/portfolio/resume`. Both must
render as before — the resume PDF download and the three case studies are untouched by this work.

- [ ] **Step 7: Commit whatever the gate changed, then push**

```bash
git status --short
git push origin main
```
Expected: a clean status, and the push lands the rebrand on GitHub. Deployment stays with you in
the Vercel dashboard, as decided — `NEXT_PUBLIC_SITE_URL` should become `https://websitein.com`
once the domain is attached.
