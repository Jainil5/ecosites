import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AUDIENCES,
  CAPABILITIES,
  DAY,
  HERO,
  SCOPE,
  TABS,
} from '@/components/sites/analytical-register/overview-data';
import type { ObView } from '@/components/sites/analytical-register/types';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
const DIR = 'components/sites/analytical-register';

/**
 * The introduction makes a scope claim on the product's behalf, so these checks
 * are the ones that keep the claim honest: every "live here" pointer has to
 * resolve to a screen that exists, the numbers on the page have to come from the
 * sample order book itself, and the half that is not in this build has to stay
 * named as the build rather than the demonstration.
 */

const tabIds = TABS.map((t) => t.id);

describe('the workspace tabs the introduction points at', () => {
  it('starts on the introduction and keeps every screen reachable', () => {
    expect(tabIds[0]).toBe('overview');
    expect(new Set(tabIds).size).toBe(tabIds.length);
    for (const id of ['register', 'orders', 'analytics', 'menu', 'settings'] satisfies ObView[]) {
      expect(tabIds).toContain(id);
    }
  });

  it('labels every tab the way the header renders it', () => {
    for (const tab of TABS) {
      expect(tab.label.trim().length).toBeGreaterThan(0);
      expect(tab.label).toBe(tab.label.trim());
    }
  });
});

