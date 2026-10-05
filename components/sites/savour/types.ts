export type PriceBand = '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';

export type Course = 'aperitif' | 'starter' | 'main' | 'breads' | 'dessert' | 'beverage';

export type SortKey = 'rating' | 'price-asc' | 'price-desc' | 'name' | 'saved';

export interface PlaceRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  area: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  cuisines: string[];
  price_band: PriceBand;
  cost_for_two: number | null;
  rating: number | null;
  num_reviews: number;
  positive_reviews: number;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  hours: Record<string, string[]> | null;
  image_url: string | null;
  data_source: string;
  verified_at: string | null;
}

export interface MenuItemRow {
  id: string;
  place_id: string;
  name: string;
  course: Course;
  course_rank: number;
  description: string | null;
  price: number;
  is_veg: boolean | null;
  is_signature: boolean;
  image_url: string | null;
}

export interface ReviewRow {
  id: string;
  place_id: string;
  author: string;
  rating: number;
  body: string;
  visited_on: string | null;
  source: string;
}

export interface WishlistListRow {
  id: string;
  user_id: string;
  name: string;
  note: string | null;
  is_default: boolean;
  position: number;
}

export interface WishlistItemRow {
  id: string;
  user_id: string;
  list_id: string;
  menu_item_id: string;
  note: string | null;
  tried: boolean;
}

/** The joined dish a saved row points at, flattened for the drawer. */
export interface DishRef {
  id: string;
  name: string;
  price: number;
  course: Course;
  place_slug: string;
  place_name: string;
}

export interface WishItem extends WishlistItemRow {
  dish: DishRef | null;
}

/** A row of the `saved_dishes` view; used by the RLS isolation check. */
export interface SavedDishRow {
  wish_id: string;
  note: string | null;
  tried: boolean;
  saved_at: string;
  list_id: string;
  list_name: string;
  menu_item_id: string;
  dish_name: string;
  description: string | null;
  course: Course;
  price: number;
  is_veg: boolean | null;
  place_id: string;
  slug: string;
  place_name: string;
  city: string;
  rating: number | null;
  image_url: string | null;
}

export interface DishCard {
  item: MenuItemRow;
  place: PlaceRow;
}

export interface Filters {
  q: string;
  city: string;
  cuisines: string[];
  vegOnly: boolean;
  bands: PriceBand[];
  sort: SortKey;
}

export const EMPTY_FILTERS: Filters = {
  q: '',
  city: '',
  cuisines: [],
  vegOnly: false,
  bands: [],
  sort: 'rating',
};

export interface Catalogue {
  places: PlaceRow[];
  items: MenuItemRow[];
  reviews: ReviewRow[];
  degraded: boolean;
}

export interface PlacePageData {
  place: PlaceRow;
  items: MenuItemRow[];
  reviews: ReviewRow[];
  degraded: boolean;
}

/** PostgREST may serialise numeric columns as strings; normalise at the boundary. */
export function num(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function int(v: string | number | null | undefined): number {
  const n = num(v);
  return n === null ? 0 : Math.trunc(n);
}

export function bool(v: boolean | string | null | undefined): boolean {
  return v === true || v === 'true' || v === 't';
}
