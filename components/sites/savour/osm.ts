import { num, type PlaceRow, type PriceBand } from './types';

export interface OverpassTags {
  [k: string]: string | undefined;
}
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OverpassTags;
}

export const FOOD_AMENITIES = new Set(['restaurant', 'cafe', 'fast_food', 'food_court', 'bar', 'pub']);

export const CUISINE_RENAMES: Record<string, string> = {
  coffee_shop: 'coffee',
  regional: 'maharashtrian',
  all_in_caffe: 'cafe',
  ice_lemon_tea: 'tea',
};

const BAND_BY_AMENITY: Record<string, PriceBand> = {
  restaurant: '₹₹₹',
  cafe: '₹₹',
  fast_food: '₹',
  food_court: '₹',
  bar: '₹₹₹₹',
  pub: '₹₹₹',
};

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function slugify(name: string, area?: string | null): string {
  return `${name}-${area ?? ''}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCuisines(raw: string | undefined): string[] {
  if (!raw) return [];
  const out: string[] = [];
  for (const piece of raw.split(/[;,]/)) {
    const t = piece.trim().toLowerCase().replace(/\s+/g, '_');
    if (!t) continue;
    const renamed = CUISINE_RENAMES[t] ?? t;
    if (!out.includes(renamed)) out.push(renamed);
  }
  return out;
}

function expandDays(spec: string): string[] {
  const s = spec.trim();
  const norm = (x: string) => x[0].toUpperCase() + x.slice(1).toLowerCase();
  if (/^(mo-su|daily|week)$/i.test(s)) return [...DAYS];
  const range = s.match(/^([A-Za-z]{2})-([A-Za-z]{2})$/);
  if (range) {
    const a = DAYS.indexOf(norm(range[1]));
    const b = DAYS.indexOf(norm(range[2]));
    if (a !== -1 && b !== -1 && b >= a) return DAYS.slice(a, b + 1);
    return [];
  }
  return /^[A-Za-z]{2}$/.test(s) && DAYS.includes(norm(s)) ? [norm(s)] : [];
}

const TIME_BLOCK = /^\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?(?:,\d{1,2}:\d{2}-\d{1,2}:\d{2})*$/;

export function parseHours(raw: string | undefined): Record<string, string[]> | null {
  if (!raw) return null;
  const out: Record<string, string[]> = {};
  let matched = false;
  for (const block of raw.split(';')) {
    const b = block.trim();
    if (!b || b.toUpperCase() === 'CLOSED') continue;
    const parts = b.split(/\s+/);
    if (parts.length < 2) continue;
    const times = parts[parts.length - 1];
    if (!TIME_BLOCK.test(times)) continue;
    const days = parts.slice(0, -1).flatMap(expandDays);
    if (days.length === 0) continue;
    matched = true;
    for (const d of days) {
      const list = out[d] ?? (out[d] = []);
      for (const t of times.split(',')) if (!list.includes(t)) list.push(t);
    }
  }
  if (!matched) return null;
  const ordered: Record<string, string[]> = {};
  for (const d of DAYS) if (out[d]) ordered[d] = out[d];
  return ordered;
}

export function mapOverpassToPlace(el: OverpassElement): PlaceRow | null {
  const t = el.tags ?? {};
  const name = (t['name'] ?? t['int_name'] ?? '').trim();
  const kind = t['amenity'];
  if (!name || !kind || !FOOD_AMENITIES.has(kind)) return null;

  const lat = num(el.lat ?? el.center?.lat);
  const lng = num(el.lon ?? el.center?.lon);
  if (lat === null || lng === null) return null;

  const area = t['addr:suburb'] ?? t['addr:street'] ?? null;
  const slug = slugify(name, area);
  if (!slug) return null;

  return {
    id: `${el.type[0]}${el.id}`,
    slug,
    name,
    city: t['addr:city'] ?? 'Pune',
    state: t['addr:state'] ?? 'Maharashtra',
    area,
    address: t['addr:full'] ?? null,
    lat,
    lng,
    cuisines: parseCuisines(t['cuisine'] ?? t['food'] ?? t['cuisine:description']),
    price_band: BAND_BY_AMENITY[kind],
    cost_for_two: null,
    rating: null,
    num_reviews: 0,
    positive_reviews: 0,
    phone: t['phone'] ?? t['contact:phone'] ?? null,
    website: t['website'] ?? t['contact:website'] ?? null,
    instagram: t['contact:instagram'] ?? null,
    hours: parseHours(t['opening_hours']),
    image_url: null,
    data_source: 'geo-api',
    verified_at: null,
  };
}

export const QUERY = (city: string) => `
[out:json][timeout:90];
area["name"="${city}"]["boundary"="administrative"]->.a;
(
  nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|pub|bar)$"](area.a);
  nwr["cuisine"](area.a);
);
out center tags 900;
`;
