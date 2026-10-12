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
