# Website IN brand site — design

**Date:** 2026-10-12
**Status:** Approved in chat, pending written-spec review
**Scope:** Reorient the existing `ecosites` Next.js app from a personal portfolio into the
**Website IN** business site, keeping the personal portfolio reachable but demoted.

## 1. Goal

Website IN is a tech brand that puts local businesses online — websites, AI services, and
automation — at prices a small shop can pay. The site's job is to make a shop owner
understand the offer in one screen and reach us in one tap.

The base URL is the company page. It currently shows an Apps gallery, so `/` is repurposed
and the gallery moves to `/store`.

## 2. Decisions taken during brainstorming

| Decision | Outcome |
| --- | --- |
| Route map | Approach A: one rebranded shell, brand pages share the existing layout |
| `/ricoco` | Dropped from this work — no such site exists in the repo |
| Personal portfolio, resume, case studies | Kept at their current URLs, removed from primary nav |
| The three sites | Treated as **delivered client work**, not samples or templates |
| Primary call to action | WhatsApp + call + email. No price points |
| Visual identity | Rebrand the existing shell (navy `#0F172A`, green `#22C55E`, Share Tech Mono). No new palette |

## 3. Route map

Route groups are erased by Next.js, so moving pages between them changes no URLs.

| URL | Before | After |
| --- | --- | --- |
| `/` | Apps gallery | **Website IN company page** |
| `/store` | — | **Client work gallery** (the former Apps gallery) |
| `/contact` | — | **Contact page** |
| `/hair-adore` | client site | unchanged |
| `/savour`, `/savour/[slug]` | client site | unchanged |
| `/stock-screener` | client site | unchanged |
| `/portfolio` | hero + featured builds | unchanged, demoted from nav |
| `/portfolio/demos`, `/portfolio/demos/[slug]` | case studies | unchanged, demoted |
| `/portfolio/resume` | resume + PDF | unchanged, demoted |
| `/api/stocks/*` | Yahoo proxy | unchanged |

`app/(portfolio)/` is renamed to `app/(site)/` because it now carries brand pages as well as
portfolio pages, and its layout is the shared chrome for both. No URL changes.

Primary nav becomes three entries: **Services** (`/#services`, the products section on the
company page), **Work** (`/store`), **Contact** (`/contact`). The wordmark links to `/`.
`Portfolio` and `Resume` move to the footer, which is the honest position for them: they are
founder proof, not things a shop owner came to browse.

## 4. Content model

New directory `content/brand/`, following the existing registry pattern in `content/demos/`
and `content/websites/`.

```ts
// content/brand/types.ts
export interface ContactChannels {
  email: string;        // 'mail.jainil5@gmail.com'
  phone: string;        // '8238889347' — national form, no +91, no spaces
  phoneDisplay: string; // '+91 82388 89347'
  whatsappMessage: string; // prefilled first message
}

export interface Company {
  name: string;    // 'Website IN'
  tagline: string; // one line under the wordmark
  pitch: string;   // 2-3 sentences: what we do, for whom, why it is affordable
  city: string;    // 'Pune'
  contact: ContactChannels;
}

export interface Product {
  slug: string;      // 'websites' | 'ai-services' | 'automation'
  title: string;
  summary: string;   // one sentence, no jargon
  bullets: string[]; // 3-4 concrete deliverables
  icon: ProductIcon; // union of names, not an arbitrary string
}
```

`icon` is a union type (`'globe' | 'sparkles' | 'workflow'`) mapped to lucide components by a
literal record inside `ProductsGrid`. A free `string` would look fine in the registry but
resolve to `undefined` at render, because dynamic lucide names are not statically analyzable.

- `content/brand/company.ts` exports a single `company: Company`.
- `content/brand/products.ts` exports `products: Product[]` and `getProductBySlug()`.
- Three products, in order: **Websites**, **AI services**, **Automation**.
- A fourth card on the page is a static "something else — tell us what you need" invitation
  that links to `/contact`. It is deliberately not a `Product`, so it cannot be mistaken for
  a service being offered.
- Copy in `company.ts` and `products.ts` is a starting draft written once and edited in one
  place; nothing is hard-coded inside components.

`content/websites/types.ts` gains two optional fields on the existing interface so the store
can read as delivered work rather than screenshots:

```ts
liveUrl?: string; // public production URL, if the client has one
year?: number;    // when it shipped
```

Both are optional and unset today, because no external client domains are recorded in the
repo. `WebsiteCard` currently wraps the whole card in one `<Link href={site.path}>`; it
becomes: use a plain `<a target="_blank">` when `liveUrl` is present, otherwise a Next `<Link>`
to `path`. Card metadata gains the year when present.

## 5. Components

New `components/brand/`, server components with no client JS except where interaction needs it:

