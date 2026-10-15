'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, RefreshCw, Search, Star, TrendingDown, TrendingUp } from 'lucide-react';
import { STOCKS, SECTORS, capTier, type StockMeta } from './data';
import { useStocks } from './useStocks';
import { useLiveTicks } from './useLiveTicks';
import { Heatmap } from './Heatmap';
import { IndexStrip } from './IndexStrip';
import { NewsDesk } from './NewsDesk';
import { ScreenerTable, type ScreenerRow, type SortKey, type SortState } from './ScreenerTable';
import { changePct, compact, inr, pct } from './format';

const SYMBOLS = STOCKS.map((s) => s.symbol);

type MoverFilter = 'all' | 'gainers' | 'losers';
type CapFilter = 'all' | 'mega' | 'large' | 'mid';

const selectClass =
  'focus-ring rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2 font-mono text-xs text-[#E7EEF9] outline-none';

function StatCard({
  label,
  value,
  sub,
  tone,
  icon,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
  delay?: number;
}) {
  const color = tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#E7EEF9]';
  const flash = tone === 'up' ? 'mp-flash-up' : tone === 'down' ? 'mp-flash-down' : null;
  return (
    <div
      className="mp-rise mp-lift relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-[#1C2740] bg-[#0A0F1A] px-4 py-3"
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      {flash && (
        <span aria-hidden key={value} className={`pointer-events-none absolute inset-0 ${flash}`} />
      )}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">{label}</p>
        <p className={`mt-1 font-mono text-lg ${color}`}>{value}</p>
        {sub && <p className="font-mono text-[10px] text-[#5B6B85]">{sub}</p>}
      </div>
      {icon && <span className="text-[#2A3A57]">{icon}</span>}
    </div>
  );
}

