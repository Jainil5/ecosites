'use client';

import { useMemo, useState } from 'react';
import { Flame, Mountain, TrendingDown, TrendingUp } from 'lucide-react';
import { useMarket } from './useMarket';
import { sectionBy } from './sections';
import {
  WINDOWS,
  mostActive,
  nearHighs,
  sectorRows,
  topMovers,
  type WindowKey,
} from './analytics';
import { Chip, DeltaPill, FailedNote, Panel, ReturnBar, ResultFoot, SectionHead, Skeleton, StockRow } from './SectionKit';
import { Reveal } from './motion/Reveal';
import { DUR } from './motion/tokens';
import { compact, pct } from './format';

const RANKED = WINDOWS.filter((w) => w.key !== '1D');
const LIST = 8;

export function TrendsPage() {
  const section = sectionBy('trends');
  const { data, loading, failed } = useMarket();
  const [win, setWin] = useState<WindowKey>('1W');

  const cards = data?.cards ?? [];
  const gainers = useMemo(() => topMovers(cards, win, LIST), [cards, win]);
  const losers = useMemo(() => topMovers(cards, win, LIST, 'asc'), [cards, win]);
  const sectors = useMemo(
    () => [...sectorRows(cards)].sort((a, b) => (b.returns[win] ?? -Infinity) - (a.returns[win] ?? -Infinity)),
    [cards, win],
  );
  const breakout = useMemo(() => nearHighs(cards, LIST), [cards]);
  const active = useMemo(() => mostActive(cards, LIST), [cards]);
  const scale = useMemo(
    () => sectors.reduce((m, s) => Math.max(m, Math.abs(s.returns[win] ?? 0)), 0),
    [sectors, win],
  );

  const timeframe = (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Leaderboard window">
      {RANKED.map((w) => (
        <Chip key={w.key} active={win === w.key} onClick={() => setWin(w.key)}>
          {w.label}
        </Chip>
      ))}
    </div>
  );

  return (
    <>
      <SectionHead title={section.title} blurb={section.blurb} aside={timeframe} />

      {loading && !data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title={`Top gainers · ${win}`}>
            <Skeleton rows={6} />
          </Panel>
          <Panel title={`Top losers · ${win}`}>
            <Skeleton rows={6} />
          </Panel>
        </div>
      )}

      {failed && !data && (
        <FailedNote text="The market sweep is temporarily unavailable. This page retries every minute." />
      )}

      {data && data.cards.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Reveal className="mp-scene h-full">
              <Panel
                title={`Top gainers · ${win}`}
                sub="Ranked on the return over the selected window"
                aside={<TrendingUp aria-hidden className="h-4 w-4 text-[#16C784]" />}
              >
                <ul className="divide-y divide-[#131C2E]">
                  {gainers.map((c, i) => (
                    <StockRow key={c.symbol} card={c} rank={i + 1} value={c.returns[win]} windowKey={win} />
                  ))}
                </ul>
                {gainers.length === 0 && <p className="font-mono text-xs text-[#5B6B85]">No data in this window yet.</p>}
              </Panel>
            </Reveal>
            <Reveal className="mp-scene h-full" delay={DUR.stagger}>
              <Panel
                title={`Top losers · ${win}`}
                sub="The other side of the same tape"
                aside={<TrendingDown aria-hidden className="h-4 w-4 text-[#EA3943]" />}
              >
                <ul className="divide-y divide-[#131C2E]">
                  {losers.map((c, i) => (
                    <StockRow key={c.symbol} card={c} rank={i + 1} value={c.returns[win]} windowKey={win} />
                  ))}
                </ul>
                {losers.length === 0 && <p className="font-mono text-xs text-[#5B6B85]">No data in this window yet.</p>}
              </Panel>
            </Reveal>
          </div>

          <Reveal className="mp-scene h-full" delay={DUR.stagger * 2}>
            <Panel
              title="Sector rotation"
              sub={`Average ${win} return of the tracked names in each sector`}
            >
              <ul className="divide-y divide-[#131C2E]">
                {sectors.map((s) => (
                  <li key={s.sector} className="grid grid-cols-[1fr_auto] items-center gap-3 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr_minmax(0,5rem)]">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-[#E7EEF9]">{s.sector}</p>
                      <p className="font-mono text-[10px] text-[#5B6B85]">
                        {s.count} names · {s.advancers} up / {s.decliners} down today
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <ReturnBar value={s.returns[win]} max={scale} />
                    </div>
                    <div className="justify-self-end">
                      <DeltaPill value={s.returns[win]} />
                    </div>
                  </li>
                ))}
              </ul>
              <ResultFoot count={sectors.length} asOf={data.asOf} noun="sectors" />
            </Panel>
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-2">
            <Reveal className="mp-scene h-full" delay={DUR.stagger * 2}>
              <Panel
                title="Pressing 52-week highs"
                sub="Trading within 10% of their yearly peak"
                aside={<Mountain aria-hidden className="h-4 w-4 text-[#4DA3FF]" />}
              >
                {breakout.length === 0 ? (
                  <p className="font-mono text-xs text-[#5B6B85]">
                    Nothing on the tracked list is near its high today.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#131C2E]">
                    {breakout.map((c, i) => (
                      <li key={c.symbol} className="flex items-center gap-3 py-2">
                        <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-[#5B6B85]">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs text-[#E7EEF9]">{c.symbol.replace('.NS', '')}</p>
                          <p className="truncate text-[10px] text-[#5B6B85]">{c.name}</p>
                        </div>
                        <span className="hidden font-mono text-[11px] text-[#8A98B0] sm:inline">
                          {pct(c.returns['1M'])} 1M
                        </span>
                        <DeltaPill value={c.pos52} label={`${Math.round(c.pos52 ?? 0)}% of range`} />
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </Reveal>
            <Reveal className="mp-scene h-full" delay={DUR.stagger * 3}>
              <Panel
                title="Most active"
                sub="Turnover today, in shares"
                aside={<Flame aria-hidden className="h-4 w-4 text-[#F5A623]" />}
              >
                <ul className="divide-y divide-[#131C2E]">
                  {active.map((c, i) => (
                    <li key={c.symbol} className="flex items-center gap-3 py-2">
                      <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-[#5B6B85]">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs text-[#E7EEF9]">{c.symbol.replace('.NS', '')}</p>
                        <p className="truncate text-[10px] text-[#5B6B85]">{c.sector}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-[#8A98B0]">
                        {compact(c.volume)}
                      </span>
                      <DeltaPill value={c.change} />
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          </div>
        </div>
      )}
    </>
  );
}
