// test/ruhani.test.ts
//
// The contract for the jewellery bench: the registry entry the gallery shows,
// the maker who cannot be contacted by mistake, the pieces and their inclusive
// prices, the basket maths, and the two sheets that turn a shape on paper into
// a ticket on WhatsApp.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { websites } from '@/content/websites/sites';
import {
  FREE_SHIPPING_OVER,
  GST_RATE,
  SHIPPING_FLAT,
  categories,
  faqs,
  gifting,
  gstInclusive,
  maker,
  metals,
  pieces,
  quotes,
  type Form,
} from '@/components/sites/ruhani/data';
import {
  CART_KEY,
  MAX_QTY,
  cartCount,
  cartReducer,
  defaultChosen,
  inr,
  leadRange,
  lineKey,
  loadCart,
  orderText,
  pieceBySlug,
  pieceText,
  saveCart,
  totals,
  whatsappOrder,
  type CartState,
} from '@/components/sites/ruhani/cart';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
const ROOT = 'components/sites/ruhani';
const bySlug = (slug: string) => {
  const found = pieceBySlug(slug);
  if (!found) throw new Error(`no piece ${slug}`);
  return found;
};

/** The two lines most of the maths is checked against. */
const first = pieces[0];
const firstKey = lineKey(first.slug, defaultChosen(first));
const twoOfTheFirst: CartState = {
  [firstKey]: { key: firstKey, slug: first.slug, chosen: defaultChosen(first), qty: 2 },
};

describe('ruhani registry entry', () => {
  const site = websites.find((w) => w.slug === 'ruhani');

  it('is registered at /ruhani with a paper-and-metal accent', () => {
    expect(site, 'missing entry in content/websites/sites.ts').toBeDefined();
    expect(site?.path).toBe('/ruhani');
    expect(site?.screenshot).toBe('/showcase/ruhani/preview.png');
    expect(site?.accent).toBe('#C9A96E');
    expect(site?.theme).toBe('Warm paper and hairlines');
    expect(site?.techStack.length).toBeGreaterThan(1);
  });

  it('counts the shelf in prose the way the registry counts it in data', () => {
    const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
    expect(site?.description, 'the piece count in the gallery copy has to match the bench').toContain(
      `${WORDS[pieces.length]} pieces`,
    );
  });

  it('reads as delivered work, and names no city or street', () => {
    const text = `${site?.title} ${site?.business} ${site?.description} ${site?.theme}`.toLowerCase();
    expect(text).not.toMatch(/\bdemos?\b|\bsamples?\b|studio build|mock\w*\b/);
    expect(text).not.toMatch(/\b(pune|mumbai|delhi|bengaluru|gurgaon|jaipur|hyderabad)\b/);
    expect(text).not.toMatch(/\b(road|street|lane|nagar|circle)\b.*\d{5,}/i);
  });

  it('is not another café, salon or kitchen', () => {
    expect(site?.business).toMatch(/jewellery/i);
    expect(site?.business).toMatch(/order/i);
    expect(site?.slug).not.toBe('ember-larder');
    expect(site?.slug).not.toBe('brewery-cafe');
    expect(site?.slug).not.toBe('hair-adore');
  });
});

describe('the maker behind the bench', () => {
  it('has a name, a line worth putting in the hero, and a story behind it', () => {
    expect(maker.name).toBe('Ruhani');
    expect(maker.kicker.length).toBeGreaterThan(12);
    expect(maker.line.length).toBeGreaterThan(30);
    expect(maker.intro.length).toBeGreaterThan(120);
    expect(maker.story.length).toBeGreaterThan(220);
  });

  // A studio build: nothing on the page may reach a real business.
  it('holds no reachable contact details', () => {
    expect(maker.email).toMatch(/@ruhani\.example$/);
    expect(maker.instagram).toBe('#');
    expect(maker.whatsapp).toBe('919876543210');
    expect(maker.whatsapp).toMatch(/^91\d{10}$/);
    expect(maker.studio).not.toMatch(/\b\d{5,6}\b/);
  });

  it('says what the stamp on the metal means', () => {
    expect(maker.hallmarkNote).toMatch(/585/);
    expect(maker.hallmarkNote).toMatch(/925/);
  });
});

