'use client';

import { useMemo } from 'react';
import type { ChartPoint } from './types';
import type { StockMeta } from './data';
import { NewsList } from './NewsList';
import { useStockNews } from './useNews';
import { lastSma, rsi, rsiLabel, trendSignal } from './indicators';
import { changePct, compact, inr, mcapLabel, pct } from './format';

interface StockDetailProps {
  meta: StockMeta;
  quote: ChartPoint;
}

function RangeBar({ label, low, high, current }: { label: string; low?: number; high?: number; current?: number }) {
  if (low == null || high == null || current == null || high <= low) {
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
        <p className="mt-1 font-mono text-xs text-[#8A98B0]">—</p>
      </div>
    );
  }
  const pos = Math.min(Math.max(((current - low) / (high - low)) * 100, 0), 100);
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
      <div className="relative mt-2 h-1.5 rounded-full bg-[#1C2740]">
        <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#0A0F1A] bg-[#4DA3FF]" style={{ left: `calc(${pos}% - 6px)` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-[#5B6B85]">
        <span>{inr(low)}</span>
        <span>{inr(high)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <div className="rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
      <p
        className={`mt-0.5 font-mono text-sm ${
          tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#E7EEF9]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function StockDetail({ meta, quote }: StockDetailProps) {
  const news = useStockNews(meta.symbol, meta.name);
  const change = changePct(quote.price, quote.prevClose);
  const tone = change == null ? undefined : change >= 0 ? 'up' : 'down';

  const closes = useMemo(
    () => (quote.closes ?? []).filter((c): c is number => c != null),
    [quote],
  );
  const sma50 = lastSma(closes, 50);
  const sma200 = lastSma(closes, 200);
  const rsi14 = rsi(closes, 14);
  const trend = quote.price != null ? trendSignal(quote.price, sma50, sma200) : 'neutral';
  const rsiInfo = rsiLabel(rsi14);

  return (
    <div className="grid gap-5 border-t border-[#1C2740] bg-[#070B13] px-4 py-5 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="mb-3 font-mono text-xs text-[#8A98B0]">
          {meta.name} · NSE · {meta.sector} — charted in the panel above
        </p>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">
            Latest headlines · {meta.symbol.replace('.NS', '')}
          </p>
          <div className="rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2.5">
            {news.loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 animate-pulse rounded bg-[#131C2E]" />
                ))}
              </div>
            ) : news.failed || !news.data ? (
              <p className="font-mono text-xs text-[#5B6B85]">Headlines unavailable right now.</p>
            ) : (
              <NewsList items={news.data.items} emptyText="No recent headlines found." />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="LTP" value={inr(quote.price)} tone={tone} />
          <Stat label="1D change" value={pct(change)} tone={tone} />
          <Stat label="Volume" value={compact(quote.volume)} />
          <Stat label="Prev close" value={inr(quote.prevClose)} />
        </div>
        <div className="rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-3">
          <RangeBar label="Day range" low={quote.dayLow} high={quote.dayHigh} current={quote.price} />
          <div className="mt-4">
            <RangeBar label="52-week range" low={quote.week52Low} high={quote.week52High} current={quote.price} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Market cap" value={mcapLabel(meta.mcapCr)} />
          <Stat label="P/E" value={meta.pe.toFixed(1)} />
          <Stat label="P/B" value={meta.pb.toFixed(1)} />
          <Stat label="EPS" value={inr(meta.eps)} />
          <Stat label="Div yield" value={`${meta.dy.toFixed(2)}%`} />
          <Stat
            label="RSI 14"
            value={rsi14 == null ? '—' : `${rsi14.toFixed(1)} · ${rsiInfo.text}`}
            tone={rsiInfo.tone === 'up' ? 'up' : rsiInfo.tone === 'down' ? 'down' : undefined}
          />
        </div>
        <div
          className={`rounded-lg border px-3 py-2 font-mono text-xs ${
            trend === 'bullish'
              ? 'border-[#16C784]/40 bg-[#16C784]/10 text-[#16C784]'
              : trend === 'bearish'
                ? 'border-[#EA3943]/40 bg-[#EA3943]/10 text-[#EA3943]'
                : 'border-[#1C2740] bg-[#0A0F1A] text-[#8A98B0]'
          }`}
        >
          Trend: {trend === 'bullish' ? 'Bullish' : trend === 'bearish' ? 'Bearish' : 'Neutral'} — price vs SMA-50 /
          SMA-200 {sma50 != null && sma200 != null ? `(${inr(sma50)} / ${inr(sma200)})` : ''}
        </div>
      </div>
    </div>
  );
}
