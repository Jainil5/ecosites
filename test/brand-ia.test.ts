import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { ctaLink, footerLinks, navGroups, navLinks, navSections, searchIndex } from '@/content/brand/nav';
import { productGroups, products as catalogue } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';
import { siteUrl } from '@/content/brand/site';
import { resolveRoute } from './helpers/resolve-route';

// Phase 1 routes: everything the rebrand ships or keeps indexable.
const PHASE1 = [
  '/',
  '/services',
  '/local-business',
  '/enterprise',
  '/about',
  '/contact',
  '/products',
  '/demos',
  '/store',
];

describe('Phase 1 IA', () => {
  it('serves every phase-1 route', () => {
    for (const route of PHASE1) expect(resolveRoute(route), route).not.toBeNull();
  });

  it('lists every phase-1 route exactly once in the sitemap', () => {
    const urls = (sitemap() as { url: string }[]).map((entry) => entry.url);
    for (const route of PHASE1) {
      const count = urls.filter((u) => u === `${siteUrl}${route}`).length;
      expect(count, route).toBe(1);
    }
  });

  it('lists every product page and counter once, and nothing twice', () => {
    const urls = (sitemap() as { url: string }[]).map((entry) => entry.url);
    for (const route of [
      '/orderbook',
      '/orderbook/coffee-cups-demo',
      '/orderbook/hair-adore-demo',
      '/orderbook/ember-larder-demo',
    ]) {
      expect(urls.filter((u) => u === `${siteUrl}${route}`).length, route).toBe(1);
    }
    // A path can be reachable from two registries at once — a product page that
    // is also a delivered site — and must still be listed a single time.
    expect(new Set(urls).size, 'duplicate urls in the sitemap').toBe(urls.length);
  });

  it('nav points only at built routes with the agreed labels', () => {
    expect(navLinks.map((l) => l.href)).toEqual(['/services', '/products', '/about']);
    for (const l of navLinks) expect(resolveRoute(l.href), l.href).not.toBeNull();
    expect(ctaLink).toEqual({ href: '/contact', label: 'Get Started' });
  });

  it('keeps Work off the bar without stranding it', () => {
    // The tab is gone, so the way in has to be somewhere else — otherwise
    // /demos and the twenty-something sites it indexes drop out of the
    // navigation entirely.
    expect(navLinks.map((l) => l.href)).not.toContain('/demos');
    expect(footerLinks.map((l) => l.href)).toContain('/demos');
    const products = navGroups.find((group) => group.href === '/products');
    expect(products?.footer.href).toBe('/demos');
    expect(searchIndex.map((row) => row.href)).toContain('/demos');
    // And the sites the Work panel used to list are still searchable by name.
    const hrefs = searchIndex.map((row) => row.href);
    for (const site of websites) expect(hrefs, site.path).toContain(site.path);
  });

  it('reads the Products panel by shelf, every system exactly once', () => {
    const products = navGroups.find((group) => group.href === '/products');
    expect(products).toBeDefined();
    const sections = navSections(products!);
    // Headings are the catalogue's own shelves, in the catalogue's order, and a
    // shelf with nothing on it draws nothing.
    expect(sections.map((s) => s.label)).toEqual(
      productGroups
        .filter((group) => catalogue.some((p) => p.group === group.id))
        .map((group) => group.label),
    );
    for (const product of catalogue) {
      const home = sections.filter((s) =>
        s.rows.some((row) => row.href === `/products#${product.slug}`),
      );
      expect(home.length, product.slug).toBe(1);
      expect(home[0].label, product.slug).toBe(
        productGroups.find((group) => group.id === product.group)?.label,
      );
    }
    // The heading says what kind of system a row is, so the row itself no
    // longer repeats it in a tag.
    expect(sections.flatMap((s) => s.rows).every((row) => !row.tag)).toBe(true);
    // A flat group still renders as one unlabelled block.
    const services = navSections(navGroups.find((group) => group.href === '/services')!);
    expect(services).toHaveLength(1);
    expect(services[0].label).toBeNull();
  });

  it('audiences live only in the footer, never in the nav', () => {
    expect(navLinks.map((l) => l.href)).not.toContain('/local-business');
    expect(navLinks.map((l) => l.href)).not.toContain('/enterprise');
    expect(footerLinks.map((l) => l.href)).toContain('/local-business');
    expect(footerLinks.map((l) => l.href)).toContain('/enterprise');
  });

  it('footer covers services first, then the audiences, then contact', () => {
    expect(footerLinks.map((l) => l.href)).toEqual([
      '/services',
      '/local-business',
      '/enterprise',
      '/products',
      '/demos',
      '/about',
      '/contact',
    ]);
    for (const l of footerLinks) expect(resolveRoute(l.href), l.href).not.toBeNull();
  });

  it('keeps the personal portfolio out of the brand navigation', () => {
    // The /portfolio pages stay built, but the brand site does not advertise
    // them: no footer link, no nav panel row, nothing in the search index.
    const navHrefs = [...navLinks, ...footerLinks].map((l) => l.href);
    expect(navHrefs).not.toContain('/portfolio');
    const menuHrefs = navGroups.flatMap((g) => [...g.rows, g.footer].map((r) => r.href));
    for (const href of [...menuHrefs, ...searchIndex.map((r) => r.href)]) {
      expect(href, href).not.toContain('/portfolio');
    }
  });
});
