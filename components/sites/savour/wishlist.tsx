'use client';
import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
  type ReactNode,
} from 'react';
import { getSavourClient } from './browser';
import { isSavourConfigured } from './env';
import {
  EMPTY_WISHLIST, savedItemIds, wishlistReducer,
} from './wishlist-reducer';
import type { DishRef, MenuItemRow, PlaceRow, WishItem, WishlistListRow } from './types';

/** PostgREST many-to-one embeds: menu_items -> places is a single object. */
const ITEM_SELECT =
  'id, user_id, list_id, menu_item_id, note, tried, ' +
  'menu_items(id, name, price, course, place:places(slug, name))';

interface RawItem extends Omit<WishItem, 'dish'> {
  menu_items: (Pick<MenuItemRow, 'id' | 'name' | 'price' | 'course'> & {
    place: Pick<PlaceRow, 'slug' | 'name'>;
  }) | null;
}

function toWishItem(r: RawItem): WishItem {
  const dish: DishRef | null = r.menu_items
    ? {
        id: r.menu_items.id,
        name: r.menu_items.name,
        price: Number(r.menu_items.price),
        course: r.menu_items.course,
        place_slug: r.menu_items.place?.slug ?? '',
        place_name: r.menu_items.place?.name ?? '',
      }
    : null;
  return {
    id: r.id, user_id: r.user_id, list_id: r.list_id, menu_item_id: r.menu_item_id,
    note: r.note, tried: r.tried, dish,
  };
}

interface WishlistCtx {
  enabled: boolean;
  loading: boolean;
  lists: WishlistListRow[];
  items: WishItem[];
  defaultListId: string | null;
  error: string | null;
  saved: Set<string>;
  save: (menuItemId: string, listId?: string) => Promise<void>;
  unsave: (wishId: string) => Promise<void>;
  move: (wishId: string, listId: string) => Promise<void>;
  setNote: (wishId: string, note: string | null) => Promise<void>;
  toggleTried: (wishId: string) => Promise<void>;
  createList: (name: string) => Promise<string | null>;
  renameList: (id: string, name: string) => Promise<void>;
  setListNote: (id: string, note: string | null) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  retry: () => Promise<void>;
}

const Ctx = createContext<WishlistCtx | null>(null);

