'use client';

import { useMemo, useState } from 'react';
import { Gauge, ListChecks, Scale } from 'lucide-react';
import { useMarket } from './useMarket';
import { sectionBy } from './sections';
import { breadth, type Scorecard } from './analytics';
import { rsiLabel } from './indicators';
import { Chip, DeltaPill, FailedNote, Meter, Panel, ResultFoot, SectionHead, Skeleton } from './SectionKit';
import { Reveal } from './motion/Reveal';
import { DUR, vtName } from './motion/tokens';
import { vtRef } from './motion/vtRef';
import { inr, mcapLabel, pct } from './format';
import { symbolToSlug } from './data';

type Filter = 'all' | 'bullish' | 'bearish' | 'overbought' | 'oversold';
type SortKey = 'mcap' | 'price' | 'change' | 'rsi' | 'pos52';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All signals' },
  { key: 'bullish', label: 'Bullish' },
  { key: 'bearish', label: 'Bearish' },
  { key: 'overbought', label: 'Overbought' },
  { key: 'oversold', label: 'Oversold' },
];

function match(c: Scorecard, f: Filter): boolean {
  switch (f) {
    case 'bullish':
      return c.trend === 'bullish';
    case 'bearish':
      return c.trend === 'bearish';
    case 'overbought':
      return c.rsi != null && c.rsi >= 70;
    case 'oversold':
      return c.rsi != null && c.rsi <= 30;
    default:
      return true;
  }
}

const sortValue = (c: Scorecard, k: SortKey): number =>
  k === 'mcap' ? c.mcapCr : k === 'price' ? c.price : k === 'change' ? (c.change ?? -Infinity) : k === 'rsi' ? (c.rsi ?? -1) : (c.pos52 ?? -1);

/**
 * The stance is a count, not a call: the majority trend of the tracked list,
 * read straight off the same 50/200-day rule the scorecard uses.
 */
function stance(b: ReturnType<typeof breadth>) {
  if (b.total === 0) return { label: 'No data', tone: 'flat' as const, note: 'The sweep has not returned yet.' };
  const bullShare = b.bullish / b.total;
  const bearShare = b.bearish / b.total;
  if (bullShare >= 0.5) return { label: 'Risk-on', tone: 'up' as const, note: `${b.bullish} of ${b.total} tracked names are above both their 50- and 200-day averages.` };
  if (bearShare >= 0.5) return { label: 'Risk-off', tone: 'down' as const, note: `${b.bearish} of ${b.total} tracked names are below both their 50- and 200-day averages.` };
  return { label: 'Split tape', tone: 'flat' as const, note: `${b.bullish} bullish against ${b.bearish} bearish — no side holds a majority.` };
}

