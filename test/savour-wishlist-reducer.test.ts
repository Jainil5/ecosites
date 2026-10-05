import { describe, expect, it } from 'vitest';
import {
  EMPTY_WISHLIST,
  savedItemIds,
  wishlistReducer,
  type WishlistState,
} from '@/components/sites/savour/wishlist-reducer';
import type { DishRef, WishItem, WishlistListRow } from '@/components/sites/savour/types';

const list = (over: Partial<WishlistListRow> = {}): WishlistListRow => ({
  id: 'L1', user_id: 'u', name: 'Want to try', note: null, is_default: true, position: 0, ...over,
});
const dish = (id: string): DishRef => ({
  id, name: `Dish ${id}`, price: 300, course: 'main', place_slug: 'x', place_name: 'X',
});
const wi = (over: Partial<WishItem> = {}): WishItem => ({
  id: 'W1', user_id: 'u', list_id: 'L1', menu_item_id: 'd1', note: null, tried: false, dish: dish('d1'), ...over,
});

const BASE: WishlistState = {
  ...EMPTY_WISHLIST,
  lists: [list(), list({ id: 'L2', name: 'Birthday plan', is_default: false, position: 1 })],
  items: [wi()],
  defaultListId: 'L1',
};
const ids = (s: WishlistState) => s.items.map((i) => i.id);

describe('wishlistReducer', () => {
  it('hydrate replaces state and derives the default list', () => {
    const s = wishlistReducer(BASE, { type: 'hydrate', lists: [list({ id: 'LA' })], items: [] });
    expect(ids(s)).toEqual([]);
    expect(s.defaultListId).toBe('LA');
    expect(s.error).toBeNull();
  });
  it('hydrate with nothing leaves no default', () => {
    expect(wishlistReducer(BASE, { type: 'hydrate', lists: [], items: [] }).defaultListId).toBeNull();
  });
  it('save-pending inserts an optimistic row and marks it pending', () => {
    const s = wishlistReducer(BASE, { type: 'save-pending', tempId: 'T1', listId: 'L2', menuItemId: 'd9' });
    expect(ids(s)).toEqual(['W1', 'T1']);
    expect(s.pending.T1).toBe('saving');
    expect(savedItemIds(s).has('d9')).toBe(true);
  });
  it('save-committed swaps the temp row for the real one', () => {
    const p = wishlistReducer(BASE, { type: 'save-pending', tempId: 'T1', listId: 'L2', menuItemId: 'd9' });
    const s = wishlistReducer(p, {
      type: 'save-committed', tempId: 'T1',
      item: wi({ id: 'W9', list_id: 'L2', menu_item_id: 'd9', dish: dish('d9') }),
    });
    expect(ids(s)).toEqual(['W1', 'W9']);
    expect(s.pending.T1).toBeUndefined();
    expect(s.error).toBeNull();
  });
  it('save-failed rolls back to the pre-save snapshot', () => {
    const p = wishlistReducer(BASE, { type: 'save-pending', tempId: 'T1', listId: 'L2', menuItemId: 'd9' });
    const s = wishlistReducer(p, { type: 'save-failed', tempId: 'T1' });
    expect(ids(s)).toEqual(['W1']);
    expect(s.pending).toEqual({});
    expect(s.error).not.toBeNull();
  });
  it('save-pending for a dish already in that list dedupes', () => {
    const s = wishlistReducer(BASE, { type: 'save-pending', tempId: 'T1', listId: 'L1', menuItemId: 'd1' });
    expect(ids(s)).toEqual(['W1']);
  });
  it('allows the same dish in two different lists', () => {
    const s = wishlistReducer(BASE, { type: 'save-pending', tempId: 'T2', listId: 'L2', menuItemId: 'd1' });
    expect(ids(s)).toEqual(['W1', 'T2']);
  });
  it('remove-committed, move-committed, set-note and toggle-tried patch one row', () => {
    expect(ids(wishlistReducer(BASE, { type: 'remove-committed', id: 'W1' }))).toEqual([]);
    expect(wishlistReducer(BASE, { type: 'move-committed', id: 'W1', listId: 'L2' }).items[0].list_id).toBe('L2');
    expect(wishlistReducer(BASE, { type: 'set-note', id: 'W1', note: 'with mom' }).items[0].note).toBe('with mom');
    expect(wishlistReducer(BASE, { type: 'toggle-tried', id: 'W1' }).items[0].tried).toBe(true);
  });
  it('rename-list and delete-list keep items consistent', () => {
    expect(wishlistReducer(BASE, { type: 'rename-list', id: 'L2', name: 'Diwali' }).lists[1].name).toBe('Diwali');
    expect(wishlistReducer(BASE, { type: 'set-list-note', id: 'L2', note: 'book for 8' }).lists[1].note).toBe('book for 8');
    const s = wishlistReducer(BASE, { type: 'delete-list', id: 'L2' });
    expect(s.lists.map((l) => l.id)).toEqual(['L1']);
    expect(s.items).toHaveLength(1);
  });
  it('deleting the default list re-points the default and its flag', () => {
    const s = wishlistReducer(BASE, { type: 'delete-list', id: 'L1' });
    expect(s.defaultListId).toBe('L2');
    expect(s.lists.find((l) => l.id === 'L2')?.is_default).toBe(true);
    expect(s.items).toEqual([]);
  });
  it('refuses to delete the only list', () => {
    const single: WishlistState = { ...BASE, lists: [list()], defaultListId: 'L1' };
    expect(wishlistReducer(single, { type: 'delete-list', id: 'L1' }).lists).toHaveLength(1);
  });
  it('reset-failed clears the error', () => {
    const p = wishlistReducer(BASE, { type: 'save-pending', tempId: 'T1', listId: 'L2', menuItemId: 'd9' });
    const failed = wishlistReducer(p, { type: 'save-failed', tempId: 'T1' });
    expect(wishlistReducer(failed, { type: 'reset-failed' }).error).toBeNull();
  });
});
