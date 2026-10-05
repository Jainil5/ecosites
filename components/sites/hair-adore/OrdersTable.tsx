'use client';

import { useRef, useState } from 'react';
import { Download, Upload, Trash2, Search } from 'lucide-react';
import { catalog, formatINR, type Order } from './orders';

const keyName = new Map(catalog.map((c) => [c.key, c.name]));

type Range = 'today' | 'this-week' | 'last-week' | 'this-month' | 'all' | 'custom';

const rangeTabs: { id: Range; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This Week' },
  { id: 'last-week', label: 'Last Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Date Range' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Monday-start weeks, matching Indian salon convention
function weekStart(d: Date): Date {
  const s = new Date(d);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}

function rangeBounds(range: Range, from: string, to: string): [string, string] {
  const now = new Date();
  const today = iso(now);
  switch (range) {
    case 'today': return [today, today];
    case 'this-week': { const s = weekStart(now); return [iso(s), today]; }
    case 'last-week': {
      const thisMon = weekStart(now);
      const lastMon = new Date(thisMon); lastMon.setDate(lastMon.getDate() - 7);
      const lastSun = new Date(thisMon); lastSun.setDate(lastSun.getDate() - 1);
      return [iso(lastMon), iso(lastSun)];
    }
    case 'this-month': return [`${today.slice(0, 8)}01`, today];
    case 'custom': return [from || '0000-01-01', to || '9999-12-31'];
    default: return ['0000-01-01', '9999-12-31'];
  }
}

export function OrdersTable({
  orders,
  onDelete,
  onImport,
  onExport,
}: {
  orders: Order[];
  onDelete: (id: string) => void;
  onImport: (text: string) => number;
  onExport: () => void;
}) {
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<Range>('today');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [lo, hi] = rangeBounds(range, from, to);
  const inRange = orders.filter((o) => o.date >= lo && o.date <= hi);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? inRange.filter((o) =>
        [
          o.id, o.customer.name, o.customer.phone, o.customer.email,
          ...(o.team ?? []),
          ...o.people.map((p) => `${p.name} ${p.services.map((s) => keyName.get(s) ?? s).join(' ')}`),
        ].join(' ').toLowerCase().includes(q),
      )
    : inRange;

  const revenue = filtered.reduce((sum, o) => sum + o.total, 0);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const count = onImport(await file.text());
      setImportMsg(`Imported ${count} order${count === 1 ? '' : 's'} from ${file.name}`);
    } catch (e) {
      setImportMsg(`Import failed: ${e instanceof Error ? e.message : 'invalid CSV'}`);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {rangeTabs.map((t) => {
          const selected = t.id === range;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setRange(t.id)}
              className={`focus-ring cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                selected
                  ? 'bg-[#C1613C] text-white shadow-sm'
                  : 'border border-stone-300 bg-white text-stone-600 hover:border-[#C1613C]/60'
              }`}
            >
              {t.label}
            </button>
          );
        })}
        {range === 'custom' && (
          <span className="flex items-center gap-2 text-sm text-stone-500">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-[#C1613C] focus:outline-none"
            />
            to
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-[#C1613C] focus:outline-none"
            />
          </span>
        )}
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, service…"
            aria-label="Search orders"
            className="w-full rounded-full border border-stone-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-[#C1613C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C1613C]/40"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button" onClick={onExport}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#C1613C]/40 px-4 py-2 text-sm font-medium text-[#9E4A2B] transition-colors hover:bg-[#C1613C]/10"
          >
            <Download aria-hidden className="h-4 w-4" /> Export CSV
          </button>
          <button
            type="button" onClick={() => fileRef.current?.click()}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#2B2118] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#453627]"
          >
            <Upload aria-hidden className="h-4 w-4" /> Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      </div>
      {importMsg && <p role="status" className="mb-4 text-sm text-stone-600">{importMsg}</p>}

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-[#FAF6F0] text-xs uppercase tracking-wider text-stone-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Guests & Services</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-stone-100 align-top last:border-0 hover:bg-[#FAF6F0]/60">
                <td className="whitespace-nowrap px-4 py-3 text-stone-500">{o.date}</td>
                <td className="px-4 py-3">
                  <span className="block font-medium text-stone-900">{o.customer.name}</span>
                  <span className="block text-xs text-stone-500">{o.customer.phone}</span>
                </td>
                <td className="px-4 py-3">
                  {o.people.map((p, i) => (
                    <p key={i} className="text-stone-600">
                      <span className="font-medium text-stone-800">{p.name}</span>
                      <span className="ml-1 text-xs text-stone-500">({p.gender})</span>{' '}
                      {p.services.map((s) => keyName.get(s) ?? s).join(', ')}
                    </p>
                  ))}
                </td>
                <td className="px-4 py-3">
                  {o.team?.length ? (
                    <span className="flex flex-wrap gap-1.5">
                      {o.team.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full bg-[#C1613C]/10 px-2.5 py-1 text-xs font-medium text-[#9E4A2B]"
                        >
                          <span
                            aria-hidden
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#C1613C] text-[9px] font-bold text-white"
                          >
                            {t.split(' ').map((w) => w[0]).join('')}
                          </span>
                          {t.split(' ')[0]}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-serif font-semibold text-[#9E4A2B]">{formatINR(o.total)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(o.id)}
                    aria-label={`Delete order ${o.id}`}
                    className="focus-ring rounded-full p-2 text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-500">
                  {q ? 'No orders match your search in this range.' : 'No orders in this range. Try “All Time”.'}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#FAF6F0] font-semibold text-stone-800">
              <td className="px-4 py-3" colSpan={4}>
                {filtered.length} order{filtered.length === 1 ? '' : 's'}
              </td>
              <td className="px-4 py-3 text-right text-[#9E4A2B]">{formatINR(revenue)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
