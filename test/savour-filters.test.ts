import { describe, expect, it } from 'vitest';
import { applyFilters, availableCities, availableCuisines, bandRank, filterPlaces } from '@/components/sites/savour/filters';
import { EMPTY_FILTERS, type DishCard, type MenuItemRow, type PlaceRow, type PriceBand } from '@/components/sites/savour/types';

const place = (over: Partial<PlaceRow> = {}): PlaceRow => ({
  id: 'p1', slug: 'x', name: 'X', city: 'Pune', state: 'Maharashtra', area: null, address: null,
  lat: null, lng: null, cuisines: ['cafe'], price_band: '₹₹', cost_for_two: null, rating: 4,
  num_reviews: 10, positive_reviews: 8, phone: null, website: null, instagram: null, hours: null,
  image_url: null, data_source: 'geo-api', verified_at: null, ...over,
});
const item = (over: Partial<MenuItemRow> = {}): MenuItemRow => ({
  id: 'i1', place_id: 'p1', name: 'Dish', course: 'main', course_rank: 0, description: null,
  price: 300, is_veg: true, is_signature: false, image_url: null, ...over,
});
const card = (i: Partial<MenuItemRow>, p: Partial<PlaceRow> = {}): DishCard => ({ item: item(i), place: place(p) });

const CARDS = [
  card({ id: 'a', name: 'Paneer Tikka', price: 300 }, { id: 'p1', rating: 4.5, cuisines: ['italian', 'cafe'] }),
  card({ id: 'b', name: 'Butter Chicken', price: 620, is_veg: false }, { id: 'p2', name: 'Y', slug: 'y', rating: 4.1, cuisines: ['north_indian'], price_band: '₹₹₹' }),
  card({ id: 'c', name: 'Magar Fish', price: 780, is_veg: false }, { id: 'p3', name: 'Z', slug: 'z', rating: 4.9, cuisines: ['bengali'], city: 'Mumbai' }),
  card({ id: 'd', name: 'Unknown Veg', price: 100, is_veg: null }, { id: 'p4', name: 'W', slug: 'w', rating: null, cuisines: [] }),
];
const NONE = new Set<string>();
const ids = (cs: DishCard[]) => cs.map((c) => c.item.id);

describe('bandRank', () => {
  it('orders the four bands', () => {
    const bands: PriceBand[] = ['₹', '₹₹', '₹₹₹', '₹₹₹₹'];
    expect(bands.map(bandRank)).toEqual([1, 2, 3, 4]);
  });
});

describe('available facets', () => {
  it('lists each cuisine once, sorted', () => {
    expect(availableCuisines(CARDS)).toEqual(['bengali', 'cafe', 'italian', 'north_indian']);
  });
  it('lists cities sorted', () => {
    expect(availableCities(CARDS)).toEqual(['Mumbai', 'Pune']);
  });
});

describe('applyFilters', () => {
  it('sorts by rating descending with nulls last', () => {
    expect(ids(applyFilters(CARDS, EMPTY_FILTERS, NONE))).toEqual(['c', 'a', 'b', 'd']);
  });
  it('matches name, description and place name case-insensitively', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, q: 'tikka' }, NONE))).toEqual(['a']);
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, q: 'magar fish' }, NONE))).toEqual(['c']);
  });
  it('treats multiple cuisines as any-of', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, cuisines: ['bengali', 'italian'] }, NONE))).toEqual(['c', 'a']);
  });
  it('filters by city', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, city: 'Mumbai' }, NONE))).toEqual(['c']);
  });
  it('excludes unknown-veg when vegOnly is on', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, vegOnly: true }, NONE))).toEqual(['a']);
  });
  it('filters by price band', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, bands: ['₹₹₹'] }, NONE))).toEqual(['b']);
  });
  it('sorts by price in both directions', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, sort: 'price-asc' }, NONE))).toEqual(['d', 'a', 'b', 'c']);
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, sort: 'price-desc' }, NONE))).toEqual(['c', 'b', 'a', 'd']);
  });
  it('sorts by dish name', () => {
    expect(applyFilters(CARDS, { ...EMPTY_FILTERS, sort: 'name' }, NONE).map((c) => c.item.name)).toEqual([
      'Butter Chicken',
      'Magar Fish',
      'Paneer Tikka',
      'Unknown Veg',
    ]);
  });
  it('puts saved dishes first under the saved sort', () => {
    expect(ids(applyFilters(CARDS, { ...EMPTY_FILTERS, sort: 'saved' }, new Set(['c'])))).toEqual(['c', 'a', 'b', 'd']);
  });
  it('breaks ties predictably so re-renders do not reshuffle', () => {
    const first = ids(applyFilters(CARDS, EMPTY_FILTERS, NONE)).join();
    for (let i = 0; i < 5; i++) expect(ids(applyFilters(CARDS, EMPTY_FILTERS, NONE)).join()).toBe(first);
  });
  it('does not mutate the input array', () => {
    const before = ids(CARDS);
    applyFilters(CARDS, { ...EMPTY_FILTERS, sort: 'price-desc' }, NONE);
    expect(ids(CARDS)).toEqual(before);
  });
});

