import { readFileSync } from 'node:fs';
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

describe('landing composition after the audience IA trim', () => {
  it('home no longer renders the audience split', () => {
    const home = readFileSync('app/(site)/page.tsx', 'utf8');
    expect(home).not.toMatch(/AudiencePaths/);
  });

  it('hero CTAs point at contact and work, not at the audience paths', () => {
    const hero = readFileSync('components/brand/Hero.tsx', 'utf8');
    expect(hero).toMatch(/href=["']\/contact["']/);
    expect(hero).toMatch(/href=["']\/demos["']/);
    expect(hero).not.toMatch(/audiences\[\d\]/);
    expect(hero).not.toMatch(/Explore Enterprise Solutions/);
  });

  it('section indices stay gapless after dropping the industry band', () => {
    const home = readFileSync('app/(site)/page.tsx', 'utf8');
    expect(home).toMatch(/index:\s*'02'/); // services heading prop
    expect(home).not.toMatch(/IndustryGrid/);
    expect(home).toMatch(/>07</); // closing next-step band
    const product = readFileSync('components/brand/ProductFeature.tsx', 'utf8');
    expect(product).toMatch(/>03</);
    const process = readFileSync('components/brand/ProcessBand.tsx', 'utf8');
    expect(process).toMatch(/index="04"/);
    const work = readFileSync('components/brand/WorkStrip.tsx', 'utf8');
    expect(work).toMatch(/index="05"/);
    const why = readFileSync('components/brand/WhyUs.tsx', 'utf8');
    expect(why).toMatch(/index="06"/);
  });
});