export function useWishlist(): WishlistCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return c;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const enabled = isSavourConfigured();
  const [state, dispatch] = useReducer(wishlistReducer, EMPTY_WISHLIST);
  const [loading, setLoading] = useState(enabled);
  const seq = useRef(0);
  const tempId = () => `T${++seq.current}`;

  /** The anonymous uid is read from the session; never from the caller. */
  const uid = async (): Promise<string | null> => {
    const sb = getSavourClient();
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: signed, error } = await sb.auth.signInAnonymously();
    if (error) throw error;
    return signed.user?.id ?? null;
  };

  const load = useCallback(async () => {
    const sb = getSavourClient();
    if (!sb) return;
    setLoading(true);
    try {
      const id = await uid();
      if (!id) throw new Error('Anonymous sign-in is disabled on this Supabase project.');
      const [L, I] = await Promise.all([
        sb.from('wishlist_lists').select('*').order('position'),
        sb.from('wishlist_items').select(ITEM_SELECT).order('created_at'),
      ]);
      if (L.error || I.error) throw L.error ?? I.error;
      let lists = (L.data ?? []) as WishlistListRow[];
      const items = ((I.data ?? []) as unknown as RawItem[]).map(toWishItem);
      if (lists.length === 0) {
        const { data: created } = await sb
          .from('wishlist_lists')
          .insert({ user_id: id, name: 'Want to try', is_default: true, position: 0 })
          .select('*')
          .single();
        if (created) lists = [created as WishlistListRow];
      }
      dispatch({ type: 'hydrate', lists, items });
    } catch (e) {
      dispatch({ type: 'hydrate', lists: [], items: [] });
      dispatch({
        type: 'save-failed',
        tempId: 'boot',
        message: e instanceof Error ? e.message : 'Wishlist unavailable.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  const save = useCallback(
    async (menuItemId: string, listId?: string) => {
      const sb = getSavourClient();
      const target = listId ?? state.defaultListId;
      if (!sb || !target) return;
      const id = await uid().catch(() => null);
      if (!id) return;
      const temp = tempId();
      dispatch({ type: 'save-pending', tempId: temp, listId: target, menuItemId });
      const { data, error } = await sb
        .from('wishlist_items')
        .insert({ user_id: id, list_id: target, menu_item_id: menuItemId })
        .select(ITEM_SELECT)
        .single();
      if (error || !data) dispatch({ type: 'save-failed', tempId: temp, message: error?.message });
      else dispatch({ type: 'save-committed', tempId: temp, item: toWishItem(data as unknown as RawItem) });
    },
    [state.defaultListId],
  );

  const unsave = useCallback(async (wishId: string) => {
    const sb = getSavourClient();
    if (!sb) return;
    const { error } = await sb.from('wishlist_items').delete().eq('id', wishId);
    if (error) dispatch({ type: 'save-failed', tempId: wishId, message: error.message });
    else dispatch({ type: 'remove-committed', id: wishId });
  }, []);

  const move = useCallback(async (wishId: string, listId: string) => {
    const sb = getSavourClient();
    if (!sb) return;
    const { error } = await sb.from('wishlist_items').update({ list_id: listId }).eq('id', wishId);
    if (!error) dispatch({ type: 'move-committed', id: wishId, listId });
  }, []);

  const setNote = useCallback(async (wishId: string, note: string | null) => {
    const sb = getSavourClient();
    if (!sb) return;
    const { error } = await sb.from('wishlist_items').update({ note }).eq('id', wishId);
    if (!error) dispatch({ type: 'set-note', id: wishId, note });
  }, []);

  const toggleTried = useCallback(
    async (wishId: string) => {
      const sb = getSavourClient();
      const cur = state.items.find((i) => i.id === wishId);
      if (!sb || !cur) return;
      dispatch({ type: 'toggle-tried', id: wishId });
      const { error } = await sb.from('wishlist_items').update({ tried: !cur.tried }).eq('id', wishId);
      if (error) dispatch({ type: 'toggle-tried', id: wishId });
    },
    [state.items],
  );

  const createList = useCallback(
    async (name: string) => {
      const sb = getSavourClient();
      if (!sb) return null;
      const id = await uid().catch(() => null);
      if (!id) return null;
      const { data, error } = await sb
        .from('wishlist_lists')
        .insert({ user_id: id, name, position: state.lists.length })
        .select('*')
        .single();
      if (error || !data) return null;
      dispatch({ type: 'add-list', list: data as WishlistListRow });
      return (data as WishlistListRow).id;
    },
    [state.lists.length],
  );

  const renameList = useCallback(async (id: string, name: string) => {
    const sb = getSavourClient();
    if (!sb) return;
    const { error } = await sb.from('wishlist_lists').update({ name }).eq('id', id);
    if (!error) dispatch({ type: 'rename-list', id, name });
  }, []);

  const setListNote = useCallback(async (id: string, note: string | null) => {
    const sb = getSavourClient();
    if (!sb) return;
    const { error } = await sb.from('wishlist_lists').update({ note }).eq('id', id);
    if (!error) dispatch({ type: 'set-list-note', id, note });
  }, []);

  const deleteList = useCallback(async (id: string) => {
    const sb = getSavourClient();
    if (!sb) return;
    const { error } = await sb.from('wishlist_lists').delete().eq('id', id);
    if (!error) dispatch({ type: 'delete-list', id });
  }, []);

  const value = useMemo<WishlistCtx>(
    () => ({
      enabled,
      loading,
      lists: state.lists,
      items: state.items,
      defaultListId: state.defaultListId,
      error: state.error,
      saved: savedItemIds(state),
      save, unsave, move, setNote, toggleTried, createList, renameList, setListNote, deleteList,
      retry: load,
    }),
    [enabled, loading, state, save, unsave, move, setNote, toggleTried, createList, renameList, setListNote, deleteList, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
