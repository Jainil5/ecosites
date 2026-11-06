/**
 * One campaign, read by every surface that shows it — the home band, the
 * product shelf, the note on the opening screen and the message that lands in
 * the inbox. A visitor can only be told the same offer twice if there is one
 * place that decides what it is.
 *
 * There is deliberately no date in here. A closing date is a promise somebody
 * has to keep policing, and every page that prints it keeps advertising an
 * expired offer the day it passes. The offer is stated as what it is — open
 * for a limited time — and the action is a conversation, not a countdown.
 */
export interface Campaign {
  /**
   * What the discount comes off, in the reader's words. The note, the ribbon
   * and the band all print it, so the scope of the offer is written once.
   */
  subject: string;
  /**
   * How long the discounted rate holds, as an open statement rather than a
   * deadline. It has to appear in the detail and in a term, so no surface can
   * quietly drop the condition while keeping the number.
   */
  period: string;
  /** Off the `subject` above, in whole percentage points. */
  percent: number;
  /** What the band is called. */
  headline: string;
  /** What the offer actually covers, in the reader's words. */
  detail: string;
  /** The two or three lines that keep the offer honest about its edges. */
  terms: string[];
  /** The button label — the offer is the reason to start the conversation. */
  cta: string;
  /** Where every offer action goes: the page that takes a brief. */
  ctaHref: string;
  /** Prefilled message, so the enquiry carries the rate it was written under. */
  whatsappMessage: string;
}

// The scope and the length of the offer are values, not prose: every sentence
// below is built from them, so changing the deal is one edit and no surface
// can be left advertising the old one.
const subject = 'all monthly subscriptions';
const period = 'for a limited time';

/**
 * Set this to `null` the day the campaign ends and every band, note, ribbon
 * and prefilled message disappears with it.
 */
export const campaign: Campaign | null = {
  subject,
  period,
  percent: 50,
  headline: `Half off ${subject}`,
  detail: `Every system here runs on a monthly plan, and we stay on it with you — the build is where the work starts, not where it ends. Brief us while the offer is open and the plan rate is half what it would be ${period}; it moves to the standard rate we agree before the first month, and the plan keeps running after that because the work keeps running.`,
  terms: [
    `Half the plan rate ${period} on any system we run for you — a website, an agent, a counter, an automation — with the standard rate agreed before the first month`,
    'It comes off the monthly plan, not off the quote for the work: you approve that before anything starts',
    'Hosting, licensing and any third-party accounts stay at cost — the discount is on the plan',
  ],
  cta: 'Contact us',
  ctaHref: '/contact',
  /**
   * Carries no number: the rate lives in `percent` alone, so changing it here
   * cannot leave an enquiry asking for a discount that no longer exists.
   */
  whatsappMessage:
    'I saw the offer on your monthly plans and I would like to start a system — here is what I need: ',
};

/** `true` while a campaign is on the books. */
export const campaignLive = campaign !== null;

/** '50% off' — the number as it appears beside a rule. */
export function offerLabel(percent: number): string {
  return `${percent}% off`;
}
