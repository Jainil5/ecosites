// components/sites/analytical-register/store.tsx
'use client';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { initState, orderbookReducer, type Action, type StoreState } from './reducer';

const KEY = 'orderbook:v1';

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
  useEffect(() => {
    dispatch({ type: 'hydrate', state: load() ?? initState() });
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode / quota — the session still works in memory */
    }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useOrderBook() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOrderBook must be used inside StoreProvider');
  return ctx;
}
