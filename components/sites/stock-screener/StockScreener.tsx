'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, RefreshCw, Search, Star, TrendingDown, TrendingUp } from 'lucide-react';
import { STOCKS, SECTORS, capTier, type StockMeta } from './data';
import { useStocks } from './useStocks';
import { ChartPanel } from './ChartPanel';
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
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'up' | 'down' | 'flat';
  icon?: React.ReactNode;
}) {
  const color = tone === 'up' ? 'text-[#16C784]' : tone === 'down' ? 'text-[#EA3943]' : 'text-[#E7EEF9]';
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1C2740] bg-[#0A0F1A] px-4 py-3">
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
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('all');
  const [cap, setCap] = useState<CapFilter>('all');
  const [mover, setMover] = useState<MoverFilter>('all');
  const [sort, setSort] = useState<SortState>({ key: 'mcap', dir: 'desc' });
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [chartSymbol, setChartSymbol] = useState('RELIANCE.NS');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [onlyWatched, setOnlyWatched] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const saved = window.localStorage.getItem('marketpulse.chart');
    if (saved && STOCKS.some((s) => s.symbol === saved)) setChartSymbol(saved);
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

  const selectForChart = (symbol: string) => {
    setChartSymbol(symbol);
    window.localStorage.setItem('marketpulse.chart', symbol);
  };

  const focusChart = (symbol: string) => {
    selectForChart(symbol);
    document
      .querySelector('section[aria-label="Pro chart"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo<ScreenerRow[]>(
    () => STOCKS.map((meta) => ({ meta, quote: quotes[meta.symbol]?.ok ? quotes[meta.symbol] : undefined })),
    [quotes],
  );

  const stats = useMemo(() => {
    let advancers = 0;
    let decliners = 0;
    let unchanged = 0;
    let volume = 0;
    let best: { meta: StockMeta; change: number } | null = null;
    let worst: { meta: StockMeta; change: number } | null = null;
    for (const { meta, quote } of rows) {
      if (!quote) continue;
      const change = changePct(quote.price, quote.prevClose);
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
    const filtered = rows.filter(({ meta, quote }) => {
      if (onlyWatched && !watchlist.includes(meta.symbol)) return false;
      if (q && !meta.symbol.toLowerCase().includes(q) && !meta.name.toLowerCase().includes(q)) return false;
      if (sector !== 'all' && meta.sector !== sector) return false;
      if (cap !== 'all' && capTier(meta.mcapCr) !== cap) return false;
      if (mover !== 'all' && quote) {
        const change = changePct(quote.price, quote.prevClose);
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
          return r.quote?.price ?? -Infinity;
        case 'change':
          return changePct(r.quote?.price, r.quote?.prevClose) ?? -Infinity;
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

  return (
    <div className="min-h-screen bg-[#04060B] text-[#E7EEF9]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
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
              Market Pulse
            </h1>
            <p className="mt-1 font-mono text-xs text-[#5B6B85]">
              NSE stock screener · live prices via Yahoo Finance
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#1C2740] bg-[#0A0F1A] px-3 py-2 font-mono text-[11px] text-[#8A98B0]">
            <RefreshCw aria-hidden className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''} text-[#16C784]`} />
            {failed
              ? 'data feed down — retrying'
              : agoSec == null
                ? 'connecting…'
                : `updated ${agoSec}s ago · auto-refresh 60s`}
          </div>
        </header>

        {failed && (
          <div className="mb-5 rounded-xl border border-[#EA3943]/40 bg-[#EA3943]/10 px-4 py-3 font-mono text-xs text-[#EA3943]">
            Market data is temporarily unavailable from the public feed. The screener keeps retrying every minute.
          </div>
        )}

        <IndexStrip />

        <section aria-label="Market breadth" className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Advancers" value={String(stats.advancers)} tone="up" icon={<TrendingUp aria-hidden className="h-5 w-5" />} />
          <StatCard label="Decliners" value={String(stats.decliners)} tone="down" icon={<TrendingDown aria-hidden className="h-5 w-5" />} />
          <StatCard label="Unchanged" value={String(stats.unchanged)} tone="flat" icon={<Activity aria-hidden className="h-5 w-5" />} />
          <StatCard
            label="Top gainer"
            value={stats.best ? stats.best.meta.symbol.replace('.NS', '') : '—'}
            sub={stats.best ? `${pct(stats.best.change)} · ${inr(quotes[stats.best.meta.symbol]?.price)}` : undefined}
            tone="up"
          />
          <StatCard
            label="Top loser"
            value={stats.worst ? stats.worst.meta.symbol.replace('.NS', '') : '—'}
            sub={stats.worst ? `${pct(stats.worst.change)} · ${inr(quotes[stats.worst.meta.symbol]?.price)}` : undefined}
            tone="down"
          />
          <StatCard label="Tracked volume" value={stats.volume ? compact(stats.volume) : '—'} sub="shares today" />
        </section>

        <ChartPanel
          meta={STOCKS.find((s) => s.symbol === chartSymbol) ?? STOCKS[0]}
          quote={quotes[chartSymbol]?.ok ? quotes[chartSymbol] : undefined}
          refreshKey={updatedAt ?? undefined}
        />

        <Heatmap cells={rows} selectedSymbol={chartSymbol} onSelect={focusChart} />

        <section aria-label="Screener filters" className="mb-4 flex flex-wrap items-center gap-2">
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
          expandedSymbol={expandedSymbol}
          watched={watchlist}
          onWatchToggle={toggleWatch}
          onToggle={(symbol) => {
            setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
            selectForChart(symbol);
          }}
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
