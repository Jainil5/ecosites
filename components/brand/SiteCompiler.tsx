'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties, FormEvent } from 'react';
import { company } from '@/content/brand/company';
import { whatsappHref } from '@/content/brand/links';

/** Deterministic "generated" taglines — the card is a tease, not a quote. */
const TAGLINES = [
  'Book online in fifteen seconds.',
  'Open all day. Asleep or not.',
  'Your menu, your numbers, your phone.',
  'Found on search. Chosen on sight.',
  'One tap from your next customer.',
];

const CHIPS = ['Services', 'Gallery', 'Prices', 'Book now'];

/** Staggered rise for each line of the compiled card. */
const d = (ms: number) => ({ '--d': `${ms}ms` } as CSSProperties);

function slugOf(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'your-business';
}

function taglineFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TAGLINES[h % TAGLINES.length];
}

function previewHref(name: string): string {
  return whatsappHref({
    ...company.contact,
    whatsappMessage: `Hi Website & Intelligence! I just saw "${name}" online on your site — I want this for my business.`,
  });
}

/**
 * The hero's interactive moment: type your business name, press SEE YOUR
 * SITE, and a mock site assembles itself line by line on a paper card.
 * Pure client-side theater — the real work starts on WhatsApp.
 */
export function SiteCompiler() {
  const [name, setName] = useState('');
  const [compiled, setCompiled] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const clean = name.trim().slice(0, 40);
    if (clean) setCompiled(clean);
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={onSubmit} className="flex flex-wrap items-stretch gap-2">
        <label htmlFor="biz-name" className="sr-only">
          Your business name
        </label>
        <input
          id="biz-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your-business-name"
          autoComplete="off"
          maxLength={40}
          className="focus-ring min-w-[14rem] flex-1 border border-hairline bg-paper px-4 py-3 font-label text-sm lowercase tracking-wide text-ink placeholder:text-ink-3 focus:border-plane focus:outline-none"
        />
        <button type="submit" className="focus-ring gs-btn gs-btn-solid">
          See your site
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {compiled ? (
          <div className="gs-card overflow-hidden">
            <div
              className="gs-caps-rise flex items-center gap-1.5 border-b border-hairline bg-canvas px-4 py-2.5"
              style={d(120)}
            >
              <span aria-hidden className="h-2 w-2 rounded-full bg-plane" />
              <span aria-hidden className="h-2 w-2 rounded-full bg-lime" />
              <span aria-hidden className="h-2 w-2 rounded-full bg-plane" />
              <span className="ml-3 truncate font-label text-[11px] tracking-widest text-ink-3">
                www.{slugOf(compiled)}.in
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="gs-caps-rise flex flex-wrap gap-2" style={d(260)}>
                {CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="border border-hairline bg-canvas px-2.5 py-0.5 font-label text-[10px] uppercase tracking-widest text-ink-3"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <h3 className="gs-caps-rise gs-display gs-h3 mt-5" style={d(400)}>
                {compiled}
              </h3>
              <p className="gs-caps-rise mt-2 text-sm font-semibold text-plane" style={d(520)}>
                {taglineFor(compiled)}
              </p>
              <div
                className="gs-caps-rise mt-6 flex flex-wrap items-center gap-4 border-t border-hairline pt-5"
                style={d(660)}
              >
                <a
                  href={previewHref(compiled)}
                  data-cta="compiler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring gs-btn gs-btn-ghost"
                >
                  Make this real
                  <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                </a>
                <span className="font-label text-[11px] uppercase tracking-widest text-ink-3">
                  draft generated · live in days
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="gs-label">
            type your business name <span aria-hidden>/</span> see what online could look like
          </p>
        )}
      </div>
    </div>
  );
}
