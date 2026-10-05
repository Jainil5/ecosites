import { describe, expect, it } from 'vitest';
import { buildDishCards } from '@/components/sites/savour/dishes';
import type { MenuItemRow, PlaceRow } from '@/components/sites/savour/types';

const place = (over: Partial<PlaceRow> = {}): PlaceRow => ({
  id: 'p1', slug: 'x', name: 'X', city: 'Pune', state: 'Maharashtra', area: null, address: null,
  lat: 18.5, lng: 73.8, cuisines: ['cafe'], price_band: '₹₹', cost_for_two: null, rating: 4,
  num_reviews: 10, positive_reviews: 8, phone: null, website: null, instagram: null, hours: null,
  image_url: null, data_source: 'geo-api', verified_at: null, ...over,
});
const item = (over: Partial<MenuItemRow> = {}): MenuItemRow => ({
  id: 'i1', place_id: 'p1', name: 'Dish', course: 'main', course_rank: 0, description: null,
  price: 300, is_veg: true, is_signature: false, image_url: null, ...over,
});

describe('buildDishCards', () => {
  it('joins items to their place', () => {
    const cards = buildDishCards([place()], [item()]);
    expect(cards).toHaveLength(1);
    expect(cards[0].place.name).toBe('X');
    expect(cards[0].item.id).toBe('i1');
  });
  it('drops an item whose place is missing', () => {
    expect(buildDishCards([], [item()])).toEqual([]);
  });
  it('preserves the input item order', () => {
    const cards = buildDishCards([place()], [item({ id: 'a' }), item({ id: 'b' }), item({ id: 'c' })]);
    expect(cards.map((c) => c.item.id)).toEqual(['a', 'b', 'c']);
  });
});
