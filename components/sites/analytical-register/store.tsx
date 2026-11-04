// components/sites/analytical-register/store.tsx
'use client';
import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import { initState, orderbookReducer, type Action, type StoreState } from './reducer';
import { mergePublished, readPublished } from '../order-bridge';

// v2: the register rebrands to the shared Brewery menu; v1 payloads would
// hydrate the old catalogue, so they re-seed instead.
const KEY = 'orderbook:v2';

// Cafe orders published through the bridge join the book on hydrate;
// mergePublished dedupes by id so persistence + re-hydrate can't double-count.
function withPublished(st: StoreState): StoreState {
  const published = readPublished(window.localStorage);
  return published.length ? { ...st, orders: mergePublished(st.orders, published, st.brand) } : st;
}

// Read localStorage safely; null = nothing saved (or corrupt shape -> re-seed).
function load(): StoreState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreState;
    if (!parsed?.brand || !Array.isArray(parsed.menu) || !Array.isArray(parsed.orders)) {
      return null; // corrupt shape -> re-seed rather than crash on mount
    }
    return parsed;
  } catch {
    return null;
  }
}

const Ctx = createContext<{ state: StoreState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Server and client must produce the SAME first render or React hydration
  // fails (localStorage only exists client-side). Start from an empty seeded
  // shape on both, then pull the persisted state in via the `hydrate` action
  // after mount.
  const [state, dispatch] = useReducer(orderbookReducer, undefined, () => initState([]));
  // Persistence must not run before hydration commits, or the first effect
  // writes the empty pre-hydrate state over the saved `orderbook:v1`.
  // A ref cannot gate this: both effects run in the same mount flush, so the
  // ref is already true when the persist effect sees the pre-hydrate closure.
  // State flips only on the re-render, which carries the hydrated state.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    dispatch({ type: 'hydrate', state: withPublished(load() ?? initState()) });
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
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
