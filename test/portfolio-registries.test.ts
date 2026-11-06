import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { authors, getAllAuthorSlugs, getAuthorBySlug } from '@/content/portfolio/authors';
import { sites } from '@/content/demos/sites';
import { websites, getWebsitesByAuthor } from '@/content/websites/sites';
import { resolveRoute } from './helpers/resolve-route';

describe('portfolio authors registry', () => {
  it('has unique slugs and serves every author route', () => {
    expect(new Set(authors.map((a) => a.slug)).size).toBe(authors.length);
    for (const author of authors) {
      expect(resolveRoute(`/portfolio/${author.slug}`), author.slug).not.toBeNull();
    }
  });

  it('keeps jainil-patel available by slug', () => {
    expect(getAllAuthorSlugs()).toContain('jainil-patel');
    expect(getAuthorBySlug('jainil-patel')?.name).toBe('Jainil Patel');
    expect(getAuthorBySlug('nobody')).toBeUndefined();
  });

  it('has no empty bio, stack, name or title', () => {
    for (const author of authors) {
      expect(author.name.trim().length).toBeGreaterThan(0);
      expect(author.title.trim().length).toBeGreaterThan(0);
      expect(author.bio.trim().length).toBeGreaterThan(0);
      expect(author.stack.length).toBeGreaterThan(0);
      expect(author.slug).toBe(author.slug.toLowerCase());
      expect(author.slug).not.toMatch(/[\s_]/);
    }
  });

  it('links only to external profiles', () => {
    for (const author of authors) {
      for (const link of author.links) {
        expect(link.href, `${author.slug} ${link.label}`).toMatch(/^https?:\/\//);
        expect(link.label.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe('case studies registry', () => {
  it('tags every case study with an author that exists', () => {
    for (const site of sites) {
      expect(getAuthorBySlug(site.author), `${site.slug} -> ${site.author}`).toBeDefined();
    }
  });

  it('serves a detail route for every case study under its author', () => {
    for (const site of sites) {
      const route = `/portfolio/${site.author}/work/${site.slug}`;
      expect(resolveRoute(route), route).not.toBeNull();
    }
  });

  it('has a real preview file whenever a case study points at one', () => {
    for (const site of sites) {
      if (!site.screenshot) continue;
      const file = path.join(process.cwd(), 'public', site.screenshot.replace(/^\//, ''));
      expect(existsSync(file), site.screenshot).toBe(true);
      // A 1x1 placeholder passes `existsSync` and renders an empty card.
      expect(statSync(file).size, site.screenshot).toBeGreaterThan(5_000);
    }
  });

  it('has unique slugs per author', () => {
    const keys = sites.map((s) => `${s.author}/${s.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('delivered websites on the builder work page', () => {
  it('attributes every delivered website to an author that exists', () => {
    for (const site of websites) {
      expect(getAuthorBySlug(site.author), `${site.slug} -> ${site.author}`).toBeDefined();
    }
  });

  it('lists the delivered sites of an author in registry order', () => {
    expect(getWebsitesByAuthor('jainil-patel').map((s) => s.slug)).toEqual([
      'hair-adore',
      'stock-screener',
      'brewery-cafe',
      'savour',
      'orderbook-cafes',
      'orderbook-salons',
      'orderbook-kitchens',
      'namesake',
      'ember-larder',
      'ruhani',
    ]);
    expect(getWebsitesByAuthor('nobody')).toEqual([]);
  });
});
