import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { company } from '@/content/brand/company';
import { audiences } from '@/content/brand/audiences';
import { capabilities } from '@/content/brand/capabilities';
import { whatsappHrefMessage } from '@/content/brand/links';
import { products } from '@/content/brand/products';
import type { Proof } from '@/content/brand/proof';
import { industries } from '@/content/brand/industries';
import { processSteps } from '@/content/brand/process';
import { solutions } from '@/content/brand/solutions';
import { whyPoints } from '@/content/brand/whyus';
import { websites } from '@/content/websites/sites';
import { authors } from '@/content/portfolio/authors';
import { resolveRoute } from './helpers/resolve-route';

describe('products registry', () => {
  it('lists the four named builds, counter first', () => {
    expect(products.map((p) => p.slug)).toEqual([
      'order-book',
      'market-pulse',
      'digital-portfolio',
      'teamsync',
    ]);
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
      for (const half of product.modules) {
        expect(half.name.trim().length).toBeGreaterThan(0);
        expect(half.detail.trim().length).toBeGreaterThan(0);
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

  it('links every externally hosted product to a public https build', () => {
    for (const product of products) {
      if (!product.repoUrl) continue;
      expect(product.repoUrl, product.slug).toMatch(/^https:\/\//);
      // A product links either to an in-app demo or to an external build, never both.
      expect(product.demoPath, product.slug).toBeUndefined();
    }
  });

  it('features OrderBook with its live demo and the parent brand', () => {
    expect(products[0].title).toBe('OrderBook');
    expect(products[0].slug).toBe('order-book');
    expect(products[0].demoPath).toBe('/analytical-register');
  });
});

describe('contextual WhatsApp links', () => {
  it('encodes a custom first message once', () => {
    const href = whatsappHrefMessage(company.contact, 'Discuss an enterprise project');
    expect(href).toContain('wa.me/918238889347');
    expect(href).toContain('Discuss%20an%20enterprise%20project');
  });
});

describe('company registry', () => {
  it('has no empty marketing fields', () => {
    expect(company.name).toBe('Website & Intelligence');
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
  // The gallery is sold as delivered work, so no string may call itself a `demo`.
  // Showcase entries that are builds we made to show what we can do say
  // "demonstration" instead, which the word-boundary form below still allows.
  it('names no city and no demo label in the gallery copy', () => {
    for (const site of websites) {
      const text = `${site.title} ${site.business} ${site.description} ${site.theme}`.toLowerCase();
      expect(text, site.slug).not.toContain('pune');
      expect(text, site.slug).not.toMatch(/\bdemo\b/);
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

describe('IA registries', () => {
  it('has exactly two audiences', () => {
    expect(audiences.map((a) => a.key)).toEqual(['local', 'enterprise']);
    expect(audiences.map((a) => a.campaign)).toEqual(['Grow Online.', 'Build Smarter.']);
  });

  it('has seven capabilities, eight industries and five solutions with unique slugs', () => {
    expect(capabilities).toHaveLength(7);
    expect(industries).toHaveLength(8);
    expect(solutions).toHaveLength(5);
    for (const list of [capabilities, industries, solutions]) {
      expect(new Set(list.map((e) => e.slug)).size).toBe(list.length);
    }
  });

  it('resolves every proof path to a real route', () => {
    const proofs = [
      ...industries.map((i) => i.proof),
      ...solutions.map((s) => s.proof),
    ].filter((p): p is Proof => p !== null);
    for (const proof of proofs) {
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
      'custom-software',
      'data-and-bi',
      'ai-and-automation',
      'apis-and-integrations',
      'cloud-and-modernisation',
    ]);
  });

  it('has four process steps and five why points', () => {
    expect(processSteps.map((p) => p.name)).toEqual(['Understand', 'Plan', 'Build', 'Improve']);
    expect(whyPoints).toHaveLength(5);
  });

  it('keeps city names and prices out of registry copy', () => {
    const text = [...capabilities, ...industries, ...solutions, ...audiences, ...whyPoints]
      .map((e) => JSON.stringify(e))
      .join(' ')
      .toLowerCase();
    expect(text).not.toContain('pune');
    expect(text).not.toMatch(/₹|price[d]? from|starting at/);
  });
});
