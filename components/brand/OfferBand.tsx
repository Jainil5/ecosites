import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import { LineReveal } from '@/components/brand/LineReveal';
import { company } from '@/content/brand/company';
import { campaign, endsOnLabel, offerLabel } from '@/content/brand/campaign';
import { whatsappHrefMessage } from '@/content/brand/links';

/**
 * The campaign, in three weights. All three read the same record in
 * `content/brand/campaign.ts`, so the badge on a card, the strip on the home
 * page and the band on the catalogue can never disagree about the rate or the
 * closing date. When the campaign is switched off every one of them renders
 * nothing.
 */

/** The pill that sits on a product card. */
export function OfferBadge() {
  if (!campaign) return null;
  return (
    <span className="focus-ring gs-label inline-flex items-center gap-1.5 border border-lime/45 bg-lime/10 px-2.5 py-1 text-lime">
      <Tag aria-hidden className="h-3.5 w-3.5" />
      {offerLabel(campaign.percent)} {campaign.subject}
    </span>
  );
}

/** One line, for the bottom of a section the offer belongs to. */
export function OfferRibbon() {
  if (!campaign) return null;
  return (
    <div className="gs-card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-relaxed text-ink-2">
        <span className="font-semibold text-lime">{offerLabel(campaign.percent)}</span>{' '}
        {campaign.subject}, {campaign.period} — then the standard rate, agreed before the first
        month rather than after it. The plan is monthly either way: the work does not stop the day
        the system goes live. Any brief that reaches us before{' '}
        <span className="text-ink">{endsOnLabel(campaign.endsOn)}</span> starts at this rate.
      </p>
      <a
        href={whatsappHrefMessage(company.contact, campaign.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="offer-ribbon"
        className="focus-ring gs-btn gs-btn-sm gs-btn-solid shrink-0"
      >
        {campaign.cta}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </a>
    </div>
  );
}

interface OfferBandProps {
  /** Two-digit structural number, matching the section it follows. */
  index: string;
}

/** The full announcement: what is off, until when, and what it does not cover. */
export function OfferBand({ index }: OfferBandProps) {
  if (!campaign) return null;
  return (
    <section
      id="offer"
      className="gs-reveal -mx-6 gs-plane-b relative scroll-mt-24 overflow-hidden py-16 sm:py-20"
    >
      <span aria-hidden className="gs-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6">
        <p className="gs-label">
          <span className="gs-label-hot">{index}</span> <span aria-hidden>/</span> on right now
        </p>
        <h2 className="gs-display gs-h2 mt-3 max-w-3xl">
          <LineReveal text={campaign.headline} />
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-2">{campaign.detail}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="gs-display text-5xl leading-none text-lime sm:text-6xl">
            {campaign.percent}%
          </span>
          <span className="gs-label max-w-xs leading-snug text-ink-2">
            off {campaign.subject}
            <br />
            {campaign.period}
            <br />
            <span className="text-ink">closes {endsOnLabel(campaign.endsOn)}</span>
          </span>
        </div>

        <ul className="mt-8 grid gap-px bg-hairline sm:grid-cols-3">
          {campaign.terms.map((term) => (
            <li key={term} className="bg-canvas p-4 text-sm leading-relaxed text-ink-2">
              {term}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={whatsappHrefMessage(company.contact, campaign.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="offer-band"
            className="focus-ring gs-btn gs-btn-solid"
          >
            {campaign.cta}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </a>
          <Link href="/contact" className="focus-ring gs-btn gs-btn-ghost">
            Send the brief by mail
          </Link>
        </div>
      </div>
    </section>
  );
}
