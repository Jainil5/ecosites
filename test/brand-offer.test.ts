// test/brand-offer.test.ts
//
// A discount is a promise about money, so it is the one piece of marketing
// copy that cannot be allowed to drift: the rate, the closing date and the
// scope have to read the same everywhere, and they have to stay true after
// the campaign ends. Everything below is a guard on that record.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { campaign, endsOnLabel, offerLabel } from '@/content/brand/campaign';

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

  it('quotes a rate, never an amount', () => {
    if (!campaign) return;
    const text = [
      campaign.headline,
      campaign.detail,
      campaign.cta,
      campaign.whatsappMessage,
      ...campaign.terms,
    ].join(' ');
    expect(text).not.toMatch(/₹|Rs\.?|starting at|price[d]? from/i);
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

  it('is on the catalogue page, the cards, and the opening screen', () => {
    expect(read('app/(site)/products/page.tsx')).toMatch(/<OfferBand index="04" \/>/);
    expect(read('components/brand/ProductsGrid.tsx')).toMatch(/<OfferBadge \/>/);
    expect(read('components/brand/Hero.tsx')).toMatch(/<OfferBadge \/>/);
    expect(read('components/brand/ProductFeature.tsx')).toMatch(/<OfferRibbon \/>/);
  });

  it('disappears with the record', () => {
    const band = read('components/brand/OfferBand.tsx');
    // Three exports, three guards: switch the campaign off and each renders nil.
    expect(band.match(/if \(!campaign\) return null;/g)?.length).toBe(3);
  });

  it('gives every shelf an anchor the menu can point at', () => {
    const grid = read('components/brand/ProductsGrid.tsx');
    expect(grid).toMatch(/id=\{shelf\.group\.id\}/);
    expect(grid).toMatch(/href=\{`#\$\{shelf\.group\.id\}`\}/);
  });
});
