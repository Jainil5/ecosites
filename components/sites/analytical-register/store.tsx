// components/sites/analytical-register/store.tsx
'use client';
import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import { initState, orderbookReducer, type Action, type StoreState } from './reducer';
import { bridgesToCafe, defaultEdition, editions, type EditionId } from './editions';
import { mergePublished, readPublished } from '../order-bridge';

// v3: the register opens one counter — café, salon or kitchen — so a v2
// payload, which has no edition and only ever held the cafe catalogue, re-seeds
// instead of hydrating into the wrong trade.
const KEY = 'orderbook:v3';

/**
 * Each counter keeps its own book under its own key. A café's afternoon and a
 * salon's appointments are different businesses' records, so opening one must
 * never read, or overwrite, the other.
 */
const keyFor = (edition: EditionId) => `${KEY}:${edition}`;

// Cafe orders published through the bridge join the book on hydrate;
// mergePublished dedupes by id so persistence + re-hydrate can't double-count.
// Only the café counter shares that bridge — the salon and the kitchen are
// their own businesses and must not inherit a coffee order.
function withPublished(st: StoreState): StoreState {
  if (!bridgesToCafe(st.edition)) return st;
  const published = readPublished(window.localStorage);
  return published.length ? { ...st, orders: mergePublished(st.orders, published, st.brand) } : st;
}

// Read localStorage safely; null = nothing saved (or corrupt shape -> re-seed).
function load(edition: EditionId): StoreState | null {
  try {
    const raw = window.localStorage.getItem(keyFor(edition));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreState;
    if (!parsed?.brand || !Array.isArray(parsed.menu) || !Array.isArray(parsed.orders)) {
      return null; // corrupt shape -> re-seed rather than crash on mount
    }
    if (parsed.edition !== edition || !editions.some((e) => e.id === parsed.edition)) {
      return null; // a book from another counter would render the wrong catalogue
    }
    return parsed;
  } catch {
    return null;
  }
}

const Ctx = createContext<{ state: StoreState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({
  edition = defaultEdition,
  children,
}: {
  /** The counter this page was routed to. */
  edition?: EditionId;
  children: ReactNode;
}) {
  // Server and client must produce the SAME first render or React hydration
  // fails (localStorage only exists client-side). Start from an empty seeded
  // shape on both, then pull the persisted state in via the `hydrate` action
  // after mount.
  const [state, dispatch] = useReducer(orderbookReducer, undefined, () => initState([], edition));
  // Persistence must not run before hydration commits, or the first effect
  // writes the empty pre-hydrate state over the saved book.
  // A ref cannot gate this: both effects run in the same mount flush, so the
  // ref is already true when the persist effect sees the pre-hydrate closure.
  // State flips only on the re-render, which carries the hydrated state.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    dispatch({ type: 'hydrate', state: withPublished(load(edition) ?? initState(undefined, edition)) });
    setHydrated(true);
  }, [edition]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      // The key follows the state, not the prop: while a counter change is in
      // flight the state still describes the book it came from.
      window.localStorage.setItem(keyFor(state.edition), JSON.stringify(state));
    } catch {
      /* private mode / quota — the session still works in memory */
    }
  }, [state, hydrated]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useOrderBook() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrderBook must be used inside StoreProvider');
  return ctx;
}
