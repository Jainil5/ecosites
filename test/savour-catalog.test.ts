import { describe, expect, it } from 'vitest';
import { CATALOG, validateCatalog, type VenueSeed } from '@/components/sites/savour/catalog';

const ALL_BANDS: VenueSeed['place']['price_band'][] = ['₹', '₹₹', '₹₹₹', '₹₹₹₹'];

describe('catalogue validation', () => {
  it('the real catalogue is valid', () => {
    expect(validateCatalog(CATALOG)).toEqual([]);
  });
  it('has exactly 12 venues', () => {
    expect(CATALOG).toHaveLength(12);
  });
  it('covers all four price bands', () => {
    expect(new Set(CATALOG.map((v) => v.place.price_band))).toEqual(new Set(ALL_BANDS));
  });
  it('rejects duplicate slugs', () => {
    expect(validateCatalog([CATALOG[0], CATALOG[0]]).join('\n')).toContain('duplicate slug');
  });
  it('rejects a venue with too few dishes, signatures or reviews', () => {
    // dishes[0] is a signature at every venue, so take a non-signature to isolate the
    // "needs at least 1 signature" rule from the "needs at least 8 dishes" rule.
    const thin: VenueSeed = {
      place: { ...CATALOG[0].place, slug: 'thin-one' },
      dishes: [CATALOG[0].dishes.find((d) => !d.is_signature) ?? CATALOG[0].dishes[0]],
      reviews: [],
    };
    const errs = validateCatalog([thin]);
    expect(errs).toContain('thin-one: needs at least 8 dishes');
    expect(errs).toContain('thin-one: needs at least 1 signature dish');
    expect(errs).toContain('thin-one: needs at least 3 reviews');
  });
  it('rejects a price outside its band and positive_reviews above num_reviews', () => {
    const bad: VenueSeed = {
      place: { ...CATALOG[0].place, slug: 'bad-prices', num_reviews: 5, positive_reviews: 9 },
      dishes: CATALOG[0].dishes.map((d, i) => (i === 0 ? { ...d, price: 9999 } : d)),
      reviews: CATALOG[0].reviews,
    };
    const errs = validateCatalog([bad]);
    expect(errs.some((e) => e.includes('out of band'))).toBe(true);
    expect(errs).toContain('bad-prices: positive_reviews exceeds num_reviews');
  });
  it('rejects a malformed verified_at and out-of-town coords', () => {
    const bad: VenueSeed = {
      ...CATALOG[0],
      place: { ...CATALOG[0].place, slug: 'bad-date', verified_at: '04/10/2026', lat: 12.9, lng: 77.5 },
    };
    const errs = validateCatalog([bad]);
    expect(errs).toContain('bad-date: verified_at must be YYYY-MM-DD');
    expect(errs).toContain('bad-date: coords outside Pune bounding box');
  });
});
