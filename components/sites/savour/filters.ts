import type { DishCard, Filters, PlaceRow, PriceBand, SortKey } from './types';

const BANDS: PriceBand[] = ['₹', '₹₹', '₹₹₹', '₹₹₹₹'];

export function bandRank(b: PriceBand): number {
  return BANDS.indexOf(b) + 1;
}

export function availableCuisines(cards: DishCard[]): string[] {
  const set = new Set<string>();
  for (const c of cards) for (const cu of c.place.cuisines) set.add(cu);
  return [...set].sort();
}

export function availableCities(cards: DishCard[]): string[] {
  const set = new Set<string>();
  for (const c of cards) set.add(c.place.city);
  return [...set].sort();
}

const byName = (a: DishCard, b: DishCard) => a.item.name.localeCompare(b.item.name);
const byRating = (a: DishCard, b: DishCard) => (b.place.rating ?? -1) - (a.place.rating ?? -1) || byName(a, b);

const SORTERS: Record<SortKey, (a: DishCard, b: DishCard, saved: Set<string>) => number> = {
  rating: (a, b) => byRating(a, b),
  name: (a, b) => byName(a, b),
  'price-asc': (a, b) => a.item.price - b.item.price || byName(a, b),
  'price-desc': (a, b) => b.item.price - a.item.price || byName(a, b),
  saved: (a, b, saved) => Number(saved.has(b.item.id)) - Number(saved.has(a.item.id)) || byRating(a, b),
};

export function applyFilters(cards: DishCard[], f: Filters, saved: Set<string>): DishCard[] {
  const q = f.q.trim().toLowerCase();
  return cards
    .filter((c) => {
      if (f.city && c.place.city !== f.city) return false;
      if (f.cuisines.length && !f.cuisines.some((cu) => c.place.cuisines.includes(cu))) return false;
      if (f.bands.length && !f.bands.includes(c.place.price_band)) return false;
      if (f.vegOnly && c.item.is_veg !== true) return false;
      if (q) {
        const hay = `${c.item.name} ${c.item.description ?? ''} ${c.place.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => SORTERS[f.sort](a, b, saved));
}

/**
 * The Places view runs the same controls over venues instead of dishes, so the
 * two tabs cannot disagree about what "filtered" means. A venue matches the text
 * search through its own name, area or cuisine, or through any of its dishes.
 */
type Row = { place: PlaceRow; savedCount: number };

export function filterPlaces(cards: DishCard[], f: Filters, saved: Set<string>): PlaceRow[] {
  const q = f.q.trim().toLowerCase();
  const groups = new Map<string, DishCard[]>();
  for (const c of cards) {
    const group = groups.get(c.place.id);
    if (group) group.push(c);
    else groups.set(c.place.id, [c]);
  }

  const rows: { place: PlaceRow; savedCount: number }[] = [];
  for (const group of groups.values()) {
    const p = group[0].place;
    if (f.city && p.city !== f.city) continue;
    if (f.cuisines.length && !f.cuisines.some((cu) => p.cuisines.includes(cu))) continue;
    if (f.bands.length && !f.bands.includes(p.price_band)) continue;
    if (f.vegOnly && !group.some((c) => c.item.is_veg === true)) continue;
    if (q) {
      const hay = [
        p.name,
        p.area ?? '',
        p.city,
        ...p.cuisines,
        ...group.map((c) => `${c.item.name} ${c.item.description ?? ''}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) continue;
    }
    rows.push({ place: p, savedCount: group.filter((c) => saved.has(c.item.id)).length });
  }

  const name = (a: Row, b: Row) => a.place.name.localeCompare(b.place.name);
  const rating = (a: Row, b: Row) => (b.place.rating ?? -1) - (a.place.rating ?? -1) || name(a, b);
  const by: Record<SortKey, (a: Row, b: Row) => number> = {
    rating,
    name,
    'price-asc': (a, b) => (a.place.cost_for_two ?? Infinity) - (b.place.cost_for_two ?? Infinity) || rating(a, b),
    'price-desc': (a, b) => (b.place.cost_for_two ?? -1) - (a.place.cost_for_two ?? -1) || rating(a, b),
    saved: (a, b) => b.savedCount - a.savedCount || rating(a, b),
  };
  return rows.sort(by[f.sort]).map((r) => r.place);
}
