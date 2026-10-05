import { describe, expect, it } from 'vitest';
import {
  mapOverpassToPlace,
  parseCuisines,
  parseHours,
  slugify,
  type OverpassElement,
} from '@/components/sites/savour/osm';

const bbq: OverpassElement = {
  type: 'way',
  id: 449928800,
  center: { lat: 18.5622723, lon: 73.8444385 },
  tags: {
    name: 'Barbeque Nation',
    amenity: 'restaurant',
    cuisine: 'north_indian;multi_cuisine',
    'addr:city': 'Pune',
    'addr:state': 'Maharashtra',
    'addr:suburb': 'Kalyani Nagar',
    'addr:full': '344/2, North Main Road, Koregaon Park',
    phone: '+91 20 3950 6000',
    website: 'https://www.barbenationindia.com',
    opening_hours: 'Mo-Th 12:00-15:30,19:00-23:00; Fr-Su 12:00-23:30',
  },
};

const pagdandi: OverpassElement = {
  type: 'node',
  id: 9271528049,
  lat: 18.5289271,
  lon: 73.8738004,
  tags: { name: 'Pagdandi', amenity: 'cafe', 'addr:city': 'Pune' },
};

describe('slugify', () => {
  it('kebab-cases a name and appends the area', () => {
    expect(slugify("Barbeque Nation's", 'JM Road')).toBe('barbeque-nations-jm-road');
  });
  it('strips leading and doubled separators', () => {
    expect(slugify('  The  =Cafe  ')).toBe('the-cafe');
  });
});

describe('parseCuisines', () => {
  it('splits on both separators and renames OSM tags', () => {
    expect(parseCuisines('coffee_shop;regional,all_in_caffe')).toEqual(['coffee', 'maharashtrian', 'cafe']);
  });
  it('returns an empty array when absent', () => {
    expect(parseCuisines(undefined)).toEqual([]);
  });
  it('de-duplicates', () => {
    expect(parseCuisines('italian;italian,pizza')).toEqual(['italian', 'pizza']);
  });
});

describe('parseHours', () => {
  it('expands a day range and keeps multi-block days', () => {
    const h = parseHours(bbq.tags?.['opening_hours']);
    expect(h?.Mo).toEqual(['12:00-15:30', '19:00-23:00']);
    expect(h?.Sa).toEqual(['12:00-23:30']);
    expect(h?.Su).toEqual(['12:00-23:30']);
    expect(Object.keys(h ?? {})).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  });
  it('returns null for garbage or absent input', () => {
    expect(parseHours('open whenever')).toBeNull();
    expect(parseHours(undefined)).toBeNull();
  });
});

describe('mapOverpassToPlace', () => {
  it('maps a way using its center coords', () => {
    const p = mapOverpassToPlace(bbq);
    expect(p).not.toBeNull();
    expect(p!.slug).toBe('barbeque-nation-kalyani-nagar');
    expect(p!.lat).toBeCloseTo(18.5622723, 5);
    expect(p!.lng).toBeCloseTo(73.8444385, 5);
    expect(p!.cuisines).toEqual(['north_indian', 'multi_cuisine']);
    expect(p!.city).toBe('Pune');
    expect(p!.state).toBe('Maharashtra');
    expect(p!.num_reviews).toBe(0);
    expect(p!.positive_reviews).toBe(0);
    expect(p!.rating).toBeNull();
    expect(p!.price_band).toBe('₹₹₹');
    expect(p!.data_source).toBe('geo-api');
    expect(p!.phone).toBe('+91 20 3950 6000');
  });
  it('maps a node and defaults state', () => {
    const p = mapOverpassToPlace(pagdandi);
    expect(p!.lat).toBeCloseTo(18.5289271, 5);
    expect(p!.state).toBe('Maharashtra');
    expect(p!.cuisines).toEqual([]);
    expect(p!.hours).toBeNull();
  });
  it('rejects unnamed and non-food elements', () => {
    expect(
      mapOverpassToPlace({ type: 'node', id: 1, lat: 1, lon: 1, tags: { amenity: 'restaurant' } }),
    ).toBeNull();
    expect(
      mapOverpassToPlace({ type: 'node', id: 2, lat: 1, lon: 1, tags: { name: 'Shell', shop: 'car_repair' } }),
    ).toBeNull();
  });
});
