import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LineReveal } from '@/components/brand/LineReveal';
import { company } from '@/content/brand/company';
import { campaign, endsOnLabel, offerLabel } from '@/content/brand/campaign';
import { whatsappHrefMessage } from '@/content/brand/links';

/**
 * The campaign, in three weights. All three read the same record in
 * `content/brand/campaign.ts`, so the note on the landing page, the line at
 * the foot of a band and the announcement on the catalogue can never disagree
 * about the rate, the scope or the closing date. When the campaign is switched
 * off every one of them renders nothing.
 *
 * None of them is a sticker any more. A discount badge on every card is
 * retail signage, and it argued with the rest of the page; the offer is now
 * written as a sentence, in the same type weight as the sentence beside it.
 */

/** One sentence, for a page that has an offer but is not a sale. */
export function OfferNote() {
  if (!campaign) return null;
  return (
    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-3">
      <Link
        href="/products#offer"
        className="text-ink underline decoration-hairline underline-offset-4 transition-colors hover:decoration-forest"
      >
        {offerLabel(campaign.percent)} {campaign.subject} {campaign.period}
      </Link>
      , on any brief that reaches us before {endsOnLabel(campaign.endsOn)}.
    </p>
  );
}

/** One line, for the bottom of a section the offer belongs to. */
export function OfferRibbon() {
  if (!campaign) return null;
  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-xl text-sm leading-relaxed text-ink-2">
        <span className="text-ink">{offerLabel(campaign.percent)}</span> {campaign.subject},{' '}
        {campaign.period} — then the standard rate, agreed before the first month rather than after
        it. The plan is monthly either way: the work does not stop the day the system goes live. Any
        brief that reaches us before <span className="text-ink">{endsOnLabel(campaign.endsOn)}</span>{' '}
        starts at this rate.
      </p>
      <a
        href={whatsappHrefMessage(company.contact, campaign.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="offer-ribbon"
        className="focus-ring gs-btn gs-btn-sm gs-btn-ghost shrink-0"
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

        {/* The rate keeps its size — it is the reason the band exists — but it
            is set in bone, on the far side of a rule, with the terms beside it
            rather than under a neon block. */}
        <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-4 border-t border-hairline pt-8">
          <span className="gs-display text-5xl leading-none text-ink sm:text-6xl">
            {campaign.percent}%
          </span>
          <span className="gs-label max-w-xs leading-snug text-ink-3">
            off {campaign.subject}
            <br />
            {campaign.period}
            <br />
            <span className="text-ink-2">closes {endsOnLabel(campaign.endsOn)}</span>
          </span>
        </div>

        <ul className="mt-10 grid gap-px bg-hairline sm:grid-cols-3">
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
