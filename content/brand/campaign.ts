/**
 * One campaign, read by every surface that shows it — the home band, the
 * product shelf, the cards themselves and the message that lands in the
 * inbox. A visitor can only be told the same offer twice if there is one
 * place that decides what it is.
 */
export interface Campaign {
  /**
   * What the discount comes off, in the reader's words. The badge, the ribbon
   * and the band all print it, so the scope of the offer is written once.
   */
  subject: string;
  /**
   * How long the discounted rate holds. An offer on a recurring plan is only
   * honest if it also says when the standard rate takes over.
   */
  period: string;
  /** Off the `subject` above, in whole percentage points. */
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

// The scope and the length of the offer are values, not prose: every sentence
// below is built from them, so changing the deal is one edit and no surface
// can be left advertising the old one.
const subject = 'all app subscriptions';
const period = 'for the first twelve months';

/**
 * Set this to `null` the day the campaign ends and every band, badge and
 * prefilled message disappears with it. `test/brand-offer.test.ts` fails if
 * a date is left behind that has already passed.
 */
export const campaign: Campaign | null = {
  subject,
  period,
  percent: 50,
  endsOn: '2026-11-30',
  headline: `Half off ${subject}`,
  detail: `Every system here runs on a monthly plan, and we stay on it with you — the build is where the work starts, not where it ends. Brief us before the month is out and the plan rate is half what it would be ${period}, then it moves to the standard rate we agree before the first month.`,
  terms: [
    `Half the plan rate ${period} on any system listed here, including an agent we wire to your own data; the standard rate applies from the month after`,
    'The brief has to reach us by the closing date; a plan opened after that runs at the standard rate',
    'Hosting, licensing and any third-party accounts stay at cost — the discount is on the plan',
  ],
  cta: 'Claim the plan rate',
  /**
   * Carries no number: the rate lives in `percent` alone, so changing it here
   * cannot leave an enquiry asking for a discount that no longer exists.
   */
  whatsappMessage:
    'I would like to start a system on your monthly plan, at the offer on your products page — here is what I need: ',
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
