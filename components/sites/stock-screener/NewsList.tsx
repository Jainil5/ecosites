'use client';

import { ExternalLink } from 'lucide-react';
import type { NewsItem } from './types';
import { agoLabel } from './format';

const CHIP: Record<string, string> = {
  Results: 'border-[#16C784]/40 text-[#16C784]',
  Dividend: 'border-[#4DA3FF]/40 text-[#4DA3FF]',
  Buyback: 'border-[#2DD4BF]/40 text-[#2DD4BF]',
  Orders: 'border-[#F5A623]/40 text-[#F5A623]',
  Analyst: 'border-[#A78BFA]/40 text-[#A78BFA]',
  'M&A': 'border-[#F472B6]/40 text-[#F472B6]',
  Expansion: 'border-[#84CC16]/40 text-[#84CC16]',
  Regulatory: 'border-[#EA3943]/40 text-[#EA3943]',
  Board: 'border-[#94A3B8]/40 text-[#94A3B8]',
  News: 'border-[#2A3A57] text-[#8A98B0]',
};

export function NewsList({ items, emptyText = 'No recent headlines.' }: { items: NewsItem[]; emptyText?: string }) {
  if (items.length === 0) {
    return <p className="py-3 font-mono text-xs text-[#5B6B85]">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-[#131C2E]">
      {items.map((item, i) => (
        <li key={`${item.link}-${i}`} className="py-2.5 first:pt-0 last:pb-0">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3"
          >
            <span
              className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${CHIP[item.category] ?? CHIP.News}`}
            >
              {item.category}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-snug text-[#C9D6EA] transition-colors group-hover:text-[#16C784]">
                {item.title}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-[#5B6B85]">
                {item.source} · {agoLabel(item.publishedAt)}
              </span>
            </span>
            <ExternalLink
              aria-hidden
              className="mt-1 h-3.5 w-3.5 shrink-0 text-[#2A3A57] transition-colors group-hover:text-[#16C784]"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
