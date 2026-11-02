// components/sites/analytical-register/OrderBook.tsx
'use client';
import { useState } from 'react';
import { StoreProvider, useOrderBook } from './store';
import { Overview } from './Overview';
import { Register } from './Register';
import { OrdersLog } from './OrdersLog';
import { Analytics } from './AnalyticsView';
import { MenuManager } from './MenuManager';
import { Settings } from './Settings';
import { TABS } from './overview-data';
import type { ObView } from './types';

function Workspace() {
  const { state } = useOrderBook();
  const [view, setView] = useState<ObView>('overview');

  // The introduction runs long, so a jump into a screen has to land the reader
  // at the top of it rather than wherever the page happened to be scrolled.
  // `scroll-behavior: smooth` is global and already falls back on request for
  // reduced motion.
  const open = (next: ObView) => {
    setView(next);
    window.scrollTo(0, 0);
  };

  return (
    <div className="orderbook min-h-screen" style={{ ['--ob-accent' as string]: state.brand.accent }}>
      <header className="sticky top-0 z-10 border-b border-[var(--ob-line)] bg-[#F6F4F0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          {/* The product's name on the introduction, the tenant's name once you
              are inside the till it is demonstrating. */}
          <span className="text-lg font-extrabold ob-accent-text">
            {view === 'overview' ? 'OrderBook' : state.brand.name}
          </span>
          {view === 'overview' && (
            <span className="-ml-2 hidden text-xs font-semibold text-[var(--ob-muted)] sm:inline">
              Demonstration build for {state.brand.name}
            </span>
          )}
          <nav className="-mx-1 flex w-full min-w-0 gap-1 overflow-x-auto px-1 pb-1 sm:ml-auto sm:w-auto sm:pb-0">
            {TABS.map((n) => (
              <button
                key={n.id}
                onClick={() => open(n.id)}
                aria-pressed={view === n.id}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold ${view === n.id ? 'ob-btn' : 'ob-btn-ghost'}`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === 'overview' && <Overview onOpen={open} />}
        {view === 'register' && <Register />}
        {view === 'orders' && <OrdersLog />}
        {view === 'analytics' && <Analytics />}
        {view === 'menu' && <MenuManager />}
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
