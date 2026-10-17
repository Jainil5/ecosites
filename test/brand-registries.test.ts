import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { company } from '@/content/brand/company';
import { products } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';
import { authors } from '@/content/portfolio/authors';
import { resolveRoute } from './helpers/resolve-route';

describe('products registry', () => {
  it('lists the two named apps, counter first', () => {
    expect(products.map((p) => p.slug)).toEqual(['order-book', 'market-pulse']);
  });

  it('has unique slugs', () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it('gives every product 3-4 bullets, two named halves and a one-sentence summary', () => {
    for (const product of products) {
      expect(product.bullets.length).toBeGreaterThanOrEqual(3);
      expect(product.bullets.length).toBeLessThanOrEqual(4);
      expect(product.summary.split('.').filter(Boolean).length).toBe(1);
      expect(product.title).toBe(product.title.trim());
      // Two halves is the whole read: one purchase that does both jobs.
      expect(product.modules.length).toBe(2);
      for (const module of product.modules) {
        expect(module.name.trim().length).toBeGreaterThan(0);
        expect(module.detail.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('never points a button at a route that is not built', () => {
    // ProductsGrid swaps "Open it live" for "Ask for a walkthrough" when
    // demoPath is absent, so an unresolvable path here would be a 404 link
    // the customer clicks on the way to buying something.
    for (const product of products) {
      if (!product.demoPath) continue;
      expect(resolveRoute(product.demoPath), `${product.slug} -> ${product.demoPath}`).not.toBeNull();
    }
  });
});

describe('company registry', () => {
  it('has no empty marketing fields', () => {
    expect(company.name).toBe('Website IN');
    for (const field of [company.tagline, company.pitch, company.badge]) {
      expect(field.trim().length).toBeGreaterThan(0);
    }
  });

  it('never quotes a price in marketing copy', () => {
    const text = `${company.tagline} ${company.pitch} ${products
      .map(
        (p) =>
          `${p.title} ${p.summary} ${p.modules
            .map((m) => `${m.name} ${m.detail}`)
            .join(' ')} ${p.bullets.join(' ')}`,
      )
      .join(' ')}`;
    expect(text).not.toMatch(/₹|Rs\.?|price[d]? from|starting at|\d{4,5}/);
  });

  it('sells to businesses of every size, not one city or one kind of shop', () => {
    const text = `${company.tagline} ${company.pitch}`.toLowerCase();
    expect(text).not.toContain('pune');
    expect(text).not.toMatch(/\blocal business|--shop|shops,/);
  });
});

describe('store registry', () => {
  it('points every entry at a route that exists', () => {
    for (const site of websites) {
      expect(resolveRoute(site.path), `${site.slug} -> ${site.path}`).not.toBeNull();
    }
  });

  it('has a real screenshot file for every entry', () => {
    for (const site of websites) {
      const file = path.join(process.cwd(), 'public', site.screenshot.replace(/^\//, ''));
      expect(existsSync(file), site.screenshot).toBe(true);
      // A 1x1 placeholder passes `existsSync` and renders an empty card.
      expect(statSync(file).size, site.screenshot).toBeGreaterThan(5_000);
    }
  });

  it('uses unique slugs', () => {
    expect(new Set(websites.map((w) => w.slug)).size).toBe(websites.length);
  });

  // The studio works internationally; no marketing string may pin it to one city.
  // The gallery is sold as delivered work, so no string may call itself a demo.
  it('names no city and no demo label in the gallery copy', () => {
    for (const site of websites) {
      const text = `${site.title} ${site.business} ${site.description} ${site.theme}`.toLowerCase();
      expect(text, site.slug).not.toContain('pune');
      expect(text, site.slug).not.toContain('demo');
    }
  });
});

describe('author registry', () => {
  it('names no city in the bio copy', () => {
    for (const author of authors) {
      const text = `${author.title} ${author.location} ${author.bio}`.toLowerCase();
      expect(text, author.slug).not.toContain('pune');
    }
  });
});
