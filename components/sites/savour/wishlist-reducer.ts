import type { WishItem, WishlistListRow } from './types';

export interface WishlistState {
  lists: WishlistListRow[];
  items: WishItem[];
  /** tempId -> in-flight kind, for optimistic rows and their rollback. */
  pending: Record<string, 'saving' | 'deleting'>;
  defaultListId: string | null;
  error: string | null;
}

export const EMPTY_WISHLIST: WishlistState = {
  lists: [],
  items: [],
  pending: {},
  defaultListId: null,
  error: null,
};

export type WishlistAction =
  | { type: 'hydrate'; lists: WishlistListRow[]; items: WishItem[] }
  | { type: 'save-pending'; tempId: string; listId: string; menuItemId: string }
  | { type: 'save-committed'; tempId: string; item: WishItem }
  | { type: 'save-failed'; tempId: string; message?: string }
  | { type: 'remove-committed'; id: string }
  | { type: 'move-committed'; id: string; listId: string }
  | { type: 'set-note'; id: string; note: string | null }
  | { type: 'toggle-tried'; id: string }
  | { type: 'add-list'; list: WishlistListRow }
  | { type: 'rename-list'; id: string; name: string }
  | { type: 'set-list-note'; id: string; note: string | null }
  | { type: 'delete-list'; id: string }
  | { type: 'reset-failed' };

const withoutPending = (pending: Record<string, 'saving' | 'deleting'>, id: string) => {
  const rest = { ...pending };
  delete rest[id];
  return rest;
};

/**
 * Rollback target for each optimistic save, keyed by the state it produced.
 * Kept outside the state so a snapshot never leaks into rendering.
 */
const snapshots = new WeakMap<WishlistState, WishItem[]>();

export function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'hydrate': {
      const def = action.lists.find((l) => l.is_default) ?? action.lists[0];
      return { lists: action.lists, items: action.items, pending: {}, defaultListId: def?.id ?? null, error: null };
    }
    case 'save-pending': {
      if (state.items.some((i) => i.list_id === action.listId && i.menu_item_id === action.menuItemId)) return state;
      const optimistic: WishItem = {
        id: action.tempId,
        user_id: '',
        list_id: action.listId,
        menu_item_id: action.menuItemId,
        note: null,
        tried: false,
        dish: null,
      };
      const next: WishlistState = {
        ...state,
        items: [...state.items, optimistic],
        pending: { ...state.pending, [action.tempId]: 'saving' },
        error: null,
      };
      snapshots.set(next, state.items);
      return next;
    }
    case 'save-committed':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.tempId ? action.item : i)),
        pending: withoutPending(state.pending, action.tempId),
      };
    case 'save-failed': {
      const before = snapshots.get(state) ?? state.items.filter((i) => i.id !== action.tempId);
      return {
        ...state,
        items: before.filter((i) => i.id !== action.tempId),
        pending: withoutPending(state.pending, action.tempId),
        error: action.message ?? 'Could not save. Retry from the wishlist.',
      };
    }
    case 'remove-committed':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'move-committed':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, list_id: action.listId } : i)) };
    case 'set-note':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, note: action.note } : i)) };
    case 'toggle-tried':
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, tried: !i.tried } : i)) };
    case 'add-list':
      return { ...state, lists: [...state.lists, action.list], defaultListId: state.defaultListId ?? action.list.id };
    case 'rename-list':
      return { ...state, lists: state.lists.map((l) => (l.id === action.id ? { ...l, name: action.name } : l)) };
    case 'set-list-note':
      return { ...state, lists: state.lists.map((l) => (l.id === action.id ? { ...l, note: action.note } : l)) };
    case 'delete-list': {
      if (state.lists.length <= 1) return { ...state, error: 'Keep at least one list.' };
      const lists = state.lists.filter((l) => l.id !== action.id);
      const nextDefault = lists.find((l) => l.is_default) ?? lists[0];
      return {
        ...state,
        lists: lists.map((l) => ({ ...l, is_default: l.id === nextDefault?.id })),
        items: state.items.filter((i) => i.list_id !== action.id),
        defaultListId: nextDefault?.id ?? null,
        error: null,
      };
    }
    case 'reset-failed':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function savedItemIds(state: WishlistState): Set<string> {
  return new Set(state.items.map((i) => i.menu_item_id));
}
