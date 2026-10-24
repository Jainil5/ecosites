// components/sites/analytical-register/MenuManager.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';
import { formatMoney } from './pricing';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

export function MenuManager() {
  const { state, dispatch } = useOrderBook();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const add = () => {
    const p = Number(price);
    if (!name.trim() || !category.trim() || !(p > 0)) return;
    dispatch({ type: 'upsert-item', item: { id: slug(name), name: name.trim(), category: category.trim(), price: p, active: true } });
    setName(''); setCategory(''); setPrice('');
  };

  return (
    <section className="space-y-4">
      <div className="ob-card flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm font-semibold">Name<input className="mt-1 block w-44 rounded-lg border border-[var(--ob-line)] px-3 py-2 min-h-10" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm font-semibold">Category<input className="mt-1 block w-36 rounded-lg border border-[var(--ob-line)] px-3 py-2 min-h-10" value={category} onChange={(e) => setCategory(e.target.value)} /></label>
        <label className="text-sm font-semibold">Price<input className="mt-1 block w-24 rounded-lg border border-[var(--ob-line)] px-3 py-2 min-h-10" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <button className="ob-btn" onClick={add}>Add item</button>
      </div>
      <div className="ob-card overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--ob-muted)]"><tr><th className="py-2">Item</th><th>Category</th><th className="text-right">Price</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {state.menu.map((m) => (
              <tr key={m.id} className="border-t border-[var(--ob-line)]">
                <td className="py-2">{m.name}</td>
                <td>{m.category}</td>
                <td className="text-right">{formatMoney(m.price, state.brand.currency)}</td>
                <td>{m.active ? 'Active' : 'Archived'}</td>
                <td className="text-right">{m.active && <button className="ob-btn-ghost px-3 py-2.5 text-xs" onClick={() => dispatch({ type: 'archive-item', id: m.id })}>Archive</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
