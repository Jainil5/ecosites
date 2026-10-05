import type { DishCard, MenuItemRow, PlaceRow } from './types';

export function buildDishCards(places: PlaceRow[], items: MenuItemRow[]): DishCard[] {
  const byId = new Map(places.map((p) => [p.id, p]));
  const cards: DishCard[] = [];
  for (const item of items) {
    const place = byId.get(item.place_id);
    if (place) cards.push({ item, place });
  }
  return cards;
}
