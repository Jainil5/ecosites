'use client';

import { BadgePercent, Check, MessageCircle } from 'lucide-react';
import { offers } from './data';
import { Reveal } from './Reveal';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

function whatsappLink(title: string): string {
  const text = encodeURIComponent(`Hi Hair Adore, I'd like to know more about the "${title}" offer.`);
  return `https://wa.me/919876543210?text=${text}`;
}

export function OffersStrip() {
  return (
    <section id="offers" className="scroll-mt-24 overflow-hidden py-16">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="ha-depth font-serif text-4xl text-stone-900 sm:text-5xl">Offers &amp; Packages</h2>
            <div className="my-4 h-0.5 w-16 bg-[#C1613C]" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#C1613C]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9E4A2B]">
            <BadgePercent aria-hidden className="h-3.5 w-3.5" /> Limited-time deals
          </span>
        </Reveal>
      </div>

      <div className="ha-scroll-x mx-auto flex max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6">
        {offers.map((o) => {
          const save = o.oldPrice - o.price;
          return (
            <article
              key={o.title}
              className="group relative w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_24px_50px_-18px_rgba(43,33,24,0.35)] sm:w-[340px]"
            >
              <div className={`relative bg-gradient-to-br ${o.tint} p-5 text-white`}>
                <span aria-hidden className="absolute inset-0 bg-[#2B2118]/25" />
                <span className="absolute right-4 top-4 z-10 rounded-full bg-[#2B2118]/40 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
                  SAVE {inr(save)}
                </span>
                <h3 className="relative z-10 font-serif text-xl leading-tight">{o.title}</h3>
                <p className="relative z-10 mt-1 text-xs text-white/90">{o.tagline}</p>
              </div>
              <div className="p-5">
                <ul className="space-y-1.5">
                  {o.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2 text-sm text-stone-600">
                      <Check aria-hidden className="h-3.5 w-3.5 text-[#C1613C]" /> {inc}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  {o.perk}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-xs text-stone-500 line-through">{inr(o.oldPrice)}</span>
                    <span className="ml-2 font-serif text-2xl font-bold text-[#9E4A2B]">{inr(o.price)}</span>
                  </div>
                  <a
                    href={whatsappLink(o.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Enquire about ${o.title} on WhatsApp`}
                    className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#C1613C] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#9E4A2B]"
                  >
                    <MessageCircle aria-hidden className="h-3.5 w-3.5" /> Grab
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mx-auto mt-2 max-w-7xl px-4 text-center text-xs text-stone-500 sm:text-left">
        Swipe for more · Offer prices are per person unless stated. Cannot be clubbed with other discounts.
      </p>
    </section>
  );
}
