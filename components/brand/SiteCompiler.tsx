'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { FormEvent } from 'react';
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
    whatsappMessage: `Hi Website IN! I just saw "${name}" online on your site — I want this for my business.`,
  });
}

/**
 * The saze-style interactive moment: type your business name, press
 * SEE YOUR SITE, and a mock site compiles into existence on the glass
 * card. Pure client-side theater — the real work starts on WhatsApp.
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
          className="edge min-w-[14rem] flex-1 rounded-xl bg-white/[0.04] px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle/50 focus:bg-white/[0.07] focus:outline-none"
        />
        <button
          type="submit"
          className="go-cta focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 font-mono text-sm font-semibold"
        >
          SEE YOUR SITE
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </form>

      <div aria-live="polite" className="go-compile mt-6">
        {compiled ? (
          <div
            key={compiled}
            className="go-compile-card edge overflow-hidden rounded-2xl bg-deep/85 shadow-card backdrop-blur-sm"
          >
            <div className="go-line flex items-center gap-1.5 border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5" style={{ '--d': '120ms' } as React.CSSProperties}>
              <span aria-hidden className="h-2 w-2 rounded-full bg-[#EA3943]" />
              <span aria-hidden className="h-2 w-2 rounded-full bg-[#F5A623]" />
              <span aria-hidden className="h-2 w-2 rounded-full bg-[#16C784]" />
              <span className="ml-3 truncate font-mono text-[11px] text-subtle">
                www.{slugOf(compiled)}.in
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="go-line flex flex-wrap gap-2" style={{ '--d': '260ms' } as React.CSSProperties}>
                {CHIPS.map((chip) => (
                  <span key={chip} className="rounded-full border border-white/[0.08] px-2.5 py-0.5 font-mono text-[10px] text-subtle">
                    {chip}
                  </span>
                ))}
              </div>
              <h3 className="go-line mt-5 font-display text-3xl text-foreground sm:text-4xl" style={{ '--d': '400ms' } as React.CSSProperties}>
                {compiled}
              </h3>
              <p className="go-line mt-2 text-sm text-accent" style={{ '--d': '520ms' } as React.CSSProperties}>
                {taglineFor(compiled)}
              </p>
              <div className="go-line mt-6 flex flex-wrap items-center gap-4 border-t border-white/[0.07] pt-5" style={{ '--d': '660ms' } as React.CSSProperties}>
                <a
                  href={previewHref(compiled)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="go-cta focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-semibold"
                >
                  Make this real
                  <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[11px] text-subtle">
                  compiled in 0.4s · live in days
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="go-line font-mono text-[11px] text-subtle/70">
            $ type your business name — see what online could look like
          </p>
        )}
      </div>
    </div>
  );
}
