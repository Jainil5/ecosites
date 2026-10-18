import { describe, expect, it } from 'vitest';
import { industries } from '@/content/brand/industries';
import { products } from '@/content/brand/products';
import { resolveRoute } from './helpers/resolve-route';

/**
 * Data contracts the homepage bands render from. The bands themselves are
 * server components; the repo tests registries, not DOM — a band may only
 * show what these assertions prove exists.
 */
describe('homepage band contracts', () => {
  it('industry cards only reference routes that exist', () => {
    for (const industry of industries) {
      if (!industry.proof) continue;
      expect(resolveRoute(industry.proof.path), industry.slug).not.toBeNull();
    }
  });

  it('features OrderBook first with a live demo', () => {
    expect(products[0].title).toBe('OrderBook');
    expect(products[0].demoPath).toBe('/analytical-register');
  });
});
