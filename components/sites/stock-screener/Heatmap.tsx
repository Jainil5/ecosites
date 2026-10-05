'use client';

import { capTier, type StockMeta } from './data';
import type { ChartPoint } from './types';
import { changePct, pct } from './format';

interface HeatmapProps {
  cells: { meta: StockMeta; quote?: ChartPoint }[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

function tileStyle(change: number | null): React.CSSProperties {
  if (change == null) return { background: '#101828' };
  const mag = Math.min(Math.abs(change) / 2.5, 1);
  const alpha = 0.14 + mag * 0.6;
  return {
    background: change >= 0 ? `rgba(22,199,132,${alpha})` : `rgba(234,57,67,${alpha})`,
  };
}

export function Heatmap({ cells, selectedSymbol, onSelect }: HeatmapProps) {
  const sorted = cells
    .map((c) => ({ ...c, change: changePct(c.quote?.price, c.quote?.prevClose) }))
    .sort((a, b) => b.meta.mcapCr - a.meta.mcapCr);

  return (
    <section aria-label="Market heatmap" className="mb-5 rounded-xl border border-[#1C2740] bg-[#0A0F1A] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-xs uppercase tracking-wider text-[#8A98B0]">
          Market heatmap · size = market cap, color = today&apos;s move
        </h2>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#5B6B85]">
          <span>-2.5%</span>
          <span className="h-2 w-24 rounded-full bg-gradient-to-r from-[#EA3943] via-[#101828] to-[#16C784]" aria-hidden />
          <span>+2.5%</span>
        </div>
      </div>
      <div className="grid auto-rows-[56px] grid-flow-row-dense grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-8">
        {sorted.map(({ meta, quote, change }) => {
          const tier = capTier(meta.mcapCr);
          const ticker = meta.symbol.replace('.NS', '');
          return (
            <button
              key={meta.symbol}
              type="button"
              onClick={() => onSelect(meta.symbol)}
              title={`${meta.name} · ${pct(change)}`}
              className={`focus-ring flex flex-col items-center justify-center rounded-md border transition-transform hover:scale-[1.03] ${
                tier === 'mega' ? 'col-span-2 row-span-2' : tier === 'large' ? 'col-span-2' : ''
              } ${meta.symbol === selectedSymbol ? 'border-[#16C784]' : 'border-[#131C2E]'}`}
              style={tileStyle(change)}
            >
              <span className={`font-mono ${tier === 'mid' ? 'text-[10px]' : 'text-xs'} text-[#E7EEF9]`}>{ticker}</span>
              {quote && (
                <span className={`font-mono text-[10px] ${change == null ? 'text-[#8A98B0]' : change >= 0 ? 'text-[#B9F0D8]' : 'text-[#F7C6CA]'}`}>
                  {pct(change)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
