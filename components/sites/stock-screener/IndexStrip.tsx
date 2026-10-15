'use client';

import { useStocks } from './useStocks';
import { useLiveTicks } from './useLiveTicks';
import { PingDot } from './PingDot';
import { AnimatedNumber } from './motion/AnimatedNumber';
import { Reveal } from './motion/Reveal';
import { DUR } from './motion/tokens';
import { changePct } from './format';

const INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
] as const;

const INDEX_SYMBOLS = INDICES.map((i) => i.symbol);

export function IndexStrip() {
  const { quotes } = useStocks(INDEX_SYMBOLS);
  const { ticks } = useLiveTicks(INDEX_SYMBOLS);

  return (
    <section
      aria-label="Market indices"
      className="mp-scene mb-5 grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {INDICES.map(({ symbol, name }, i) => {
        const q = quotes[symbol]?.ok ? quotes[symbol] : undefined;
        const tick = ticks[symbol];
        const price = tick?.price ?? q?.price;
        const change = changePct(price, q?.prevClose);
        const tone = change == null ? 'flat' : change >= 0 ? 'up' : 'down';
        const color = tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#5B6B85]';
        const flash = tone === 'up' ? 'mp-flash-up' : tone === 'down' ? 'mp-flash-down' : null;
        return (
          <Reveal key={symbol} delay={i * DUR.stagger} className="h-full">
            <div className="mp-lift relative flex h-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-[#1C2740] bg-[#0A0F1A] px-4 py-3">
              {flash && price != null && (
                <span aria-hidden key={price} className={`pointer-events-none absolute inset-0 ${flash}`} />
              )}
              <div>
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">
                  {name}
                  <PingDot dir={tick?.dir ?? 'flat'} />
                </p>
                <p className="mt-0.5 font-mono text-base text-[#E7EEF9]">
                  <AnimatedNumber value={price} kind="inrPlain" />
                </p>
              </div>
              <div className={`text-right font-mono text-xs ${color}`}>
                <p>
                  <AnimatedNumber value={change} kind="pct" />
                </p>
                {q?.prevClose != null && change != null && price != null && (
                  <p className="text-[10px] text-[#5B6B85]">
                    {change >= 0 ? '+' : ''}
                    {(price - q.prevClose).toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}
