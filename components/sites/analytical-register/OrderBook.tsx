// components/sites/analytical-register/OrderBook.tsx
'use client';
import { useState } from 'react';
import { StoreProvider, useOrderBook } from './store';
import { Register } from './Register';
import { Settings } from './Settings';

type View = 'register' | 'orders' | 'analytics' | 'menu' | 'settings';
const NAV: { id: View; label: string }[] = [
  { id: 'register', label: 'Register' },
  { id: 'orders', label: 'Orders' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'menu', label: 'Menu' },
  { id: 'settings', label: 'Settings' },
];

function Workspace() {
  const { state } = useOrderBook();
  const [view, setView] = useState<View>('register');
  return (
    <div className="orderbook min-h-screen" style={{ ['--ob-accent' as string]: state.brand.accent }}>
      <header className="sticky top-0 z-10 border-b border-[var(--ob-line)] bg-[var(--ob-canvas)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <span className="text-lg font-extrabold ob-accent-text">{state.brand.name}</span>
          <nav className="ml-auto flex gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                aria-pressed={view === n.id}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${view === n.id ? 'ob-btn' : 'ob-btn-ghost'}`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === 'register' && <Register />}
        {(view === 'orders' || view === 'analytics' || view === 'menu') && (
          <p className="text-[var(--ob-muted)]">This screen is added in Tasks 8–10.</p>
        )}
        {view === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export function OrderBook() {
  return (
    <StoreProvider>
      <Workspace />
    </StoreProvider>
  );
}
