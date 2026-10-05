import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readSavourEnv } from './env';
import { buildDishCards } from './dishes';
import { FALLBACK } from './fallback-data';
import {
  bool, int, num,
  type Catalogue, type MenuItemRow, type PlacePageData, type PlaceRow, type ReviewRow,
} from './types';

const PLACE_COLUMNS =
  'id, slug, name, city, state, area, address, lat, lng, cuisines, price_band, cost_for_two, ' +
  'rating, num_reviews, positive_reviews, phone, website, instagram, hours, image_url, data_source, verified_at';
const ITEM_COLUMNS =
  'id, place_id, name, course, course_rank, description, price, is_veg, is_signature, image_url';
const REVIEW_COLUMNS = 'id, place_id, author, rating, body, visited_on, source';

function client(): SupabaseClient | null {
  const env = readSavourEnv();
  if (!env) return null;
  return createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function shapePlace(r: Record<string, unknown>): PlaceRow {
  return {
    ...(r as unknown as PlaceRow),
    lat: num(r.lat as string),
    lng: num(r.lng as string),
    cost_for_two: num(r.cost_for_two as string),
    rating: num(r.rating as string),
    num_reviews: int(r.num_reviews as string),
    positive_reviews: int(r.positive_reviews as string),
    cuisines: Array.isArray(r.cuisines) ? (r.cuisines as string[]) : [],
    hours: (r.hours as Record<string, string[]> | null) ?? null,
  };
}

function shapeItem(r: Record<string, unknown>): MenuItemRow {
  return {
    ...(r as unknown as MenuItemRow),
    price: num(r.price as string) ?? 0,
    is_veg: r.is_veg === null || r.is_veg === undefined ? null : bool(r.is_veg as string),
  };
}

function shapeReview(r: Record<string, unknown>): ReviewRow {
  return { ...(r as unknown as ReviewRow), rating: int(r.rating as string) };
}

type Result<T> = { data: T[] | null; error: unknown };

async function rows<T>(run: () => Promise<Result<Record<string, unknown>>>, shape: (r: Record<string, unknown>) => T): Promise<T[] | null> {
  try {
    const { data, error } = await run();
    if (error || !data) return null;
    return data.map(shape);
  } catch {
    return null;
  }
}

export async function getCatalogue(): Promise<Catalogue> {
  const sb = client();
  if (!sb) return FALLBACK;
  const [places, items, reviews] = await Promise.all([
    rows(() => sb.from('places').select(PLACE_COLUMNS).eq('state', 'Maharashtra').order('rating', { ascending: false }).limit(60) as never, shapePlace),
    rows(() => sb.from('menu_items').select(ITEM_COLUMNS).order('course_rank').limit(1200) as never, shapeItem),
    rows(() => sb.from('reviews').select(REVIEW_COLUMNS).order('rating', { ascending: false }).limit(240) as never, shapeReview),
  ]);
  if (!places || places.length === 0) return FALLBACK;
  return { places, items: items ?? [], reviews: reviews ?? [], degraded: false };
}

/**
 * One code path serves live and degraded mode: read the whole catalogue
 * (already the home page's query) and filter. The extra round trip is fine
 * because every caller is an ISR-cached page with revalidate = 3600.
 */
export async function getPlaceBySlug(slug: string): Promise<PlacePageData | null> {
  const cat = await getCatalogue();
  const place = cat.places.find((p) => p.slug === slug);
  if (!place) return null;
  return {
    place,
    items: cat.items.filter((i) => i.place_id === place.id),
    reviews: cat.reviews.filter((r) => r.place_id === place.id),
    degraded: cat.degraded,
  };
}

export { buildDishCards };
