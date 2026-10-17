// components/sites/analytical-register/Settings.tsx
'use client';
import { useState } from 'react';
import { useOrderBook } from './store';

export function Settings() {
  const { state, dispatch } = useOrderBook();
  const [name, setName] = useState(state.brand.name);
  const [accent, setAccent] = useState(state.brand.accent);
  const [phone, setPhone] = useState(state.brand.phone);
  return (
    <section className="ob-card mx-auto max-w-xl space-y-4 p-6">
      <h2 className="text-xl font-bold">Brand settings</h2>
      <label className="block text-sm font-semibold">
        Business name
        <input className="mt-1 w-full rounded-lg border border-[var(--ob-line)] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Accent colour
        <input type="color" className="mt-1 h-10 w-20 rounded" value={accent} onChange={(e) => setAccent(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        WhatsApp sender number
        <input className="mt-1 w-full rounded-lg border border-[var(--ob-line)] px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button className="ob-btn" onClick={() => dispatch({ type: 'update-brand', patch: { name, accent, phone } })}>Save</button>
        <button className="ob-btn-ghost" onClick={() => { if (confirm('Reset all demo data? Your edits are lost.')) dispatch({ type: 'reset' }); }}>Reset demo data</button>
      </div>
    </section>
  );
}
