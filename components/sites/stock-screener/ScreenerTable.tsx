'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChartPoint } from './types';
import type { StockMeta } from './data';
import { symbolToSlug } from './data';
import type { LiveTick } from './useLiveTicks';
import { PingDot } from './PingDot';
import { Sparkline } from './Sparkline';
import { spark1M } from './indicators';
import { navigateWithViewTransition } from './motion/navigate';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { DUR, EASE, SPRINGS } from './motion/tokens';
import { changePct, compact, mcapLabel, pct } from './format';

export interface ScreenerRow {
  meta: StockMeta;
  quote?: ChartPoint;
  tick?: LiveTick;
}

export type SortKey = 'name' | 'price' | 'change' | 'volume' | 'mcap' | 'pe';
export interface SortState {
  key: SortKey;
  dir: 'asc' | 'desc';
}

const COLUMNS: { key: SortKey | null; label: string; numeric?: boolean; hide?: string }[] = [
  { key: 'name', label: 'Symbol' },
  { key: 'price', label: 'LTP (₹)', numeric: true },
  { key: 'change', label: 'Chg %', numeric: true },
  { key: null, label: '1M trend' },
  { key: 'volume', label: 'Volume', numeric: true, hide: 'hidden lg:table-cell' },
  { key: 'mcap', label: 'M-Cap', numeric: true, hide: 'hidden md:table-cell' },
  { key: 'pe', label: 'P/E', numeric: true, hide: 'hidden md:table-cell' },
  { key: null, label: 'Div %', numeric: true, hide: 'hidden xl:table-cell' },
  { key: null, label: '52W position', hide: 'hidden xl:table-cell' },
];

function Week52Bar({ quote }: { quote?: ChartPoint }) {
  if (!quote?.week52Low || !quote?.week52High || quote.price == null || quote.week52High <= quote.week52Low) {
    return <span className="font-mono text-xs text-[#5B6B85]">—</span>;
  }
  const pos = Math.min(Math.max(((quote.price - quote.week52Low) / (quote.week52High - quote.week52Low)) * 100, 0), 100);
  return (
    <div className="flex min-w-[110px] items-center gap-2" title={`${pos.toFixed(0)}% of 52-week range`}>
      <div className="relative h-1 flex-1 rounded-full bg-[#1C2740]">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#EA3943] via-[#F5A623] to-[#16C784]" style={{ width: '100%', opacity: 0.5 }} />
        <div className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#E7EEF9]" style={{ left: `calc(${pos}% - 5px)` }} />
      </div>
    </div>
  );
}

interface ScreenerTableProps {
  rows: ScreenerRow[];
  loading: boolean;
  sort: SortState;
  onSort: (key: SortKey) => void;
  watched: string[];
  onWatchToggle: (symbol: string) => void;
}

export function ScreenerTable({ rows, loading, sort, onSort, watched, onWatchToggle }: ScreenerTableProps) {
  const router = useRouter();
  const openStock = (symbol: string) =>
    navigateWithViewTransition(() => router.push(`/stock-screener/${symbolToSlug(symbol)}`));
  if (loading && rows.every((r) => !r.quote)) {
    return (
      <div className="space-y-2 rounded-xl border border-[#1C2740] bg-[#0A0F1A] p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-[#131C2E]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mp-rise mp-depth overflow-x-auto rounded-xl border border-[#1C2740] bg-[#0A0F1A]" style={{ '--d': '480ms' } as React.CSSProperties}>
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#1C2740] text-left">
            {COLUMNS.map((col) => {
              const active = col.key && sort.key === col.key;
              return (
                <th key={col.label} className={`px-3 py-2.5 font-mono text-[10px] font-normal uppercase tracking-wider text-[#5B6B85] ${col.numeric ? 'text-right' : ''} ${col.hide ?? ''}`}>
                  {col.key ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key!)}
                      className={`focus-ring inline-flex items-center gap-1 rounded transition-colors hover:text-[#E7EEF9] ${active ? 'text-[#16C784]' : ''}`}
                    >
                      {col.label}
                      <span aria-hidden className="text-[8px]">
                        {active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map(({ meta, quote, tick }) => {
              const price = tick?.price ?? quote?.price;
              const change = changePct(price, quote?.prevClose);
              const tone = change == null ? 'flat' : change >= 0 ? 'up' : 'down';
              const ticker = meta.symbol.replace('.NS', '');
              return (
                <motion.tr
                  key={meta.symbol}
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: SPRINGS.layout,
                    y: { duration: DUR.enter, ease: EASE.enter },
                    opacity: { duration: DUR.exit, ease: EASE.exit },
                  }}
                  onClick={() => openStock(meta.symbol)}
                  className="cursor-pointer border-b border-[#131C2E] transition-colors hover:bg-[#101828]"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={watched.includes(meta.symbol) ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
                        aria-pressed={watched.includes(meta.symbol)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onWatchToggle(meta.symbol);
                        }}
                        className={`focus-ring inline-flex h-9 w-9 items-center justify-center rounded transition-colors ${
                          watched.includes(meta.symbol)
                            ? 'text-[#F5A623]'
                            : 'text-[#2A3A57] hover:text-[#8A98B0]'
                        }`}
                      >
                        <Star aria-hidden className="h-3.5 w-3.5" fill={watched.includes(meta.symbol) ? 'currentColor' : 'none'} />
                      </button>
                      <div>
                        <p className="flex items-center gap-2 font-mono text-sm text-[#E7EEF9]">
                          <Link
                            href={`/stock-screener/${symbolToSlug(meta.symbol)}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`${ticker} — open detail page`}
                            className="focus-ring inline-flex min-h-10 items-center rounded hover:text-[#16C784]"
                          >
                            {ticker}
                          </Link>
                          <PingDot dir={tick?.dir ?? 'flat'} />
                        </p>
                        <p className="text-[11px] text-[#5B6B85]">{meta.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[#E7EEF9]">
                    <AnimatedNumber value={price} kind="inrPlain" flash className="px-1" />
                  </td>
                  <td className={`px-3 py-2.5 text-right font-mono ${tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#5B6B85]'}`}>
                    {quote ? pct(change) : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end lg:justify-center">
                      <Sparkline values={spark1M(quote)} />
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-[#8A98B0] lg:table-cell">{compact(quote?.volume)}</td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-[#8A98B0] md:table-cell">{mcapLabel(meta.mcapCr).replace('₹', '')}</td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-[#8A98B0] md:table-cell">{meta.pe.toFixed(1)}</td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-[#8A98B0] xl:table-cell">{meta.dy.toFixed(2)}</td>
                  <td className="hidden px-3 py-2.5 xl:table-cell">
                    <Week52Bar quote={quote} />
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
          {rows.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="px-3 py-10 text-center font-mono text-sm text-[#5B6B85]">
                No stocks match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
