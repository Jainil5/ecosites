// test/brand-offer.test.ts
//
// A discount is a promise about money, so it is the one piece of marketing
// copy that cannot be allowed to drift: the rate, what it comes off, how long
// it holds and the closing date have to read the same everywhere, and they
// have to stay true after the campaign ends. Everything below is a guard on
// that record — and on the monthly relationship the record now offers.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { campaign, endsOnLabel, offerLabel } from '@/content/brand/campaign';
import { engagement } from '@/content/brand/solutions';
import { processSteps } from '@/content/brand/process';
import { pillars, whyPoints } from '@/content/brand/whyus';

const read = (rel: string) => readFileSync(rel, 'utf8');

describe('the campaign record', () => {
  it('is switched off cleanly, or on with real values', () => {
    if (!campaign) {
      expect(campaign).toBeNull();
      return;
    }
    expect(campaign.percent).toBeGreaterThan(0);
    expect(campaign.percent).toBeLessThan(100);
    expect(campaign.endsOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // A date left on the books after it passed would keep advertising an expired
    // offer on every page until somebody noticed. This test is the somebody.
    expect(
      new Date(`${campaign.endsOn}T23:59:59`).getTime(),
      `offer closed on ${campaign.endsOn} — set campaign to null or move the date`,
    ).toBeGreaterThanOrEqual(Date.now());
  });

  it('never lets the prose contradict the number', () => {
    if (!campaign) return;
    const fields = [campaign.headline, campaign.detail, campaign.cta, ...campaign.terms];
    for (const text of fields) {
      for (const [, written] of text.matchAll(/(\d{1,3})\s*%/g)) {
        expect(Number(written), text).toBe(campaign.percent);
      }
      if (/half/i.test(text)) expect(campaign.percent, text).toBe(50);
      if (/quarter/i.test(text)) expect(campaign.percent, text).toBe(25);
    }
    // The prefilled enquiry carries no rate, so it cannot fall out of step.
    expect(campaign.whatsappMessage).not.toMatch(/\d/);
  });

  it('says what it does not cover', () => {
    if (!campaign) return;
    expect(campaign.terms.length).toBeGreaterThanOrEqual(2);
    for (const term of campaign.terms) expect(term.trim().length).toBeGreaterThan(0);
  });

  // A discount on the work we charge once is a nudge to buy; a discount on the
  // monthly plan is a promise to stay. The offer is only honest if the copy
  // says which one it is.
  it('comes off the monthly plan, not off a fee we make once', () => {
    if (!campaign) return;
    expect(campaign.subject.trim().length).toBeGreaterThan(0);
    const text = [campaign.headline, campaign.detail, campaign.cta, ...campaign.terms].join(' ');
    expect(text.toLowerCase()).toContain(campaign.subject.toLowerCase());
    expect(text.toLowerCase(), text).toContain('month');
    expect(text).not.toMatch(/build fee|handover|build once|one[- ]time|one off/i);
  });

  // Half off with no end date is not a discount, it is a different rate card,
  // so how long the offer holds has to be in the open — in the record's own
  // words rather than a number retyped into a sentence.
  it('says how long the discounted rate holds', () => {
    if (!campaign) return;
    const { detail, period, terms } = campaign;
    expect(period.trim().length).toBeGreaterThan(0);
    expect(detail).toContain(period);
    expect(terms.some((term) => term.includes(period))).toBe(true);
    expect(terms.join(' ')).toMatch(/standard rate/);
  });

  it('quotes a rate, never an amount', () => {
    if (!campaign) return;
    const text = [
      campaign.headline,
      campaign.detail,
      campaign.cta,
      campaign.whatsappMessage,
      ...campaign.terms,
    ].join(' ');
    // `Rs` only reads as money when an amount follows it: unanchored, it would
    // flag "the first twelve months" and teach copy to avoid plain English.
    expect(text).not.toMatch(/₹|Rs\.?\s*\d|starting at|price[d]? from/i);
  });

  it('reads as a date a person can check, not a countdown', () => {
    const band = read('components/brand/OfferBand.tsx');
    expect(band).not.toMatch(/setInterval|setTimeout|requestAnimationFrame|Date\.now/);
    expect(endsOnLabel('2026-11-30')).toMatch(/^30 \w+ 2026$/);
    expect(offerLabel(50)).toBe('50% off');
  });
});

describe('the surfaces that show it', () => {
  it('all of them render from the record and write no number of their own', () => {
    const band = read('components/brand/OfferBand.tsx');
    expect(band).toMatch(/campaign\.percent/);
    expect(band).toMatch(/endsOnLabel\(campaign\.endsOn\)/);
    expect(band).toMatch(/whatsappHrefMessage\(company\.contact, campaign\.whatsappMessage\)/);
    // Not one literal percentage in the component that draws the offer.
    expect(band).not.toMatch(/\d{1,3}\s*%/);
  });

  // The three surfaces used to spell out what the discount came off, which is
  // how an offer about the build survived a change of mind. The scope is a
  // field now, and a component that names it again is a bug.
  it('takes the scope of the offer from the record', () => {
    const band = read('components/brand/OfferBand.tsx');
    expect(band).not.toMatch(/build fee|handover/i);
    expect(band.match(/campaign\.subject/g)?.length).toBe(3);
    expect(band).toMatch(/campaign\.period/);
  });

  it('is on the opening screen, in a band, and at the foot of the feature', () => {
    expect(read('app/(site)/products/page.tsx')).toMatch(/<OfferBand index="04" \/>/);
    expect(read('components/brand/Hero.tsx')).toMatch(/<OfferNote \/>/);
    expect(read('components/brand/ProductFeature.tsx')).toMatch(/<OfferRibbon \/>/);
  });

  // A badge per card is retail signage, and it argued with everything around
  // it. The offer is a sentence now, so nothing may put the rate back on a
  // sticker or repeat it on a product card.
  it('is written as a sentence, never stuck on a card', () => {
    const band = read('components/brand/OfferBand.tsx');
    expect(band).not.toMatch(/OfferBadge/);
    expect(band).toMatch(/export function OfferNote/);
    expect(read('components/brand/ProductsGrid.tsx')).not.toMatch(/Offer/);
    // The rate keeps its size inside the band, in bone, beside a rule — not on
    // a filled block of accent colour.
    expect(band).toMatch(/gs-display text-5xl leading-none text-ink/);
    expect(band).not.toMatch(/bg-plane|bg-accent/);
  });

  it('disappears with the record', () => {
    const band = read('components/brand/OfferBand.tsx');
    // Three exports, three guards: switch the campaign off and each renders nil.
    expect(band.match(/if \(!campaign\) return null;/g)?.length).toBe(3);
  });

  it('gives every shelf an anchor the menu can point at', () => {
    const grid = read('components/brand/ProductsGrid.tsx');
    expect(grid).toMatch(/id=\{shelf\.group\.id\}/);
    // The tab bar is a table of contents first and a filter second: every
    // control still carries its shelf anchor, so a menu link, a bookmark and a
    // reader with JavaScript off all land in the same band.
    expect(grid).toMatch(/href: `#\$\{shelf\.group\.id\}`/);
    expect(grid).toMatch(/href=\{tab\.href\}/);
  });
});

// An offer on a monthly plan is only believable if the brand elsewhere says it
// is on one too. These are the registries and pages that carry the cadence; if
// one of them reverts to build-and-hand-over, the campaign is advertising a
// relationship the rest of the site denies.
describe('the relationship the offer is made inside', () => {
  it('runs monthly in the registries every page reads from', () => {
    const steps = processSteps.map((step) => `${step.name} ${step.detail}`).join(' ');
    expect(steps).toMatch(/monthly/i);

    const why = [...whyPoints, ...pillars].map((p) => `${p.title} ${p.detail}`).join(' ');
    expect(why).toMatch(/month/i);
    expect(why).not.toMatch(/after launch/i);

    const running = engagement.join(' ');
    expect(running).toMatch(/monthly/i);
    expect(running).not.toMatch(/handover|optional ongoing/i);
  });

  it('is said out loud on the two pages an enquiry is decided on', () => {
    expect(read('app/(site)/products/page.tsx')).toMatch(/runs monthly/i);
    expect(read('components/brand/Hero.tsx')).toMatch(/runs monthly/i);
  });

  it('is not contradicted anywhere else in the brand copy', () => {
    const brandCopy = [campaign, ...processSteps, ...whyPoints, ...pillars, ...engagement]
      .map((entry) => JSON.stringify(entry))
      .join(' ');
    expect(brandCopy).not.toMatch(/build once|hand ?over running|deliver and (leave|disappear)/i);
  });
});
