'use client';

import { useMemo } from 'react';
import type { ChartPoint } from './types';
import type { StockMeta } from './data';
import type { LiveTick } from './useLiveTicks';
import { RangeBar } from './RangeBar';
import { Reveal } from './motion/Reveal';
import { Tilt3D } from './motion/Tilt3D';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { DUR } from './motion/tokens';
import { lastSma, rsi, rsiLabel, trendSignal } from './indicators';
import { changePct, inr, mcapLabel, pct } from './format';

interface FundamentalsProps {
  meta: StockMeta;
  quote?: ChartPoint;
  live?: LiveTick;
  loading: boolean;
}

function Stat({ label, children, tone }: { label: string; children: React.ReactNode; tone?: 'up' | 'down' }) {
  const color = tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#E7EEF9]';
  return (
    <Tilt3D intensity={4}>
      <div className="rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
        <p className={`mt-0.5 font-mono text-sm ${color}`}>{children}</p>
      </div>
    </Tilt3D>
  );
}

export function Fundamentals({ meta, quote, live, loading }: FundamentalsProps) {
  const price = live?.price ?? quote?.price;
  const change = changePct(price, quote?.prevClose);
  const tone = change == null ? undefined : change >= 0 ? 'up' : 'down';

  const closes = useMemo(
    () => (quote?.closes ?? []).filter((c): c is number => c != null),
    [quote],
  );
  const sma50 = lastSma(closes, 50);
  const sma200 = lastSma(closes, 200);
  const rsi14 = rsi(closes, 14);
  const trend = price != null ? trendSignal(price, sma50, sma200) : 'neutral';
  const rsiInfo = rsiLabel(rsi14);

  if (loading && !quote) {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-[#131C2E]" />
        ))}
      </div>
    );
  }

  const cards = [
    <Stat key="ltp" label="LTP" tone={tone}>
      <AnimatedNumber value={price} kind="plain" flash />
    </Stat>,
    <Stat key="chg" label="1D change" tone={tone}>
      {quote ? pct(change) : '—'}
    </Stat>,
    <Stat key="vol" label="Volume">
      <AnimatedNumber value={quote?.volume} kind="compact" />
    </Stat>,
    <Stat key="prev" label="Prev close">
      {inr(quote?.prevClose)}
    </Stat>,
    <Stat key="mcap" label="Market cap">{mcapLabel(meta.mcapCr)}</Stat>,
    <Stat key="pe" label="P/E">{meta.pe.toFixed(1)}</Stat>,
    <Stat key="pb" label="P/B">{meta.pb.toFixed(1)}</Stat>,
    <Stat key="eps" label="EPS">{inr(meta.eps)}</Stat>,
    <Stat key="dy" label="Div yield">{`${meta.dy.toFixed(2)}%`}</Stat>,
    <Stat key="rsi" label="RSI 14" tone={rsiInfo.tone === 'flat' ? undefined : rsiInfo.tone}>
      {rsi14 == null ? '—' : `${rsi14.toFixed(1)} · ${rsiInfo.text}`}
    </Stat>,
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, i) => (
          <Reveal key={i} delay={i * DUR.stagger}>
            {card}
          </Reveal>
        ))}
      </div>
      <div className="mt-3 grid gap-4 rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-4 py-4 md:grid-cols-2">
        <RangeBar label="Day range" low={quote?.dayLow} high={quote?.dayHigh} current={price} />
        <RangeBar label="52-week range" low={quote?.week52Low} high={quote?.week52High} current={price} />
      </div>
      <div
        className={`mt-3 rounded-lg border px-4 py-2.5 font-mono text-xs ${
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
  );
}
