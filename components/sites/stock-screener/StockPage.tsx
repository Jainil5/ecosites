'use client';

import { useMemo } from 'react';
import type { StockMeta } from './data';
import { useStocks } from './useStocks';
import { useLiveTicks } from './useLiveTicks';
import { ChartPanel } from './ChartPanel';
import { StockHero } from './StockHero';
import { Fundamentals } from './Fundamentals';
import { StockNewsSection } from './StockNewsSection';
import { PeersStrip } from './PeersStrip';
import { Reveal } from './motion/Reveal';

export function StockPage({ meta }: { meta: StockMeta }) {
  const symbols = useMemo(() => [meta.symbol], [meta.symbol]);
  const { quotes, loading, failed } = useStocks(symbols);
  const { ticks } = useLiveTicks(symbols);
  const quote = quotes[meta.symbol]?.ok ? quotes[meta.symbol] : undefined;
  const live = ticks[meta.symbol];

  return (
    <>
      {failed && (
        <p className="mb-4 rounded-xl border border-[#EA3943]/40 bg-[#EA3943]/10 px-4 py-3 font-mono text-xs text-[#EA3943]">
          Market data is temporarily unavailable from the public feed. Retrying automatically.
        </p>
      )}
      <StockHero meta={meta} quote={quote} live={live} />
      <Reveal className="mb-5">
        <ChartPanel meta={meta} quote={quote} live={live} />
      </Reveal>
      <Reveal className="mb-5">
        <Fundamentals meta={meta} quote={quote} live={live} loading={loading} />
      </Reveal>
      <StockNewsSection meta={meta} />
      <PeersStrip meta={meta} />
    </>
  );
}