| Component | Responsibility | Reads |
| --- | --- | --- |
| `Hero.tsx` | Positioning, city, one CTA row (WhatsApp + call) | `company` |
| `ProductsGrid.tsx` | Product cards + invitation card, `id="services"` | `products` |
| `WorkStrip.tsx` | Client proof: count, industries, links to `/store` | `websites` |
| `ContactCta.tsx` | The three channels as buttons, reused on `/` and `/contact` | `company.contact` |

Not a component but living with them in purpose: `content/brand/links.ts` exports pure
functions `whatsappHref()`, `telHref()` and `mailtoHref()` taking `ContactChannels`.

`ContactCta` is defined once and used on the company page and the contact page, so a phone
number never exists in two files.

Existing shared components change in place, which is what makes approach A cheap: the shell
that `app/(site)/layout.tsx` already renders (`GridBackground`, skip link, `Navbar`,
`main`, `Footer`) covers every new page with no new layout.

- `components/Navbar.tsx` — wordmark `jainil` + `.dev` becomes **Website IN**; `links` array
  replaced with Services/Work/Contact.
- `components/Footer.tsx` — today it prints `resume.name` and `resume.email` and maps
  `resume.links`. It becomes: `© <year> Website IN · <city>`, the three contact channels, and
  `Portfolio` + `Resume` links. It stops importing `content/resume/data`.
- `components/WebsiteCard.tsx` — the `liveUrl` branch above.

## 6. Metadata, domain, SEO

`app/layout.tsx` currently defaults to `title: 'Jainil Patel — Software Engineer'`, a
`%s | Jainil Patel` template, a portfolio description, and
`metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com')`.

Changes: default title becomes `Website IN — websites, AI and automation for local
businesses`; template becomes `%s | Website IN`; description becomes the company pitch. The
`metadataBase` fallback becomes `https://websitein.com` so canonical tags are right even if
the env var is missing on a preview build. `/store` and `/contact` export their own
`metadata` titles, matching the pattern already used by the existing pages.

`NEXT_PUBLIC_SITE_URL` is still the switch in Vercel and remains set to the real origin —
the fallback is insurance, not a substitute.

## 7. Failure modes and handling

- **Malformed contact links.** The phone is stored once in national form; `whatsappHref()`
  strips non-digits and prepends `91` only when the result is exactly 10 digits, so a stray
  space or `+` cannot silently break a customer's only route to us. `telHref()` does the same
  normalization. This is the single highest-consequence bug available in this change, so it is
  unit-tested rather than eyeballed.
- **Store link pointing at a route that does not exist.** A registry entry's `path` is a
  string, so a typo is invisible until a visitor hits a 404. `test/brand-registries.test.ts`
  asserts every `websites[].path` resolves to a real `page.tsx` on disk, and that the
  `/#services` nav anchor exists on the company page. A nav item pointing at a missing anchor
  scrolls nowhere and reads as a broken site.
- **Empty registry.** `WorkStrip` returns `null` when `websites.length === 0` instead of
  rendering a "0 projects" section.
- **`liveUrl` present.** Uses `<a>`, not `<Link>`, and carries `rel="noopener noreferrer"`.
- **Personal pages.** `content/resume/data.ts` keeps supplying `/portfolio/resume`; nothing in
  the portfolio path is deleted, so the resume PDF route and the three case-study pages keep
  building exactly as today.

No new runtime dependencies, no new env vars, no database changes. The app still builds and
runs with an empty `.env.local`, which the existing `env.ts` / `server.ts` fallback behavior
already guarantees.

## 8. Testing

- `test/brand-contact-links.test.ts` — normalization and prefilled message encoding; asserts
  `wa.me/918238889347`, `+91 82388 89347` display, and the mailto address.
- `test/brand-registries.test.ts` — product slugs unique; every product has 3-4 bullets and a
  non-empty summary; every `websites[].path` has a corresponding `page.tsx`; every
  `screenshot` file exists under `public/`.
- Existing 70 vitest tests stay green.
- `npm run build` must emit no errors; `npm run lint` must add no new warnings.
- Route sweep on the dev server: the eleven page routes in §3 return 200, and
  `/api/stocks/ohlc?symbol=RELIANCE.NS` still returns live data.

## 9. Out of scope

Quote form and lead capture, price points or package tiers, `/ricoco`, a new visual identity,
per-client case-study pages, testimonials, blog, analytics, Hindi language support, a separate
`(business)` layout, and any change to the three client sites themselves.

## 10. Open point

`/store` is built as requested. Recorded objection: a store implies something purchasable,
while the page lists delivered client work, so `/work` would set the visitor's expectation
more accurately. Renaming later is a one-line `links` array change plus a folder rename, and
the folder name is free to become `/store` for real product packages later.
