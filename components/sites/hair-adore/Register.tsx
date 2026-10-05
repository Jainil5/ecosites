'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ScanLine, ClipboardList, BarChart3, RotateCcw } from 'lucide-react';
import { useOrders } from './useOrders';
import { downloadCsv } from './orders';
import { NewOrderForm } from './NewOrderForm';
import { OrdersTable } from './OrdersTable';
import { Analytics } from './Analytics';

type Tab = 'new' | 'orders' | 'analytics';

const tabs: { id: Tab; label: string; icon: typeof ScanLine }[] = [
  { id: 'new', label: 'New Order', icon: ScanLine },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Register({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('new');
  const { orders, addOrder, deleteOrder, importCsv, resetDemo } = useOrders();
  const backRef = useRef<HTMLButtonElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === tab);
    const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    setTab(tabs[next].id);
    tablistRef.current?.querySelector<HTMLButtonElement>(`#reg-tab-${tabs[next].id}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-stone-800">
      <header className="bg-[#2B2118] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <h1 className="font-serif text-2xl font-bold">
              Hair <span className="font-light italic text-[#E7B48F]">Adore</span> — Owner Register
            </h1>
            <p className="text-xs text-stone-400">Billing · customer records · sales analytics (demo data stays in this browser)</p>
          </div>
          <button
            type="button"
            ref={backRef}
            onClick={onBack}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-stone-600 px-4 py-2 text-sm text-stone-300 transition-colors hover:border-[#E7B48F] hover:text-[#E7B48F]"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" /> Back to website
          </button>
        </div>
      </header>

      <div className="border-b border-[#C1613C]/20 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
          <div ref={tablistRef} role="tablist" aria-label="Register sections" className="flex gap-1" onKeyDown={onTabKeyDown}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`reg-tab-${id}`}
                role="tab"
                aria-selected={tab === id}
                aria-controls={`reg-panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className={`focus-ring inline-flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === id
                    ? 'border-[#C1613C] text-[#9E4A2B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" /> {label}
                {id === 'orders' && <span className="rounded-full bg-[#C1613C]/10 px-2 py-0.5 text-xs text-[#9E4A2B]">{orders.length}</span>}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all orders back to the demo dataset?')) resetDemo();
            }}
            className="focus-ring my-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-800"
          >
            <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Reset demo data
          </button>
        </div>
      </div>

      <main
        id={`reg-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`reg-tab-${tab}`}
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-10"
      >
        {tab === 'new' && <NewOrderForm onSave={addOrder} />}
        {tab === 'orders' && (
          <OrdersTable orders={orders} onDelete={deleteOrder} onImport={importCsv} onExport={() => downloadCsv(orders)} />
        )}
        {tab === 'analytics' && <Analytics orders={orders} />}
      </main>
    </div>
  );
}
