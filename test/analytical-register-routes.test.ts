// test/analytical-register-routes.test.ts
//
// OrderBook is one product with several counters, and each counter now has its
// own address. That is the promise this file holds: the URL picks the business,
// the page says so in its own title, and the old address still lands somewhere.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { counterPath, editions } from '@/components/sites/analytical-register/editions';
import { websites } from '@/content/websites/sites';
import { products } from '@/content/brand/products';
import { resolveRoute } from './helpers/resolve-route';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
const intro = read('app/(sites)/orderbook/page.tsx');
const counter = read('app/(sites)/orderbook/[counter]/page.tsx');

describe('the orderbook addresses', () => {
  it('introduces the product at /orderbook and opens each counter underneath it', () => {
    expect(resolveRoute('/orderbook'), '/orderbook').not.toBeNull();
    for (const edition of editions) {
      expect(resolveRoute(counterPath(edition)), counterPath(edition)).not.toBeNull();
    }
    expect(intro).toMatch(/<OrderBook \/>/);
  });

  it('builds one page per counter, and no page for an unknown one', () => {
    // Static params, so each counter is a real address in the sitemap and in
    // the browser cache — not a query string on somebody else's page.
    expect(counter).toMatch(/generateStaticParams\(\)[\s\S]*editions\.map\(\(e\) => \(\{ counter: e\.counter \}\)\)/);
    expect(counter).toMatch(/editionByCounter\(\(await params\)\.counter\)/);
    expect(counter).toMatch(/if \(!edition\) notFound\(\)/);
    // A counter's address opens the till, because the reader already chose it.
    expect(counter).toMatch(/<OrderBook edition=\{edition\.id\} initialView=["']register["'] \/>/);
  });

  it('names the business in the title and says what is on that counter', () => {
    expect(counter).toMatch(/title: `\$\{edition\.label\} — \$\{edition\.brand\.name\}’s till`/);
    // The description is built from the catalogue, so it cannot drift from it.
    expect(counter).toMatch(/edition\.menu\.filter\(\(m\) => m\.active\)\.length/);
    expect(counter).toMatch(/edition\.brand\.gstRate \* 100/);
    expect(counter).toMatch(/edition\.profile\.openHour/);
  });

  it('carries the counters into the work gallery, one card each', () => {
    const orderBookSites = websites.filter((w) => w.path.startsWith('/orderbook/'));
    expect(orderBookSites.map((w) => w.path)).toEqual(editions.map((e) => counterPath(e)));
    for (const site of orderBookSites) {
      expect(site.screenshot, site.slug).toMatch(/^\/showcase\/orderbook-/);
      expect(site.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
    // The product itself still points at the introduction, not one counter.
    expect(products[0].demoPath).toBe('/orderbook');
  });

  it('keeps the old address working', () => {
    // Cards, bookmarks and shared links were written against the internal slug.
    const config = read('next.config.mjs');
    expect(config).toMatch(/source: '\/analytical-register', destination: '\/orderbook', permanent: true/);
  });

  it('does not advertise a counter that has no page', () => {
    // The gallery, the sitemap and the introduction all read the same list, so a
    // counter added to one without the other would 404 in public.
    for (const edition of editions) {
      expect(resolveRoute(counterPath(edition)), counterPath(edition)).not.toBeNull();
      expect(websites.some((w) => w.path === counterPath(edition)), edition.id).toBe(true);
    }
  });
});
