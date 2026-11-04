/**
 * One campaign, read by every surface that shows it — the home band, the
 * product shelf, the cards themselves and the message that lands in the
 * inbox. A visitor can only be told the same offer twice if there is one
 * place that decides what it is.
 */
export interface Campaign {
  /** Off the build fee, in whole percentage points. */
  percent: number;
  /**
   * Last day a brief is taken at this rate, as an ISO date. The date is a
   * value rather than prose so no band can drift into a different deadline.
   */
  endsOn: string;
  /** What the band is called. */
  headline: string;
  /** What the offer actually covers, in the reader's words. */
  detail: string;
  /** The two or three lines that keep the offer honest about its edges. */
  terms: string[];
  /** The button label — the offer is the reason to start the conversation. */
  cta: string;
  /** Prefilled message, so the enquiry carries the rate it was written under. */
  whatsappMessage: string;
}

/**
 * Set this to `null` the day the campaign ends and every band, badge and
 * prefilled message disappears with it. `test/brand-offer.test.ts` fails if
 * a date is left behind that has already passed.
 */
export const campaign: Campaign | null = {
  percent: 50,
  endsOn: '2026-11-30',
  headline: 'Half off the build fee',
  detail:
    'Every product on this page is a system we build once and hand over running. Brief us before the month is out and the build fee is half what it would be — the catalogue, the analytics, the domain and the handover are all still in it.',
  terms: [
    'Applies to the build fee on any product listed here, including an agent we wire to your own data',
    'The brief has to reach us by the closing date; what we quote after that stays at that rate',
    'Hosting, licensing and any third-party accounts stay at cost — the discount is on the work',
  ],
  cta: 'Claim the rate',
  /**
   * Carries no number: the rate lives in `percent` alone, so changing it here
   * cannot leave an enquiry asking for a discount that no longer exists.
   */
  whatsappMessage:
    'I would like to start a build at the offer on your products page — here is what I need: ',
};

/** `true` while a campaign is on the books. */
export const campaignLive = campaign !== null;

/** '30 November 2026' — the closing date in the words a reader expects. */
export function endsOnLabel(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** '50% off' — the number as it appears on a badge. */
export function offerLabel(percent: number): string {
  return `${percent}% off`;
}
