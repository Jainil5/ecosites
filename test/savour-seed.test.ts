import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/components/sites/savour/catalog';
import { buildSeedSql, gen, q } from '../scripts/savour-seed';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/;
const sql = buildSeedSql(CATALOG);

describe('gen', () => {
  it('is deterministic and uuid-shaped', () => {
    expect(gen('barbeque-nation-kalyani-nagar')).toBe(gen('barbeque-nation-kalyani-nagar'));
    expect(gen('x')).toMatch(UUID_RE);
    expect(new Set(CATALOG.map((v) => gen(v.place.slug))).size).toBe(12);
  });
});

describe('q', () => {
  it('doubles single quotes', () => {
    expect(q("Barbeque Nation's")).toBe("'Barbeque Nation''s'");
  });
  it('renders null and numbers unquoted', () => {
    expect(q(null)).toBe('null');
    expect(q(429)).toBe('429');
  });
  it('cannot be escaped out of by injected data', () => {
    expect(q("a'); drop table public.places; --")).toBe("'a''); drop table public.places; --'");
  });
});

describe('buildSeedSql', () => {
  it('emits one venue block per venue', () => {
    expect((sql.match(/^-- venue: /gm) ?? []).length).toBe(12);
  });
  it('is idempotent on all three tables', () => {
    // One statement block per venue, each with its own conflict clause.
    expect((sql.match(/on conflict \(slug\) do update set/g) ?? []).length).toBe(12);
    expect((sql.match(/on conflict \(place_id, name\) do update set/g) ?? []).length).toBe(12);
    expect((sql.match(/on conflict \(id\) do nothing/g) ?? []).length).toBe(12);
  });
  it('separates value tuples with commas, not statements', () => {
    // A `);` between two tuples ends the INSERT early and the paste fails in the Dashboard.
    expect(sql).not.toMatch(/\);\n\s*\(/);
    expect((sql.match(/^insert into/gm) ?? []).length).toBe(36);
  });
  it('refuses to build from an invalid catalogue', () => {
    expect(() => buildSeedSql(CATALOG.slice(0, 1))).toThrow(/expected 12 venues/);
  });
  it('carries every dish and review with a stable id', () => {
    const dishes = CATALOG.reduce((n, v) => n + v.dishes.length, 0);
    const reviews = CATALOG.reduce((n, v) => n + v.reviews.length, 0);
    expect((sql.match(/#dish#/g) ?? []).length).toBe(0); // ids are hashed, not literal keys
    expect(dishes).toBeGreaterThanOrEqual(96);
    expect(reviews).toBeGreaterThanOrEqual(36);
    for (const v of CATALOG) expect(sql).toContain(`'${gen(v.place.slug)}'`);
  });
});