// Two dishes at p1 and a veg dish at p2 so the venue-side rules are exercised
// against groups rather than single cards.
const PLACE_CARDS = [
  card({ id: 'a', name: 'Paneer Tikka', price: 300 }, { id: 'p1', name: 'Alpha', slug: 'alpha', rating: 4.5, cuisines: ['italian', 'cafe'], cost_for_two: 800 }),
  card({ id: 'a2', name: 'Garlic Bread', price: 250 }, { id: 'p1', name: 'Alpha', slug: 'alpha', rating: 4.5, cuisines: ['italian', 'cafe'], cost_for_two: 800 }),
  card({ id: 'b', name: 'Butter Chicken', price: 620, is_veg: false }, { id: 'p2', name: 'Bravo', slug: 'bravo', rating: 4.1, cuisines: ['north_indian'], price_band: '₹₹₹', cost_for_two: 1200 }),
  card({ id: 'b2', name: 'Paneer Roll', price: 320, is_veg: true }, { id: 'p2', name: 'Bravo', slug: 'bravo', rating: 4.1, cuisines: ['north_indian'], price_band: '₹₹₹', cost_for_two: 1200 }),
  card({ id: 'c', name: 'Magar Fish', price: 780, is_veg: false }, { id: 'p3', name: 'Charlie', slug: 'charlie', rating: 4.9, cuisines: ['bengali'], city: 'Mumbai', cost_for_two: 900 }),
  card({ id: 'd', name: 'Unknown Veg', price: 100, is_veg: null }, { id: 'p4', name: 'Delta', slug: 'delta', rating: null, cuisines: [], cost_for_two: null }),
];
const pids = (ps: PlaceRow[]) => ps.map((p) => p.id);

describe('filterPlaces', () => {
  it('collapses each venue to one row and sorts by rating, nulls last', () => {
    expect(pids(filterPlaces(PLACE_CARDS, EMPTY_FILTERS, NONE))).toEqual(['p3', 'p1', 'p2', 'p4']);
  });
  it('matches the search through the venue name', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, q: 'charlie' }, NONE))).toEqual(['p3']);
  });
  it('matches the search through one of the venue\'s dishes', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, q: 'garlic bread' }, NONE))).toEqual(['p1']);
  });
  it('treats multiple cuisines as any-of', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, cuisines: ['bengali', 'italian'] }, NONE))).toEqual(['p3', 'p1']);
  });
  it('filters by city and price band', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, city: 'Mumbai' }, NONE))).toEqual(['p3']);
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, bands: ['₹₹₹'] }, NONE))).toEqual(['p2']);
  });
  it('keeps a mixed venue under vegOnly because it serves a veg dish', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, vegOnly: true }, NONE))).toEqual(['p1', 'p2']);
  });
  it('sorts by venue name', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, sort: 'name' }, NONE))).toEqual(['p1', 'p2', 'p3', 'p4']);
  });
  it('sorts by cost for two with unknown cost last', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, sort: 'price-asc' }, NONE))).toEqual(['p1', 'p3', 'p2', 'p4']);
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, sort: 'price-desc' }, NONE))).toEqual(['p2', 'p3', 'p1', 'p4']);
  });
  it('sorts by how many of the venue\'s dishes are saved', () => {
    expect(pids(filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, sort: 'saved' }, new Set(['a', 'a2', 'c'])))).toEqual(['p1', 'p3', 'p2', 'p4']);
  });
  it('does not mutate the input array', () => {
    const before = PLACE_CARDS.map((c) => c.item.id);
    filterPlaces(PLACE_CARDS, { ...EMPTY_FILTERS, sort: 'price-desc' }, NONE);
    expect(PLACE_CARDS.map((c) => c.item.id)).toEqual(before);
  });
});