export function AnalysisPage() {
  const section = sectionBy('analysis');
  const { data, loading, failed } = useMarket();
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'mcap', dir: 'desc' });

  const cards = useMemo(() => data?.cards ?? [], [data]);
  const b = useMemo(() => breadth(cards), [cards]);
  const rows = useMemo(() => {
    const filtered = cards.filter((c) => match(c, filter));
    return [...filtered].sort((x, y) => (sort.dir === 'asc' ? 1 : -1) * (sortValue(x, sort.key) - sortValue(y, sort.key)));
  }, [cards, filter, sort]);

  const onSort = (key: SortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const verdict = stance(b);
  const toneClass = verdict.tone === 'up' ? 'text-[#16C784]' : verdict.tone === 'down' ? 'text-[#EA3943]' : 'text-[#F5A623]';

  const chips = (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter signals">
      {FILTERS.map((f) => (
        <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
          {f.label}
        </Chip>
      ))}
    </div>
  );

  return (
    <>
      <SectionHead title={section.title} blurb={section.blurb} aside={chips} />

      {loading && !data && (
        <Panel title="Technical scorecard">
          <Skeleton rows={8} />
        </Panel>
      )}
      {failed && !data && <FailedNote text="The market sweep is temporarily unavailable. This page retries every minute." />}

      {data && data.cards.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Reveal className="mp-scene h-full">
              <Panel title="Market stance" aside={<Gauge aria-hidden className="h-4 w-4 text-[#16C784]" />}>
                <p className={`font-mono text-2xl tracking-tight ${toneClass}`}>{verdict.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#8A98B0]">{verdict.note}</p>
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[#131C2E]">
                  <span className="h-full bg-[#16C784]" style={{ width: `${(b.bullish / b.total) * 100}%` }} />
                  <span className="h-full bg-[#2A3A57]" style={{ width: `${(b.neutral / b.total) * 100}%` }} />
                  <span className="h-full bg-[#EA3943]" style={{ width: `${(b.bearish / b.total) * 100}%` }} />
                </div>
                <p className="mt-2 font-mono text-[10px] text-[#5B6B85]">
                  {b.bullish} bullish · {b.neutral} mixed · {b.bearish} bearish
                </p>
              </Panel>
            </Reveal>

            <Reveal className="mp-scene h-full" delay={DUR.stagger}>
              <Panel title="Breadth" sub="Today's session across the tracked list" aside={<Scale aria-hidden className="h-4 w-4 text-[#4DA3FF]" />}>
                <div className="space-y-3">
                  <BreadthBar advancers={b.advancers} decliners={b.decliners} unchanged={b.unchanged} />
                  <MeterRow label="Above 50-day average" value={b.aboveSma50} total={b.total} tone="blue" />
                  <MeterRow label="Above 200-day average" value={b.aboveSma200} total={b.total} tone="amber" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">Average move</span>
                    <DeltaPill value={b.avgChange} />
                  </div>
                </div>
              </Panel>
            </Reveal>

            <Reveal className="mp-scene h-full" delay={DUR.stagger * 2}>
              <Panel title="How this is read" aside={<ListChecks aria-hidden className="h-4 w-4 text-[#F5A623]" />}>
                <dl className="space-y-2.5 text-[11px] leading-relaxed text-[#8A98B0]">
                  <Rule term="Bullish" body="Price above its 50-day average, and that average above the 200-day." />
                  <Rule term="Bearish" body="Price below its 50-day average, and that average below the 200-day." />
                  <Rule term="RSI (14)" body="Above 70 has been overbought, below 30 oversold — momentum, not a target." />
                  <Rule term="Range" body="Where the price sits between its 52-week low and high." />
                </dl>
              </Panel>
            </Reveal>
          </div>

          <Reveal className="mp-scene h-full" delay={DUR.stagger * 2}>
            <Panel
              title="Technical scorecard"
              sub="Every tracked name, swept from the same daily closes the charts use"
            >
              <div className="-mx-4 overflow-x-auto px-4">
                <table className="mps-table w-full min-w-[46rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#131C2E]">
                      <Th onClick={() => onSort('mcap')} active={sort.key === 'mcap'} dir={sort.dir}>
                        Stock
                      </Th>
                      <Th onClick={() => onSort('price')} active={sort.key === 'price'} dir={sort.dir} align="right">
                        Price
                      </Th>
                      <Th onClick={() => onSort('change')} active={sort.key === 'change'} dir={sort.dir} align="right">
                        1D
                      </Th>
                      <Th onClick={() => onSort('rsi')} active={sort.key === 'rsi'} dir={sort.dir} align="right">
                        RSI
                      </Th>
                      <th className="py-2 pr-3 font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">Trend</th>
                      <Th onClick={() => onSort('pos52')} active={sort.key === 'pos52'} dir={sort.dir} align="right">
                        52-wk range
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <ScoreRow key={c.symbol} card={c} />
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && (
                <p className="py-3 font-mono text-xs text-[#5B6B85]">No stock matches this signal right now.</p>
              )}
              <ResultFoot count={rows.length} asOf={data.asOf} noun="stocks" />
            </Panel>
          </Reveal>
        </div>
      )}
    </>
  );
}

