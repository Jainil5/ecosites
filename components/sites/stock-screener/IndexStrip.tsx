'use client';

import { useStocks } from './useStocks';
import { changePct, inrPlain, pct } from './format';

const INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
] as const;

const INDEX_SYMBOLS = INDICES.map((i) => i.symbol);

export function IndexStrip() {
  const { quotes } = useStocks(INDEX_SYMBOLS);

  return (
    <section
      aria-label="Market indices"
      className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {INDICES.map(({ symbol, name }) => {
        const q = quotes[symbol]?.ok ? quotes[symbol] : undefined;
        const change = changePct(q?.price, q?.prevClose);
        const tone = change == null ? 'flat' : change >= 0 ? 'up' : 'down';
        const color = tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#5B6B85]';
        return (
          <div
            key={symbol}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#1C2740] bg-[#0A0F1A] px-4 py-3"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{name}</p>
              <p className="mt-0.5 font-mono text-base text-[#E7EEF9]">
                {q?.price != null ? inrPlain(q.price) : '—'}
              </p>
            </div>
            <div className={`text-right font-mono text-xs ${color}`}>
              <p>{pct(change)}</p>
              {q?.prevClose != null && change != null && (
                <p className="text-[10px] text-[#5B6B85]">
                  {change >= 0 ? '+' : ''}
                  {(q.price! - q.prevClose).toFixed(1)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