describe('the product scope', () => {
  it('explains the pitch before it shows the till', () => {
    expect(HERO.eyebrow).toMatch(/café|restaurant/i);
    expect(HERO.headline.split('.').filter(Boolean).length).toBe(1);
    expect(HERO.body.length).toBeGreaterThan(120);
    // Saying it runs on sample data is not optional — this is the page a buyer clicks.
    expect(HERO.honesty).toMatch(/sample data/);
  });

  it('walks a trading day from open to close', () => {
    expect(DAY.length).toBe(7);
    expect(new Set(DAY.map((d) => d.clock)).size).toBe(DAY.length);
    expect(DAY[0].title).toMatch(/open/i);
    expect(DAY[DAY.length - 1].title).toMatch(/read/i);
    for (const step of DAY) {
      expect(step.detail.length).toBeGreaterThan(40);
      expect(step.title.trim().length).toBeGreaterThan(3);
    }
  });

  it('covers twelve groups, each with concrete items', () => {
    expect(CAPABILITIES.length).toBe(12);
    expect(new Set(CAPABILITIES.map((c) => c.name)).size).toBe(CAPABILITIES.length);
    for (const cap of CAPABILITIES) {
      expect(cap.items.length).toBeGreaterThanOrEqual(3);
      expect(cap.items.length).toBeLessThanOrEqual(4);
      expect(cap.line.length).toBeGreaterThan(20);
      for (const item of cap.items) expect(item.trim().length).toBeGreaterThan(10);
    }
  });

  it('names the jobs an order management system is actually bought for', () => {
    const all = CAPABILITIES.map((c) => `${c.name} ${c.line} ${c.items.join(' ')}`).join(' ');
    for (const topic of [
      /table/i,
      /kitchen|KOT/i,
      /loyalty|points/i,
      /inventory|stock/i,
      /recipe|costing/i,
      /staff|role/i,
      /shift|Z-report/i,
      /outlet|franchise/i,
      /offline/i,
      /UPI|payment/i,
      /aggregator|Swiggy|Zomato/i,
      /report|analytic/i,
    ]) {
      expect(all, String(topic)).toMatch(topic);
    }
  });

  it('sells to food businesses without quoting a price or a city', () => {
    const text = [
      HERO.eyebrow,
      HERO.headline,
      HERO.body,
      HERO.honesty,
      ...DAY.map((d) => `${d.title} ${d.detail}`),
      ...CAPABILITIES.map((c) => `${c.name} ${c.line} ${c.items.join(' ')}`),
      ...AUDIENCES.map((a) => `${a.name} ${a.detail}`),
      ...SCOPE.map((s) => `${s.heading} ${s.note} ${s.items.join(' ')}`),
    ].join(' ');
    expect(text).not.toMatch(/₹|Rs\.?|per month|monthly from|starting at|\d{4,5}/);
    expect(text.toLowerCase()).not.toContain('pune');
    // Twelve claims, one billing relationship: the buyer is not signing up here.
    expect(text).not.toMatch(/sign ?up page|subscribe|payment gateway integration fee/i);
  });

  it('fits the trades that walk in, not only the full-service restaurant', () => {
    const names = AUDIENCES.map((a) => a.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThanOrEqual(6);
    for (const wanted of ['café', 'restaurant', 'cloud kitchen', 'bakery']) {
      expect(names.join(' '), wanted).toContain(wanted);
    }
    // The registry sells this to a desk or studio too, so the page must say so.
    expect(names.join(' ')).toMatch(/salon|studio|shop/);
  });
});

describe('the live half of the claim', () => {
  it('only points "live here" at a screen that exists', () => {
    const demoTabs = tabIds.filter((id) => id !== 'overview');
    for (const cap of CAPABILITIES) {
      if (!cap.live) continue;
      expect(demoTabs, `${cap.name} -> ${cap.live}`).toContain(cap.live);
      // The introduction itself proves nothing, and settings is a rebrand panel.
      expect(cap.live).not.toBe('overview');
      expect(cap.live).not.toBe('settings');
    }
  });

  it('proves at least the counter, the book, the menu and the numbers', () => {
    const live = CAPABILITIES.filter((c) => c.live).map((c) => c.live);
    for (const tab of ['register', 'orders', 'analytics', 'menu'] satisfies ObView[]) {
      expect(live, String(tab)).toContain(tab);
    }
  });

  it('splits the page into what runs here and what is the build', () => {
    expect(SCOPE.length).toBe(2);
    expect(SCOPE[0].heading).toMatch(/running here|sample data/i);
    expect(SCOPE[1].heading).toMatch(/build/i);
    expect(SCOPE[0].items.length).toBeGreaterThanOrEqual(5);
    expect(SCOPE[1].items.length).toBeGreaterThanOrEqual(5);
  });

  it('never claims in the live half what the build half admits is missing', () => {
    const here = SCOPE[0].items.join(' ').toLowerCase();
    for (const absent of SCOPE[1].items) {
      const key = absent.toLowerCase();
      expect(here.includes(key), absent).toBe(false);
    }
    // The kitchen does not fire in this build, so the live column may not say it does.
    expect(here).not.toMatch(/kitchen|kot|print/);
  });
});

describe('the introduction shell', () => {
  const shell = read(`${DIR}/OrderBook.tsx`);
  const intro = read(`${DIR}/Overview.tsx`);

  it('opens the workspace on the introduction', () => {
    expect(shell).toMatch(/useState<ObView>\(['"]overview['"]\)/);
    expect(shell).toMatch(/import \{ Overview \} from '\.\/Overview'/);
    expect(shell).toMatch(/view === ['"]overview['"] && <Overview/);
  });

  it('navigates on the same tab list the introduction links into', () => {
    expect(shell).toMatch(/import \{ TABS \} from '\.\/overview-data'/);
    expect(shell).toMatch(/TABS\.map/);
    expect(shell).toMatch(/aria-pressed=\{view === n\.id\}/);
    // The product's name leads the introduction; the tenant's name owns the till.
    expect(shell).toMatch(/view === ['"]overview['"] \? 'OrderBook' : state\.brand\.name/);
  });

  it('lands a jump from the introduction at the top of the screen', () => {
    expect(shell).toMatch(/window\.scrollTo\(0, 0\)/);
    expect(shell).toMatch(/const open = \(next: ObView\)/);
    // Header buttons and in-body links go through the same handler.
    expect(shell).toMatch(/onClick=\{\(\) => open\(n\.id\)\}/);
    expect(shell).toMatch(/onOpen=\{open\}/);
  });

  it('quotes the sample order book instead of inventing marketing numbers', () => {
    expect(intro).toMatch(/computeKpis\(state\.orders\)/);
    expect(intro).toMatch(/formatMoney\(kpis\.revenue/);
    expect(intro).toMatch(/state\.menu\.filter\(\(m\) => m\.active\)/);
    // No hardcoded ₹ figure may sit in the presentational file.
    expect(intro).not.toMatch(/₹\s?[\d,]{3,}/);
  });

  it('heads up with a h1 and keeps one labelled heading per section', () => {
    expect(intro).toMatch(/<h1 id=\{?["']ob-intro-title["']/);
    const labelled = intro.match(/aria-labelledby="(ob-[a-z-]+)"/g) ?? [];
    const headings = intro.match(/id="(ob-[a-z-]+)"/g) ?? [];
    for (const id of labelled) {
      expect(headings, id).toContain(id.replace('aria-labelledby', 'id'));
    }
  });

  it('links the enquiry path only to routes this app builds', () => {
    const hrefs = [...intro.matchAll(/href="\/([a-z-]+)"/g)].map((m) => `/${m[1]}`);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe('/contact');
  });
});

describe('the introduction styles', () => {
  const css = read('app/globals.css');
  const block = () => {
    const start = css.indexOf('OrderBook (analytical-register)');
    const end = css.indexOf('Namesake (digital-portfolio)');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    return css.slice(start, end);
  };

  it('scopes every introduction class to the product', () => {
    for (const cls of [
      'ob-eyebrow',
      'ob-hero',
      'ob-rise',
      'ob-index',
      'ob-bullet',
      'ob-live',
      'ob-day-step',
      'ob-day-clock',
      'ob-mark',
      'ob-scope-live',
    ]) {
      expect(block(), cls).toContain(`.orderbook .${cls}`);
    }
  });

  it('rebrands with the till, because it is the same product', () => {
    // The pitch panel and the chips read --ob-accent, so Settings' colour picker
    // recolours the introduction along with the register.
    const b = block();
    expect(b).toMatch(/\.orderbook \.ob-hero \{[^}]*var\(--ob-accent\)/s);
    expect(b).toMatch(/\.orderbook \.ob-live \{[^}]*var\(--ob-accent\)/s);
    expect(b).toMatch(/\.orderbook \.ob-eyebrow \{[^}]*var\(--font-label\)/s);
  });

  it('gives the day rail its full width back on a phone', () => {
    const b = block();
    const at = b.indexOf('@media (max-width: 639px)');
    expect(at).toBeGreaterThan(-1);
    expect(b.slice(at)).toMatch(/\.orderbook \.ob-day-step \{[^}]*grid-template-columns: minmax\(0, 1fr\)/s);
  });

  it('settles the entrance when motion is reduced', () => {
    const reduce = block().slice(block().lastIndexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduce).toMatch(/\.orderbook \.ob-tile \{ transition: none; \}/);
    expect(reduce).toMatch(/\.orderbook \.ob-rise \{ animation: none; \}/);
  });
});