describe('the piece registry', () => {
  it('sells one shelf of pieces, spread over every category and metal', () => {
    expect(pieces.length).toBeGreaterThanOrEqual(10);
    expect(new Set(pieces.map((p) => p.slug)).size).toBe(pieces.length);
    for (const c of categories) {
      expect(pieces.some((p) => p.category === c.id), c.id).toBe(true);
    }
    for (const m of metals) {
      expect(pieces.some((p) => p.metal === m.id), m.id).toBe(true);
    }
  });

  it('gives every piece the numbers a buyer needs before ordering', () => {
    for (const p of pieces) {
      expect(p.slug, p.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(p.name).toMatch(/[A-Z]/);
      expect(p.type.length, `${p.name} type`).toBeGreaterThan(8);
      expect(p.note.length, `${p.name} note`).toBeGreaterThan(30);
      expect(p.care.length, `${p.name} care`).toBeGreaterThan(24);
      expect(p.price, p.name).toBeGreaterThan(0);
      expect(Number.isInteger(p.price), p.name).toBe(true);
      expect(p.lead[0], p.name).toBeLessThan(p.lead[1]);
      expect(p.measure.options.length, `${p.name} options`).toBeGreaterThanOrEqual(2);
      expect(new Set(p.measure.options).size, p.name).toBe(p.measure.options.length);
      expect(p.stamp, p.name).toMatch(/^(925|585)$/);
    }
  });

  it('stamps solid gold at 585 and nothing else', () => {
    for (const p of pieces) {
      if (p.metal === 'gold') expect(p.stamp, p.name).toBe('585');
      else expect(p.stamp, p.name).toBe('925');
    }
  });

  it('draws every form the data is allowed to name', () => {
    const data = read(`${ROOT}/data.ts`);
    const union = data.slice(data.indexOf('export type Form'), data.indexOf('export interface Piece'));
    const named = [...union.matchAll(/'([a-z]+)'/g)].map((m) => m[1]) as Form[];
    expect(named.length).toBeGreaterThanOrEqual(8);
    const drawing = read(`${ROOT}/Piece.tsx`);
    const drawn = [...drawing.matchAll(/case '([a-z]+)':/g)].map((m) => m[1]);
    for (const f of named) expect(drawn, f).toContain(f);
    for (const p of pieces) expect(named, `${p.name} form`).toContain(p.form);
  });
});

describe('the price maths a ticket is judged on', () => {
  it('prices in rupees, with the tax inside and never more than the price', () => {
    expect(inr(1800)).toBe('₹1,800');
    expect(inr(18000)).toBe('₹18,000');
    for (const p of pieces) {
      const tax = gstInclusive(p.price);
      expect(tax, p.name).toBeGreaterThan(0);
      expect(tax, p.name).toBeLessThan(p.price);
      expect(tax, p.name).toBeCloseTo(p.price - p.price / 1.03, 0);
    }
  });

  it('states the counter rate jewellery is sold at in India', () => {
    expect(GST_RATE).toBe(3);
    expect(FREE_SHIPPING_OVER).toBeGreaterThan(0);
    expect(SHIPPING_FLAT).toBeGreaterThan(0);
    expect(SHIPPING_FLAT).toBeLessThan(FREE_SHIPPING_OVER);
  });

  it('gives a lead range that reads like a bench, not a warehouse', () => {
    expect(leadRange(bySlug('chandni-studs'))).toBe('5–7 working days');
    expect(leadRange(bySlug('heer-ring'))).toBe('10–14 working days');
  });
});

describe('the box', () => {
  it('keys a line by the piece and the size, because they are not one object', () => {
    expect(lineKey('a', '16mm')).toBe('a::16mm');
    expect(lineKey('a', '20mm')).not.toBe(lineKey('a', '16mm'));
    expect(defaultChosen(first)).toBe(first.measure.options[0]);
  });

  it('adds, edits down to nothing, and refuses to make a fifth of anything', () => {
    const two = cartReducer(
      {},
      { type: 'add', line: { key: firstKey, slug: first.slug, chosen: first.measure.options[0], qty: 1 } },
    );
    expect(cartCount(two)).toBe(1);
    const clamped = cartReducer(two, {
      type: 'add',
      line: { key: firstKey, slug: first.slug, chosen: first.measure.options[0], qty: 99 },
    });
    expect(clamped[firstKey].qty).toBe(MAX_QTY);
    const dropped = cartReducer(clamped, { type: 'setQty', key: firstKey, qty: 0 });
    expect(dropped).toEqual({});
    expect(cartCount(dropped)).toBe(0);
  });

  it('keeps the tax inside the subtotal and shows it as its own line', () => {
    const { subtotal, gst, total, shipping } = totals(twoOfTheFirst);
    expect(subtotal).toBe(first.price * 2);
    expect(gst).toBe(gstInclusive(first.price * 2));
    expect(total).toBe(subtotal + shipping);
    expect(gst).toBeLessThan(subtotal);
  });

  it('turns the courier free only above the line, and says how far it is', () => {
    const cheap = totals(twoOfTheFirst);
    const dear = totals(
      Object.fromEntries(
        pieces.slice(0, 6).map((p) => {
          const k = lineKey(p.slug, defaultChosen(p));
          return [k, { key: k, slug: p.slug, chosen: defaultChosen(p), qty: MAX_QTY }];
        }),
      ),
    );
    if (cheap.subtotal < FREE_SHIPPING_OVER) {
      expect(cheap.free).toBe(false);
      expect(cheap.shipping).toBe(SHIPPING_FLAT);
      expect(cheap.toFree).toBe(FREE_SHIPPING_OVER - cheap.subtotal);
    }
    expect(dear.subtotal).toBeGreaterThan(FREE_SHIPPING_OVER);
    expect(dear.free).toBe(true);
    expect(dear.shipping).toBe(0);
    expect(dear.toFree).toBe(0);
  });

  it('charges nothing for an empty box', () => {
    const empty = totals({});
    expect(empty.subtotal).toBe(0);
    expect(empty.gst).toBe(0);
    expect(empty.shipping).toBe(0);
    expect(empty.total).toBe(0);
  });

  it('survives a reload, and forgets anything the bench stopped selling', () => {
    const store = (() => {
      let raw: string | null = null;
      return {
        getItem: (_key: string) => raw,
        setItem: (_key: string, v: string) => {
          raw = v;
        },
        removeItem: (_key: string) => {
          raw = null;
        },
      };
    })();
    saveCart(store, twoOfTheFirst);
    expect(loadCart(store)).toEqual(twoOfTheFirst);

    store.setItem(CART_KEY, JSON.stringify({ 'gone::x': { slug: 'gone', chosen: 'x', qty: 2 } }));
    expect(loadCart(store)).toEqual({});
    store.setItem(CART_KEY, '{not json');
    expect(loadCart(store)).toEqual({});
    // A line saved without a size falls back to the default, and a quantity
    // over what one bench can make in a week comes back clamped.
    const k = lineKey(first.slug, first.measure.options[0]);
    store.setItem(CART_KEY, JSON.stringify({ [k]: { slug: first.slug, qty: 3 } }));
    expect(loadCart(store)[k]).toEqual({ key: k, slug: first.slug, chosen: first.measure.options[0], qty: 3 });
    store.setItem(CART_KEY, JSON.stringify({ [k]: { slug: first.slug, chosen: first.measure.options[0], qty: 40 } }));
    expect(loadCart(store)[k].qty).toBe(MAX_QTY);
    saveCart(store, {});
    expect(store.getItem(CART_KEY)).toBeNull();
  });
});

describe('the message that leaves the page', () => {
  it('carries the whole ticket, the tax and the courier rule', () => {
    const k = lineKey(bySlug('heer-ring').slug, defaultChosen(bySlug('heer-ring')));
    const cart: CartState = {
      [k]: { key: k, slug: 'heer-ring', chosen: defaultChosen(bySlug('heer-ring')), qty: 1 },
      ...twoOfTheFirst,
    };
    const text = orderText(cart);
    expect(text).toContain(`Hi ${maker.name}!`);
    expect(text).toContain('Heer Ring');
    expect(text).toContain(first.name);
    expect(text).toContain(`${GST_RATE}% GST of`);
    expect(text).toContain('Courier: free');
    expect(text).toMatch(/Total: ₹[\d,]+/);
    expect(text.split('\n').length).toBeGreaterThan(4);
  });

  it('asks about one piece with its size already filled in', () => {
    const p = bySlug('kiran-bangle');
    const text = pieceText(p, '62mm');
    expect(text).toContain('Kiran Bangle');
    expect(text).toContain('62mm');
    expect(text).toContain(leadRange(p));
    expect(text).toMatch(/ends with a question|[?]$/s);
  });

  it('opens WhatsApp on the bench number, encoded', () => {
    const href = whatsappOrder(maker.whatsapp, 'Hi Ruhani! I would like the Chandni Studs');
    expect(href.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(href).toContain('I%20would%20like');
  });
});

describe('the Ruhani shell', () => {
  const shell = read(`${ROOT}/Ruhani.tsx`);
  const drawers = read(`${ROOT}/Drawers.tsx`);

  it('is a client shell with a route page of its own', () => {
    expect(shell.startsWith("'use client';")).toBe(true);
    const page = read('app/(sites)/ruhani/page.tsx');
    expect(page).toContain('<Ruhani />');
    expect(page).toMatch(/export const metadata/);
    expect(page).toMatch(/pieces\.length/);
  });

  it('shows the shelf, the bench, the box, the packing and the questions', () => {
    for (const id of ['#shop', '#maker', '#how', '#gifting', '#voices']) {
      expect(shell, id).toContain(id);
    }
    expect(shell).toContain('<Collection');
    expect(shell).toContain('<Story');
    expect(shell).toContain('<Gifting');
    expect(shell).toContain('<Voices');
  });

  it('keeps the basket on the page and the count in the header', () => {
    expect(shell).toContain('loadCart(window.localStorage)');
    expect(shell).toContain('saveCart(window.localStorage, cart)');
    expect(shell).toContain('cartCount(cart)');
    expect(drawers).toContain('aria-modal="true"');
    expect(drawers).toContain("'Escape'");
  });

  it('routes every enquiry through the bench, not through a fake checkout', () => {
    expect(drawers).toContain('whatsappOrder(maker.whatsapp, orderText(cart))');
    expect(drawers).toContain('whatsappOrder(maker.whatsapp, pieceText(piece, chosen, qty))');
    expect(drawers).toContain('mailto:${maker.email}');
    expect(drawers).toMatch(/target="_blank"\s+rel="noopener noreferrer"/);
    expect(shell + drawers).toMatch(/nothing is charged here|no payment/i);
  });

  it('states plainly that the house, the number and the drawings are ours', () => {
    expect(shell).toContain('Our own house, built for this product');
    expect(shell).toContain('reserved one');
  });

  it('carries no hedge words in the copy a buyer reads', () => {
    const hedge = /\bdemos?\b|\bdemonstration\w*\b|\bsamples?\b|studio build|mock\w*\b/i;
    for (const rel of [`${ROOT}/Ruhani.tsx`, `${ROOT}/Collection.tsx`, `${ROOT}/Drawers.tsx`, `${ROOT}/Story.tsx`, `${ROOT}/Gifting.tsx`, `${ROOT}/Voices.tsx`]) {
      read(rel)
        .split('\n')
        .forEach((line, i) => {
          const t = line.trim();
          if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
          if (/href=|from '|import |path:|slug:|\bkey=/.test(t)) return;
          expect(`${rel}:${i + 1}  ${t}`, t).not.toMatch(hedge);
        });
    }
  });
});

describe('ruhani theme tokens', () => {
  const css = read('app/globals.css');
  const section = css.slice(css.indexOf('Ruhani (ruhani) —'));

  it('is scoped to .ruhani so no other site picks up the paper', () => {
    expect(section.length).toBeGreaterThan(4000);
    expect(section).toMatch(/^\.ruhani \{/m);
    const loose = section
      .split('\n')
      .filter((l) => /^\s*\.[a-z]/.test(l) && !l.includes('.ruhani') && !l.startsWith('@'));
    expect(loose).toEqual([]);
  });

  it('carries the palette the brief asked for', () => {
    for (const token of ['--rj-bg', '--rj-ink', '--rj-ink-2', '--rj-hair', '--rj-gold', '--rj-stone', '--rj-surface-2']) {
      expect(section, token).toContain(`${token}:`);
    }
    expect(section).toMatch(/--rj-bg:\s*#fafaf8/);
    expect(section).toMatch(/--rj-gold:\s*#c9a96e/);
  });

  it('sets the display type in the Garamond it loads, not in the poster grotesque', () => {
    expect(section).toMatch(/\.ruhani \.rj-display \{[^}]*var\(--font-rj-display\)/s);
    const layout = read('app/layout.tsx');
    const at = layout.indexOf("variable: '--font-rj-display'");
    expect(at, 'the Garamond is not declared in app/layout.tsx').toBeGreaterThan(-1);
    expect(layout.slice(layout.lastIndexOf('localFont({', at), at)).toContain('cormorant-garamond-latin.woff2');
  });

  it('stops the lift and the bar animation when motion is asked for', () => {
    const reduce = section.slice(section.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduce).toMatch(/\.ruhani \.rj-bar \{\s*animation: none/);
    expect(reduce).toMatch(/transition-duration: 1ms/);
  });

  it('collapses the shelf to one column on a phone', () => {
    expect(section).toMatch(/@media \(max-width: 600px\) \{[^}]*\.ruhani \.rj-grid \{[^}]*grid-template-columns: 1fr/s);
  });
});

describe('the gifting and question copy', () => {
  it('has a box worth keeping and four things about it', () => {
    expect(gifting.title.length).toBeGreaterThan(18);
    expect(gifting.points.length).toBe(4);
    expect(gifting.points.join(' ')).toMatch(/handwritten|hand/i);
  });

  it('answers the five questions a buyer asks before ordering', () => {
    expect(faqs.length).toBe(5);
    for (const f of faqs) {
      expect(f.q.endsWith('?'), f.q).toBe(true);
      expect(f.a.length, f.q).toBeGreaterThan(90);
    }
    const all = faqs.map((f) => f.a).join(' ');
    expect(all).toMatch(/resized/i);
    expect(all).toMatch(/hallmark|585/);
  });

  it('quotes three buyers who name the piece they bought', () => {
    expect(quotes.length).toBe(3);
    for (const q of quotes) {
      expect(pieces.some((p) => p.name === q.bought), q.bought).toBe(true);
      expect(q.text.length).toBeGreaterThan(60);
      expect(q.who).toMatch(/^[A-Z][a-z]+ [A-Z]\.$/);
    }
  });
});

describe('the gallery screenshot', () => {
  it('exists, and is a real image rather than a placeholder', () => {
    const file = path.join(process.cwd(), 'public/showcase/ruhani/preview.png');
    expect(existsSync(file), 'capture the shelf at /ruhani into public/showcase').toBe(true);
    expect(readFileSync(file).byteLength).toBeGreaterThan(5000);
  });
});
