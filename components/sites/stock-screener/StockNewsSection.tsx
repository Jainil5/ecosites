'use client';

import { Newspaper, Sparkles } from 'lucide-react';
import type { StockMeta } from './data';
import { NewsList } from './NewsList';
import { useMarketNews, useStockNews } from './useNews';
import { Reveal } from './motion/Reveal';
import { DUR } from './motion/tokens';

function NewsBlock({
  heading,
  loading,
  failed,
  items,
  emptyText,
  brief,
}: {
  heading: string;
  loading: boolean;
  failed: boolean;
  items?: { title: string; source: string; link: string; publishedAt: string; category: string; important: boolean }[];
  emptyText: string;
  brief?: string | null;
}) {
  return (
    <div className="rounded-xl border border-[#1C2740] bg-[#0A0F1A] p-4">
      <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#8A98B0]">
        <Newspaper aria-hidden className="h-3.5 w-3.5 text-[#16C784]" />
        {heading}
      </h3>
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-md bg-[#131C2E]" />
          ))}
        </div>
      ) : failed || !items ? (
        <p className="py-2 font-mono text-xs text-[#5B6B85]">News feed is temporarily unavailable. Retries on reload.</p>
      ) : (
        <>
          {brief && (
            <div className="mb-4 rounded-lg border border-[#16C784]/25 bg-[#16C784]/5 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#16C784]">
                <Sparkles aria-hidden className="h-3 w-3" />
                Daily market brief
              </p>
              <p className="text-sm leading-relaxed text-[#C9D6EA]">{brief}</p>
            </div>
          )}
          <NewsList items={items} emptyText={emptyText} />
        </>
      )}
    </div>
  );
}

export function StockNewsSection({ meta }: { meta: StockMeta }) {
  const stock = useStockNews(meta.symbol, meta.name);
  const market = useMarketNews();
  const ticker = meta.symbol.replace('.NS', '');
  return (
    <section aria-label={`${ticker} news`} className="mb-8 grid gap-4 lg:grid-cols-2">
      <Reveal>
        <NewsBlock
          heading={`Headlines · ${ticker}`}
          loading={stock.loading}
          failed={stock.failed}
          items={stock.data?.items}
          emptyText="No recent headlines found."
        />
      </Reveal>
      <Reveal delay={DUR.stagger}>
        <NewsBlock
          heading="Market news desk"
          loading={market.loading}
          failed={market.failed}
          items={market.data?.items}
          brief={market.data?.brief}
          emptyText="No recent headlines."
        />
      </Reveal>
    </section>
  );
}