function Rule({ term, body }: { term: string; body: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-[#E7EEF9]">{term}</dt>
      <dd className="mt-0.5">{body}</dd>
    </div>
  );
}

function BreadthBar({ advancers, decliners, unchanged }: { advancers: number; decliners: number; unchanged: number }) {
  const n = advancers + decliners + unchanged;
  if (!n) return null;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-[#131C2E]">
        <span className="h-full bg-[#16C784]" style={{ width: `${(advancers / n) * 100}%` }} />
        <span className="h-full bg-[#2A3A57]" style={{ width: `${(unchanged / n) * 100}%` }} />
        <span className="h-full bg-[#EA3943]" style={{ width: `${(decliners / n) * 100}%` }} />
      </div>
      <p className="mt-2 font-mono text-[10px] text-[#5B6B85]">
        {advancers} advancing · {unchanged} flat · {decliners} declining
      </p>
    </div>
  );
}

function MeterRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'blue' | 'amber' }) {
  const pos = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#5B6B85]">
        <span>{label}</span>
        <span className="text-[#8A98B0]">
          {value}/{total}
        </span>
      </div>
      <Meter value={pos} tone={tone} />
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  align = 'left',
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: 'asc' | 'desc';
  align?: 'left' | 'right';
}) {
  return (
    <th className={`py-2 pr-3 ${align === 'right' ? 'text-right' : ''}`}>
      <button
        type="button"
        onClick={onClick}
        className={`focus-ring inline-flex min-h-10 items-center rounded font-mono text-[11px] uppercase tracking-wider transition-colors ${
          active ? 'text-[#E7EEF9]' : 'text-[#5B6B85] hover:text-[#8A98B0]'
        }`}
      >
        {children}
        {active && <span aria-hidden> {dir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  );
}

function ScoreRow({ card }: { card: Scorecard }) {
  const rsi = rsiLabel(card.rsi);
  const rsiTone = rsi.tone === 'up' ? 'text-[#16C784]' : rsi.tone === 'down' ? 'text-[#EA3943]' : 'text-[#8A98B0]';
  const trendTone =
    card.trend === 'bullish' ? 'text-[#16C784]' : card.trend === 'bearish' ? 'text-[#EA3943]' : 'text-[#8A98B0]';
  return (
    <tr className="border-b border-[#131C2E] last:border-0">
      <td className="py-2.5 pr-3">
        <a
          ref={vtRef(vtName(card.symbol))}
          href={`/stock-screener/${symbolToSlug(card.symbol)}`}
          className="focus-ring inline-flex min-h-10 flex-col justify-center rounded font-mono text-xs text-[#E7EEF9] transition-colors hover:text-[#16C784]"
        >
          {card.symbol.replace('.NS', '')}
          <span className="mt-0.5 block truncate text-[11px] text-[#5B6B85] sm:text-[10px]">
            {card.name} · {mcapLabel(card.mcapCr)}
          </span>
        </a>
      </td>
      <td className="py-2.5 pr-3 text-right font-mono text-xs tabular-nums text-[#E7EEF9]">{inr(card.price)}</td>
      <td className="py-2.5 pr-3 text-right">
        <DeltaPill value={card.change} />
      </td>
      <td className={`py-2.5 pr-3 text-right font-mono text-xs tabular-nums ${rsiTone}`}>
        {card.rsi == null ? '—' : card.rsi.toFixed(1)}
        <span className="mt-0.5 block text-[9px] uppercase tracking-wider">{rsi.text}</span>
      </td>
      <td className="py-2.5 pr-3">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${trendTone}`}>{card.trend}</span>
        <span className="mt-0.5 block font-mono text-[9px] text-[#5B6B85]">
          50d {pct(card.sma50 == null ? null : ((card.price - card.sma50) / card.sma50) * 100)} · 200d{' '}
          {pct(card.sma200 == null ? null : ((card.price - card.sma200) / card.sma200) * 100)}
        </span>
      </td>
      <td className="w-28 py-2.5 text-right">
        <div className="inline-flex w-24 flex-col items-end gap-1">
          <span className="font-mono text-[10px] tabular-nums text-[#8A98B0]">
            {card.pos52 == null ? '—' : `${Math.round(card.pos52)}%`}
          </span>
          <Meter value={card.pos52} />
        </div>
      </td>
    </tr>
  );
}
