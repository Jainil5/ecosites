'use client';

import { useState } from 'react';
import { Scissors, Sparkles } from 'lucide-react';
import { Stars } from './Stars';
import type { Review } from './data';

export function FlipReviewCard({ review }: { review: Review }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${review.name}'s review — ${flipped ? 'show details' : 'show review'}`}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      className="focus-ring ha-perspective h-full cursor-pointer rounded-2xl"
    >
      <div
        className={`preserve-3d relative h-full transition-transform duration-500 ease-out ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front — the review quote */}
        <div aria-hidden={flipped} className="ha-shadow backface-hidden relative flex h-full flex-col rounded-2xl border border-stone-200 bg-[#FAF6F0] p-8">
          <Stars />
          <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-600 italic">
            &ldquo;{review.text}&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <span aria-hidden className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${review.tint}`}>
                {review.initials}
              </span>
              <span>
                <span className="block text-sm font-semibold text-stone-900">{review.name}</span>
                <span className="block text-xs text-stone-500">{review.meta}</span>
              </span>
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-[#C1613C] uppercase">Details</span>
          </div>
        </div>

        {/* Back — visit details */}
        <div aria-hidden={!flipped} className="ha-shadow backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-stone-200 bg-[#2B2118] p-8 text-center [transform:rotateY(180deg)]">
          <span
            aria-hidden
            className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${review.tint}`}
          >
            {review.initials}
          </span>
          <div>
            <div className="font-serif text-xl font-bold text-white">{review.name}</div>
            <div className="mt-1 text-xs text-stone-300">{review.meta}</div>
          </div>
          <div className="mt-2 flex w-full flex-col gap-2 text-sm text-stone-200">
            <span className="flex items-center justify-center gap-2">
              <Sparkles aria-hidden className="h-4 w-4 text-[#E7B48F]" />
              {review.service}
            </span>
            <span className="flex items-center justify-center gap-2">
              <Scissors aria-hidden className="h-4 w-4 text-[#E7B48F]" />
              with {review.stylist}
            </span>
          </div>
          <Stars className="mt-1" />
        </div>
      </div>
    </div>
  );
}
