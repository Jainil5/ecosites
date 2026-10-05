'use client';

import { Newspaper, Sparkles } from 'lucide-react';
import { useMarketNews } from './useNews';
import { NewsList } from './NewsList';

export function NewsDesk() {
  const { data, loading, failed } = useMarketNews();

  return (
    <section aria-label="Market news desk" className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-[#8A98B0]">
          <Newspaper aria-hidden className="h-4 w-4 text-[#16C784]" />
          Market News Desk
        </h2>
        {data && (
          <span className="font-mono text-[10px] text-[#5B6B85]">
            {data.mode === 'llm' ? 'AI-enriched · NVIDIA NIM' : 'keyword mode · add NVIDIA_API_KEY for AI brief'}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-[#1C2740] bg-[#0A0F1A] p-4">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-[#131C2E]" />
            ))}
          </div>
        ) : failed || !data ? (
          <p className="py-3 font-mono text-xs text-[#5B6B85]">
            News feed is temporarily unavailable. It retries on the next page load.
          </p>
        ) : (
          <>
            {data.brief && (
              <div className="mb-4 rounded-lg border border-[#16C784]/25 bg-[#16C784]/5 px-4 py-3">
                <p className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#16C784]">
                  <Sparkles aria-hidden className="h-3 w-3" />
                  Daily market brief
                </p>
                <p className="text-sm leading-relaxed text-[#C9D6EA]">{data.brief}</p>
              </div>
            )}
            <NewsList items={data.items} />
          </>
        )}
      </div>
    </section>
  );
}
