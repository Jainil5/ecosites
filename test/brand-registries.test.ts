import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { company } from '@/content/brand/company';
import { products } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';
import { resolveRoute } from './helpers/resolve-route';

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
    for (const field of [company.tagline, company.pitch, company.badge]) {
      expect(field.trim().length).toBeGreaterThan(0);
    }
  });

  it('never quotes a price in marketing copy', () => {
    const text = `${company.tagline} ${company.pitch} ${products
      .map((p) => `${p.title} ${p.summary} ${p.bullets.join(' ')}`)
      .join(' ')}`;
    expect(text).not.toMatch(/₹|Rs\.?|price[d]? from|starting at/);
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
});
