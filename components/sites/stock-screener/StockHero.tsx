'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ChartPoint } from './types';
import type { StockMeta } from './data';
import type { LiveTick } from './useLiveTicks';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { Tilt3D } from './motion/Tilt3D';
import { vtName } from './motion/tokens';
import { vtRef } from './motion/vtRef';import { spark1M } from './indicators';
import { changePct, inr, pct } from './format';
import { Sparkline } from './Sparkline';

export function StockHero({ meta, quote, live }: { meta: StockMeta; quote?: ChartPoint; live?: LiveTick }) {
  const price = live?.price ?? quote?.price;
  const change = changePct(price, quote?.prevClose);
  const tone = change == null ? 'flat' : change >= 0 ? 'up' : 'down';
  const spark = spark1M(quote);
  return (
    <Tilt3D intensity={5} className="mb-5">
      <div
        ref={vtRef(vtName(meta.symbol))}
        className="relative overflow-hidden rounded-2xl border border-[#1C2740]/70 bg-[#0A0F1A]/80 px-6 py-6 backdrop-blur-sm"
      >
        {spark.length > 1 && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 opacity-25">
            <Sparkline values={spark} width={960} height={112} />
          </div>
        )}
        <Link
          href="/stock-screener"
          className="focus-ring mb-3 inline-flex items-center gap-2 rounded font-mono text-xs text-[#5B6B85] transition-colors hover:text-[#16C784]"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back to screener
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5B6B85]">{meta.sector} · NSE</p>
        <h1 className="mt-1 font-mono text-3xl tracking-tight">{meta.symbol.replace('.NS', '')}</h1>
        <p className="text-sm text-[#8A98B0]">{meta.name}</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
          <p className={`font-mono text-4xl ${tone === 'down' ? 'text-[#EA3943]' : tone === 'up' ? 'text-[#16C784]' : ''}`}>
            <AnimatedNumber value={price} kind="plain" decimals={2} flash />
          </p>
          <p className={`font-mono text-sm ${tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#5B6B85]'}`}>
            {quote ? pct(change) : '—'}
          </p>
          {quote?.prevClose != null && <p className="font-mono text-[11px] text-[#5B6B85]">prev close {inr(quote.prevClose)}</p>}
        </div>
      </div>
    </Tilt3D>
  );
}
