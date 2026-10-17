// components/sites/analytical-register/Register.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';
import { Ticket } from './Ticket';
import type { MenuItem } from './types';

export function Register() {
  const { state, dispatch } = useOrderBook();
  const items = state.menu.filter((m) => m.active);
  const categories = [...new Set(items.map((m) => m.category))];
  const [cat, setCat] = useState<string>('All');
  const shown = cat === 'All' ? items : items.filter((m) => m.category === cat);
  const add = (item: MenuItem) => dispatch({ type: 'add-line', item });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', ...categories].map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${cat === c ? 'ob-btn' : 'ob-btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {shown.map((m) => (
            <button key={m.id} onClick={() => add(m)} className="ob-tile p-3 text-left">
              <div className="font-semibold">{m.name}</div>
              {m.note && <div className="text-xs text-[var(--ob-muted)]">{m.note}</div>}
              <div className="mt-1 ob-accent-text font-bold">₹{m.price}</div>
            </button>
          ))}
        </div>
      </div>
      <Ticket />
    </div>
  );
}
