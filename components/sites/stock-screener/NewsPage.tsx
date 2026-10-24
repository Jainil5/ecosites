'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Newspaper, Radio, Sparkles } from 'lucide-react';
import { useMarketNews } from './useNews';
import { sectionBy } from './sections';
import type { NewsItem } from './types';
import { agoLabel } from './format';
import { Chip, FailedNote, Panel, ResultFoot, SectionHead, Skeleton } from './SectionKit';
import { NewsList } from './NewsList';
import { Reveal } from './motion/Reveal';
import { DUR } from './motion/tokens';

export function NewsPage() {
  const section = sectionBy('news');
  const { data, loading, failed } = useMarketNews();
  const [category, setCategory] = useState('all');

  const items = useMemo(() => data?.items ?? [], [data]);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) counts.set(it.source, (counts.get(it.source) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [items]);

  const visible = useMemo(
    () => (category === 'all' ? items : items.filter((it) => it.category === category)),
    [items, category],
  );
  const featured = visible.find((it) => it.important) ?? visible[0];
  const rest = featured ? visible.filter((it) => it.link !== featured.link) : visible;

  return (
    <>
      <SectionHead
        title={section.title}
        blurb={section.blurb}
        aside={
          data && (
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B6B85]">
              <Radio aria-hidden className="h-3.5 w-3.5 text-[#16C784]" />
              {data.mode === 'llm' ? 'AI-enriched wire' : 'keyword-classified wire'}
            </span>
          )
        }
      />

      {loading && !data && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Panel title="The wire">
            <Skeleton rows={8} />
          </Panel>
          <Panel title="Coverage">
            <Skeleton rows={4} />
          </Panel>
        </div>
      )}

      {failed && !data && (
        <FailedNote text="The news wire is temporarily unavailable. It retries on the next minute." />
      )}

      {data && data.items.length === 0 && (
        <Panel title="The wire">
          <p className="py-3 font-mono text-xs text-[#5B6B85]">
            No headlines came back from the wire. Market Pulse polls Google News for Nifty, Sensex and Indian
            stock coverage.
          </p>
        </Panel>
      )}

      {data && data.items.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            {data.brief && (
              <Reveal className="mp-scene h-full">
                <Panel
                  title="Market brief"
                  sub="Generated from the headlines on this page — nothing outside them"
                  aside={<Sparkles aria-hidden className="h-4 w-4 text-[#16C784]" />}
                >
                  <p className="text-sm leading-relaxed text-[#C9D6EA]">{data.brief}</p>
                </Panel>
              </Reveal>
            )}

            <Reveal className="mp-scene h-full" delay={DUR.stagger}>
              <Panel
                title="The wire"
                sub={`${items.length} headlines from the last seven days`}
                aside={<Newspaper aria-hidden className="h-4 w-4 text-[#4DA3FF]" />}
              >
                {categories.length > 1 && (
                  <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by story type">
                    <Chip active={category === 'all'} onClick={() => setCategory('all')}>
                      All
                    </Chip>
                    {categories.map(([name, count]) => (
                      <Chip key={name} active={category === name} onClick={() => setCategory(name)}>
                        {name} ({count})
                      </Chip>
                    ))}
                  </div>
                )}

                {featured && <Feature item={featured} />}
                <div className={featured ? 'mt-3 border-t border-[#131C2E] pt-1' : ''}>
                  <NewsList items={rest} emptyText="That is the only headline in this story type right now." />
                </div>
                <ResultFoot count={visible.length} noun="headlines" />
              </Panel>
            </Reveal>
          </div>

          <div className="space-y-4">
            <Reveal className="mp-scene h-full" delay={DUR.stagger}>
              <Panel title="Coverage" sub="Where these headlines come from">
                <ul className="space-y-2">
                  {sources.map(([name, count]) => (
                    <li key={name}>
                      <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-[#5B6B85]">
                        <span className="truncate text-[#8A98B0]">{name}</span>
                        <span className="tabular-nums">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#131C2E]">
                        <span
                          className="mps-bar-segment block h-full rounded-full bg-[#4DA3FF]"
                          style={{ width: `${(count / (sources[0]?.[1] ?? 1)) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>

            <Reveal className="mp-scene h-full" delay={DUR.stagger * 2}>
              <Panel title="Story types" sub="How the wire is split">
                <ul className="divide-y divide-[#131C2E]">
                  {categories.map(([name, count]) => (
                    <li key={name} className="flex items-center justify-between py-2">
                      <button
                        type="button"
                        onClick={() => setCategory(name)}
                        className="focus-ring inline-flex min-h-10 items-center rounded font-mono text-xs text-[#8A98B0] transition-colors hover:text-[#16C784]"
                      >
                        {name}
                      </button>
                      <span className="font-mono text-[10px] tabular-nums text-[#5B6B85]">{count}</span>
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

function Feature({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="mp-lift group mb-3 block rounded-lg border border-[#1C2740] bg-[#0D1420] p-4"
    >
      <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#16C784]">
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16C784] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#16C784]" />
        </span>
        Lead story
      </p>
      <h4 className="mt-2 text-base leading-snug text-[#E7EEF9] transition-colors group-hover:text-[#16C784] sm:text-lg">
        {item.title}
      </h4>
      <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-[#5B6B85]">
        {item.source} · {agoLabel(item.publishedAt)}
        <ExternalLink aria-hidden className="h-3 w-3" />
      </p>
    </a>
  );
}