export function StockScreener() {
  const { quotes, loading, failed, updatedAt } = useStocks(SYMBOLS);
  const { ticks, live, lastTickAt } = useLiveTicks(SYMBOLS);
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('all');
  const [cap, setCap] = useState<CapFilter>('all');
  const [mover, setMover] = useState<MoverFilter>('all');
  const [sort, setSort] = useState<SortState>({ key: 'mcap', dir: 'desc' });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [onlyWatched, setOnlyWatched] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    try {
      const watch = JSON.parse(window.localStorage.getItem('marketpulse.watch') ?? '[]');
      if (Array.isArray(watch)) setWatchlist(watch.filter((s) => typeof s === 'string'));
    } catch {
      // corrupt storage; start empty
    }
  }, []);

  const toggleWatch = (symbol: string) =>
    setWatchlist((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      window.localStorage.setItem('marketpulse.watch', JSON.stringify(next));
      return next;
    });

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo<ScreenerRow[]>(
    () =>
      STOCKS.map((meta) => ({
        meta,
        quote: quotes[meta.symbol]?.ok ? quotes[meta.symbol] : undefined,
        tick: ticks[meta.symbol],
      })),
    [quotes, ticks],
  );

  const stats = useMemo(() => {
    let advancers = 0;
    let decliners = 0;
    let unchanged = 0;
    let volume = 0;
    let best: { meta: StockMeta; change: number } | null = null;
    let worst: { meta: StockMeta; change: number } | null = null;
    for (const { meta, quote, tick } of rows) {
      if (!quote) continue;
      const change = changePct(tick?.price ?? quote.price, quote.prevClose);
      if (change == null) continue;
      volume += quote.volume ?? 0;
      if (change > 0.05) advancers++;
      else if (change < -0.05) decliners++;
      else unchanged++;
      if (!best || change > best.change) best = { meta, change };
      if (!worst || change < worst.change) worst = { meta, change };
    }
    return { advancers, decliners, unchanged, volume, best, worst };
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter(({ meta, quote, tick }) => {
      if (onlyWatched && !watchlist.includes(meta.symbol)) return false;
      if (q && !meta.symbol.toLowerCase().includes(q) && !meta.name.toLowerCase().includes(q)) return false;
      if (sector !== 'all' && meta.sector !== sector) return false;
      if (cap !== 'all' && capTier(meta.mcapCr) !== cap) return false;
      if (mover !== 'all' && quote) {
        const change = changePct(tick?.price ?? quote.price, quote.prevClose);
        if (change != null && (mover === 'gainers' ? change <= 0 : change >= 0)) return false;
      } else if (mover !== 'all' && !quote) {
        return false;
      }
      return true;
    });
    const value = (r: ScreenerRow): number | string => {
      switch (sort.key) {
        case 'name':
          return r.meta.symbol;
        case 'price':
          return r.tick?.price ?? r.quote?.price ?? -Infinity;
        case 'change':
          return changePct(r.tick?.price ?? r.quote?.price, r.quote?.prevClose) ?? -Infinity;
        case 'volume':
          return r.quote?.volume ?? -Infinity;
        case 'mcap':
          return r.meta.mcapCr;
        case 'pe':
          return r.meta.pe;
      }
    };
    return [...filtered].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      const cmp = typeof va === 'string' || typeof vb === 'string' ? String(va).localeCompare(String(vb)) : va - vb;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, query, sector, cap, mover, sort, onlyWatched, watchlist]);

  const onSort = (key: SortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }));

  const agoSec = updatedAt ? Math.max(0, Math.round((clock - updatedAt) / 1000)) : null;
  const agoTick = lastTickAt ? Math.max(0, Math.round((clock - lastTickAt) / 1000)) : null;

  return (
    <div className="relative min-h-screen bg-[#04060B] text-[#E7EEF9]">
      <div aria-hidden className="mp-bg">
        <div className="mp-bg-grid" />
        <div
          className="mp-glow mp-glow-a"
          style={{ left: '-12rem', top: '-10rem', background: 'radial-gradient(circle, rgba(22,199,132,0.55), transparent 65%)' }}
        />
        <div
          className="mp-glow mp-glow-b"
          style={{ right: '-16rem', top: '30%', background: 'radial-gradient(circle, rgba(77,163,255,0.45), transparent 65%)' }}
        />
      </div>
      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <header className="mp-scene mb-6">
          <div className="mp-rise mp-lift mp-lift-soft relative flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#1C2740]/70 bg-[#0A0F1A]/60 px-5 py-4 backdrop-blur-sm">
            <span aria-hidden key={updatedAt ?? 'boot'} className="mp-sheen" />
            <div>
              <Link
                href="/"
                className="focus-ring mb-3 inline-flex items-center gap-2 rounded font-mono text-xs text-[#5B6B85] transition-colors hover:text-[#16C784]"
              >
                <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
                Back to Website IN
              </Link>
              <h1 className="flex items-center gap-3 font-mono text-2xl tracking-tight">
                <span className="relative flex h-3 w-3" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16C784] opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#16C784]" />
                </span>
                <span className="slice">
                  <span className="slice-inner">Market Pulse</span>
                </span>
              </h1>
              <p className="mt-1 font-mono text-xs text-[#5B6B85]">
                NSE stock screener · live prices via Yahoo Finance
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2 font-mono text-[11px] text-[#8A98B0]">
              {live ? (
                <span className="relative flex h-2.5 w-2.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16C784] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16C784]" />
                </span>
              ) : (
                <RefreshCw aria-hidden className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''} text-[#16C784]`} />
              )}
              {failed
                ? 'data feed down — retrying'
                : live
                  ? agoTick == null
                    ? 'live feed connecting…'
                    : `LIVE · ticked ${agoTick}s ago`
                  : agoSec == null
                    ? 'connecting…'
                    : 'NSE closed · last session data'}
            </div>
          </div>
        </header>

        {failed && (
          <div className="mb-5 rounded-xl border border-[#EA3943]/40 bg-[#EA3943]/10 px-4 py-3 font-mono text-xs text-[#EA3943]">
            Market data is temporarily unavailable from the public feed. The screener keeps retrying every minute.
          </div>
        )}

        <IndexStrip />

        <section aria-label="Market breadth" className="mp-scene mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard delay={60} label="Advancers" value={String(stats.advancers)} tone="up" icon={<TrendingUp aria-hidden className="h-5 w-5" />} />
          <StatCard delay={120} label="Decliners" value={String(stats.decliners)} tone="down" icon={<TrendingDown aria-hidden className="h-5 w-5" />} />
          <StatCard delay={180} label="Unchanged" value={String(stats.unchanged)} tone="flat" icon={<Activity aria-hidden className="h-5 w-5" />} />
          <StatCard
            delay={240}
            label="Top gainer"
            value={stats.best ? stats.best.meta.symbol.replace('.NS', '') : '—'}
            sub={stats.best ? `${pct(stats.best.change)} · ${inr(ticks[stats.best.meta.symbol]?.price ?? quotes[stats.best.meta.symbol]?.price)}` : undefined}
            tone="up"
          />
          <StatCard
            delay={300}
            label="Top loser"
            value={stats.worst ? stats.worst.meta.symbol.replace('.NS', '') : '—'}
            sub={stats.worst ? `${pct(stats.worst.change)} · ${inr(ticks[stats.worst.meta.symbol]?.price ?? quotes[stats.worst.meta.symbol]?.price)}` : undefined}
            tone="down"
          />
          <StatCard delay={360} label="Tracked volume" value={stats.volume ? compact(stats.volume) : '—'} sub="shares today" />
        </section>

        <Heatmap cells={rows} />

        <section aria-label="Screener filters" className="mp-rise mb-4 flex flex-wrap items-center gap-2" style={{ '--d': '420ms' } as React.CSSProperties}>
          <label className="relative flex-1 min-w-[180px]">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5B6B85]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbol or company…"
              aria-label="Search stocks"
              className={`${selectClass} w-full pl-9`}
            />
          </label>
          <select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Filter by sector" className={selectClass}>
            <option value="all">All sectors</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={cap}
            onChange={(e) => setCap(e.target.value as CapFilter)}
            aria-label="Filter by market cap tier"
            className={selectClass}
          >
            <option value="all">Any size</option>
            <option value="mega">Mega cap</option>
            <option value="large">Large cap</option>
            <option value="mid">Mid cap</option>
          </select>
          <select
            value={mover}
            onChange={(e) => setMover(e.target.value as MoverFilter)}
            aria-label="Filter by movers"
            className={selectClass}
          >
            <option value="all">All movers</option>
            <option value="gainers">Gainers only</option>
            <option value="losers">Losers only</option>
          </select>
          <button
            type="button"
            onClick={() => setOnlyWatched((v) => !v)}
            aria-pressed={onlyWatched}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
              onlyWatched
                ? 'border-[#F5A623]/50 bg-[#F5A623]/10 text-[#F5A623]'
                : 'border-[#1C2740] bg-[#0A0F1A] text-[#5B6B85] hover:text-[#E7EEF9]'
            }`}
          >
            <Star aria-hidden className="h-3.5 w-3.5" fill={onlyWatched ? 'currentColor' : 'none'} />
            Watchlist{watchlist.length > 0 ? ` (${watchlist.length})` : ''}
          </button>
          <span className="ml-auto font-mono text-[11px] text-[#5B6B85]">
            {visible.length} / {STOCKS.length} stocks
          </span>
        </section>

        <ScreenerTable
          rows={visible}
          loading={loading}
          sort={sort}
          onSort={onSort}
          watched={watchlist}
          onWatchToggle={toggleWatch}
        />

        <NewsDesk />

        <footer className="mt-8 border-t border-[#131C2E] pt-5 font-mono text-[10px] leading-relaxed text-[#3D4C68]">
          Prices stream from Yahoo Finance’s public endpoints; fundamentals (P/E, market cap, dividend,
          EPS) are reference data refreshed on a schedule. Not investment advice.
        </footer>
      </div>
    </div>
  );
}
