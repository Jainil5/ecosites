import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { ctaLink, footerLinks, navLinks } from '@/content/brand/nav';
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

  it('nav points only at built routes with the agreed labels', () => {
    expect(navLinks.map((l) => l.href)).toEqual([
      '/local-business',
      '/enterprise',
      '/services',
      '/products',
      '/demos',
      '/about',
    ]);
    for (const l of navLinks) expect(resolveRoute(l.href), l.href).not.toBeNull();
    expect(ctaLink).toEqual({ href: '/contact', label: 'Get Started' });
  });

  it('footer covers services first, then the audiences, then contact and portfolio', () => {
    expect(footerLinks.map((l) => l.href)).toEqual([
      '/services',
      '/local-business',
      '/enterprise',
      '/products',
      '/demos',
      '/about',
      '/contact',
      '/portfolio',
    ]);
    for (const l of footerLinks) expect(resolveRoute(l.href), l.href).not.toBeNull();
  });
});
