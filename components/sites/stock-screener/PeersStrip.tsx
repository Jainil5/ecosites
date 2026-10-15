'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { peersFor, symbolToSlug, type StockMeta } from './data';
import { useStocks } from './useStocks';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { Reveal } from './motion/Reveal';
import { Tilt3D } from './motion/Tilt3D';
import { DUR, vtName } from './motion/tokens';
import { navigateWithViewTransition } from './motion/navigate';
import { changePct, mcapLabel, pct } from './format';

export function PeersStrip({ meta }: { meta: StockMeta }) {
  const router = useRouter();
  const peers = useMemo(() => peersFor(meta.symbol, 6), [meta.symbol]);
  const symbols = useMemo(() => peers.map((p) => p.symbol), [peers]);
  const { quotes } = useStocks(symbols);

  return (
    <section aria-label="Sector peers" className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-[#8A98B0]">
        <Users aria-hidden className="h-4 w-4 text-[#16C784]" />
        Peers · largest in {meta.sector} first
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {peers.map((peer, i) => {
          const quote = quotes[peer.symbol]?.ok ? quotes[peer.symbol] : undefined;
          const change = changePct(quote?.price, quote?.prevClose);
          const tone = change == null ? 'flat' : change >= 0 ? 'up' : 'down';
          return (
            <Reveal key={peer.symbol} delay={i * DUR.stagger}>
              <Tilt3D intensity={6}>
                <button
                  type="button"
                  onClick={() => navigateWithViewTransition(() => router.push(`/stock-screener/${symbolToSlug(peer.symbol)}`))}
                  style={{ viewTransitionName: vtName(peer.symbol) }}
                  className="focus-ring w-full rounded-xl border border-[#1C2740] bg-[#0A0F1A] px-3 py-3 text-left transition-colors hover:border-[#16C784]/40"
                >
                  <p className="font-mono text-sm text-[#E7EEF9]">{peer.symbol.replace('.NS', '')}</p>
                  <p className="truncate font-mono text-[10px] text-[#5B6B85]">{mcapLabel(peer.mcapCr)}</p>
                  <p className="mt-1.5 flex items-baseline gap-2">
                    <AnimatedNumber value={quote?.price} kind="plain" className="font-mono text-xs text-[#8A98B0]" />
                    <span className={`font-mono text-[11px] ${tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#5B6B85]'}`}>
                      {quote ? pct(change) : '—'}
                    </span>
                  </p>
                </button>
              </Tilt3D>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
