import { gen } from '../../../scripts/savour-seed';
import { CATALOG, type VenueSeed } from './catalog';
import type { Catalogue, MenuItemRow, PlaceRow, ReviewRow } from './types';

/**
 * First three catalogue venues, inlined as rows, for when Supabase is
 * unconfigured or unreachable. `degraded: true` makes the UI say so.
 * Ids come from the same gen() the seed uses, so a saved dish id stays valid
 * if the same browser moves between degraded and live modes.
 */
function seedToRows(v: VenueSeed): { place: PlaceRow; items: MenuItemRow[]; reviews: ReviewRow[] } {
  const id = gen(v.place.slug);
  return {
    place: { ...v.place, id },
    items: v.dishes.map((d) => ({ ...d, id: gen(`${v.place.slug}#dish#${d.name}`), place_id: id })),
    reviews: v.reviews.map((r) => ({
      ...r,
      id: gen(`${v.place.slug}#review#${r.author}#${r.body.slice(0, 24)}`),
      place_id: id,
    })),
  };
}

const three = CATALOG.slice(0, 3).map(seedToRows);

export const FALLBACK: Catalogue = {
  places: three.map((t) => t.place),
  items: three.flatMap((t) => t.items),
  reviews: three.flatMap((t) => t.reviews),
  degraded: true,
};
