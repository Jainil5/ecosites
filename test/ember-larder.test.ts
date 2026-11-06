import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { websites } from '@/content/websites/sites';
import {
  groups,
  isRecommended,
  larder,
  products,
  reviews,
  setMenu,
  spiceChoice,
  ticker,
  type Product,
} from '@/components/sites/ember-larder/data';
import {
  CART_KEY,
  GST_RATE,
  MAX_QTY,
  cartCount,
  cartReducer,
  chosenLabel,
  defaultChosen,
  inr,
  lineKey,
  loadCart,
  orderNumber,
  productById,
  saveCart,
  subtotal,
  totals,
  unitPrice,
  type CartState,
} from '@/components/sites/ember-larder/cart';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
const ROOT = 'components/sites/ember-larder';
const byId = (id: string): Product => {
  const found = productById(id);
  if (!found) throw new Error(`no product ${id}`);
  return found;
};

describe('ember larder store registry entry', () => {
  const site = websites.find((w) => w.slug === 'ember-larder');

  it('is registered at /ember-larder with a gallery-ready accent', () => {
    expect(site, 'missing entry in content/websites/sites.ts').toBeDefined();
    expect(site?.path).toBe('/ember-larder');
    expect(site?.screenshot).toBe('/showcase/ember-larder/preview.png');
    expect(site?.accent).toBe('#FF6A3D');
    expect(site?.theme).toBe('Charcoal and ember');
    expect(site?.techStack.length).toBeGreaterThan(1);
  });

  it('reads as delivered work, not a demo, and names no city', () => {
    const text = `${site?.title} ${site?.business} ${site?.description} ${site?.theme}`.toLowerCase();
    expect(text).not.toContain('demo');
    expect(text).not.toMatch(/\b(pune|mumbai|delhi|bengaluru|gurgaon)\b/);
  });

  it('is not another café, dish guide or point of sale', () => {
    // Four food-adjacent sites already exist; this one has to be the shop
    // that cooks and sells jars, which none of the others do.
    expect(site?.business).toMatch(/restaurant/i);
    expect(site?.business).toMatch(/pantry/i);
    expect(site?.slug).not.toBe('brewery-cafe');
    expect(site?.slug).not.toBe('savour');
    expect(site?.slug).not.toMatch(/^orderbook-/);
  });
});

describe('ember larder identity', () => {
  it('is a live-fire kitchen with a tagline worth putting in the hero', () => {
    expect(larder.name).toBe('Ember Larder');
    expect(larder.tagline.length).toBeGreaterThan(20);
    expect(larder.intro.length).toBeGreaterThan(80);
    expect(larder.story.length).toBeGreaterThan(160);
  });

  // A studio build: nothing on the page may route a visitor to a real business.
  it('holds no real contact details', () => {
    expect(larder.email).toMatch(/@emberlarder\.example$/);
    expect(larder.address).not.toMatch(/\b(road|street|ave)\b.*\d{5,}/i);
    expect(larder.address).not.toMatch(/\b(pune|mumbai|delhi|bengaluru)\b/i);
    for (const social of larder.socials) {
      expect(social.href, social.label).toBe('#');
    }
  });

  it('keeps the phone a sample mobile number, dial-shaped but nobody\'s', () => {
    expect(larder.phone).toMatch(/^91\d{10}$/);
    expect(larder.phone).toBe('919876543210');
  });

  it('says which days the room is dark', () => {
    expect(larder.hours.length).toBeGreaterThanOrEqual(3);
    const cold = larder.hours.at(-1);
    expect(cold?.days).toBe('Monday');
    expect(cold?.time).not.toMatch(/\d{2}:\d{2}/);
    for (const slot of larder.hours.slice(0, -1)) {
      expect(slot.time, slot.days).toMatch(/\d{2}:\d{2}/);
    }
  });

  it('gives the hero four numbers to count up to', () => {
    expect(larder.stats).toHaveLength(4);
    for (const stat of larder.stats) {
      expect(Number.isInteger(stat.value), stat.label).toBe(true);
      expect(stat.label.trim().length).toBeGreaterThan(6);
    }
    expect(larder.stats.some((s) => s.value === 0), 'a zero is a talking point').toBe(true);
  });
});

describe('ember larder product registry', () => {
  it('sells five plates and three jars', () => {
    expect(products).toHaveLength(8);
    expect(groups.map((g) => g.id)).toEqual(['all', 'fire', 'pantry']);
    expect(products.filter((p) => p.group === 'fire')).toHaveLength(5);
    expect(products.filter((p) => p.group === 'pantry')).toHaveLength(3);
  });

  it('names every line in the order the card prints them', () => {
    expect(products.map((p) => p.id)).toEqual([
      'smoked-lamb-ribs',
      'charred-kadai-paneer',
      'saffron-handi-biryani',
      'blistered-corn',
      'charred-garlic-naan',
      'smoked-chilli-oil',
      'ember-garam-masala',
      'the-cellar-hamper',
    ]);
  });

  it('gives each product a unique id and a photo path derived from it', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of products) {
      expect(p.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(p.name, p.id).not.toMatch(/^[a-z]/);
      expect(p.image, p.id).toBe(`/ember-larder/products/${p.id}.jpg`);
      expect(p.w).toBe(p.h);
    }
  });

  it('prices every line in round rupees', () => {
    for (const p of products) {
      expect(p.price, p.name).toBeGreaterThan(0);
      expect(p.price % 10, p.name).toBe(0);
    }
  });

  it('keeps each note to one scannable line', () => {
    for (const p of products) {
      expect(p.note.length, p.name).toBeGreaterThan(20);
      expect(p.note.length, p.name).toBeLessThanOrEqual(90);
      expect(p.note, p.name).not.toMatch(/\n/);
      expect(p.tags.length, p.name).toBeGreaterThan(0);
      expect(p.details.ingredients.length, p.name).toBeGreaterThanOrEqual(2);
      expect(p.details.metric.length, p.name).toBeGreaterThan(4);
    }
  });

  it('stars exactly the three lines worth arriving early for', () => {
    expect(products.filter(isRecommended).map((p) => p.name)).toEqual([
      'Smoked Lamb Ribs',
      'Charred Kadai Paneer',
      'Ember Garam Masala',
    ]);
  });

  it('only offers choices whose options are unique and priced', () => {
    for (const p of products) {
      for (const c of p.choices ?? []) {
        expect(c.label.trim().length, `${p.name}/${c.id}`).toBeGreaterThan(2);
        const optionIds = c.options.map((o) => o.id);
        expect(new Set(optionIds).size, `${p.name}/${c.id}`).toBe(optionIds.length);
        expect(c.options.length, `${p.name}/${c.id}`).toBeGreaterThanOrEqual(2);
        // One option must sit at the printed base price, or the card lies.
        expect(
          c.options.some((o) => o.delta === 0),
          `${p.name}/${c.id} has no zero-delta default`,
        ).toBe(true);
        for (const o of c.options) {
          expect(Math.abs(o.delta), `${p.name}/${c.id}/${o.id}`).toBeLessThan(p.price);
        }
      }
    }
  });

  it('shares one heat ladder across the spicy plates', () => {
    const users = products.filter((p) => p.choices?.some((c) => c.id === 'heat'));
    expect(users.map((p) => p.id)).toEqual(['smoked-lamb-ribs', 'charred-kadai-paneer']);
    for (const p of users) {
      expect(p.choices?.find((c) => c.id === 'heat')).toBe(spiceChoice);
    }
    expect(spiceChoice.options.map((o) => o.label)).toEqual(['Medium', 'Hot', 'Fiery']);
    expect(spiceChoice.options.every((o) => o.delta === 0)).toBe(true);
  });

  it('keeps the hamper add-one-tap, so it needs no dialog', () => {
    const hamper = byId('the-cellar-hamper');
    expect(hamper.choices).toBeUndefined();
    expect(hamper.price).toBe(1850);
    expect(hamper.details.ingredients).toHaveLength(3);
    expect(products.filter((p) => !p.choices?.length)).toHaveLength(1);
  });
});

describe('ember larder basket maths', () => {
  const ribs = byId('smoked-lamb-ribs');
  const naan = byId('charred-garlic-naan');
  const biryani = byId('saffron-handi-biryani');

  it('keys a line by product and variant trail, sorted so order cannot matter', () => {
    expect(lineKey(ribs.id, { cut: 'full', heat: 'hot' })).toBe('smoked-lamb-ribs:cut=full:heat=hot');
    expect(lineKey(ribs.id, { heat: 'hot', cut: 'full' })).toBe(lineKey(ribs.id, { cut: 'full', heat: 'hot' }));
    expect(lineKey('the-cellar-hamper', {})).toBe('the-cellar-hamper');
  });

  it('defaults to the option printed on the card', () => {
    expect(defaultChosen(ribs)).toEqual({ cut: 'full', heat: 'medium' });
    expect(unitPrice(ribs, defaultChosen(ribs))).toBe(690);
    expect(unitPrice(ribs, { cut: 'half', heat: 'hot' })).toBe(440);
    expect(unitPrice(biryani, { pot: 'lamb' })).toBe(680);
    expect(unitPrice(biryani, { pot: 'veg' })).toBe(520);
  });

  it('describes a variant trail for the ticket', () => {
    expect(chosenLabel(ribs, { cut: 'half', heat: 'fiery' })).toBe('Half rack · Fiery');
    expect(chosenLabel(byId('the-cellar-hamper'), {})).toBe('');
  });

  it('keeps two variants of the same plate on separate lines', () => {
    let cart: CartState = {};
    const add = (p: Product, chosen: Record<string, string>, qty = 1) => {
      const key = lineKey(p.id, chosen);
      cart = cartReducer(cart, { type: 'add', qty, line: { key, id: p.id, chosen, qty } });
    };
    add(ribs, { cut: 'half', heat: 'hot' });
    add(ribs, { cut: 'full', heat: 'medium' });
    add(ribs, { cut: 'half', heat: 'hot' }, 2);
    expect(Object.keys(cart)).toHaveLength(2);
    expect(cartCount(cart)).toBe(4);
    expect(subtotal(cart)).toBe(440 * 3 + 690);
  });

  it('adds 5% GST and prints a rupee total, never a float', () => {
    const key = lineKey(naan.id, { bread: 'garlic' });
    const cart = cartReducer({}, { type: 'add', qty: 2, line: { key, id: naan.id, chosen: { bread: 'garlic' }, qty: 2 } });
    expect(subtotal(cart)).toBe(400);
    const t = totals(cart);
    expect(t.gst).toBe(Math.round(400 * GST_RATE));
    expect(t.total).toBe(420);
    expect(inr(t.total)).toBe('₹420');
    expect(totals({}).total).toBe(0);
  });

  it('rounds GST once on the subtotal so the printed rows always add up', () => {
    for (const p of products) {
      const chosen = defaultChosen(p);
      for (const qty of [1, 3, 7]) {
        const key = lineKey(p.id, chosen);
        const cart: CartState = { [key]: { key, id: p.id, chosen, qty } };
        const { subtotal: s, gst, total } = totals(cart);
        expect(total).toBe(s + gst);
        expect(Number.isInteger(gst)).toBe(true);
      }
    }
  });

  it('clamps a runaway quantity and drops a line at zero', () => {
    const key = lineKey(naan.id, defaultChosen(naan));
    const line = { key, id: naan.id, chosen: defaultChosen(naan), qty: 1 };
    let cart = cartReducer({}, { type: 'add', qty: MAX_QTY + 40, line });
    expect(cart[key]?.qty).toBe(MAX_QTY);
    cart = cartReducer(cart, { type: 'setQty', key, qty: 0 });
    expect(cart).toEqual({});
    expect(cartReducer(cart, { type: 'setQty', key, qty: 3 })).toEqual(cart);
    // setQty walks from the held quantity, so stepping down one is enough.
    cart = cartReducer({}, { type: 'add', qty: 3, line });
    cart = cartReducer(cart, { type: 'setQty', key, qty: 2 });
    expect(cart[key]?.qty).toBe(2);
  });

  it('survives a round trip through session storage and rejects a tampered key', () => {
    const chosen = { pot: 'lamb' };
    const key = lineKey(biryani.id, chosen);
    const cart: CartState = { [key]: { key, id: biryani.id, chosen, qty: 2 } };
    const jar = new Map<string, string>();
    const store = {
      getItem: (k: string) => jar.get(k) ?? null,
      setItem: (k: string, v: string) => void jar.set(k, v),
      removeItem: (k: string) => void jar.delete(k),
    };
    saveCart(store, cart);
    expect(jar.get(CART_KEY)).toBeTruthy();
    expect(loadCart(store)).toEqual(cart);

    jar.set(CART_KEY, JSON.stringify({ 'ghost:pot=lamb': { key: 'ghost:pot=lamb', id: 'ghost', chosen, qty: 2 } }));
    expect(loadCart(store)).toEqual({});

    jar.set(CART_KEY, JSON.stringify({ [key]: { key, id: biryani.id, chosen, qty: 999 } }));
    expect(loadCart(store)[key]?.qty).toBe(MAX_QTY);

    jar.set(CART_KEY, 'not json at all');
    expect(loadCart(store)).toEqual({});
    expect(loadCart(null)).toEqual({});
  });

  it('prints a counter ticket the kitchen can call', () => {
    expect(orderNumber(() => 0)).toBe('EL-1000');
    expect(orderNumber(() => 0.5)).toBe('EL-5500');
    expect(orderNumber(() => 0.999)).toBe('EL-9991');
    expect(orderNumber()).toMatch(/^EL-\d{4}$/);
  });
});

describe('ember larder one scroll', () => {
  const landing = read(`${ROOT}/EmberLarder.tsx`);

  it('runs the shop first, then the room, the set dinner, the voices, the booking and the door', () => {
    const order = ['<Hero', '<Products', '<Story', '<SetMenu', '<Reviews', '<Reserve', '<Visit'];
    let prev = -1;
    for (const tag of order) {
      const at = landing.search(new RegExp(tag));
      expect(at, `${tag} is out of order`).toBeGreaterThan(prev);
      prev = at;
    }
  });

  it('points every nav link at a band that exists on the page', () => {
    const nav = read(`${ROOT}/Nav.tsx`);
    const hosts: Record<string, string> = {
      '#products': `${ROOT}/Products.tsx`,
      '#hearth': `${ROOT}/Story.tsx`,
      '#set-dinner': `${ROOT}/SetMenu.tsx`,
      '#voices': `${ROOT}/Reviews.tsx`,
      '#reserve': `${ROOT}/Reserve.tsx`,
      '#visit': `${ROOT}/Visit.tsx`,
    };
    for (const [href, file] of Object.entries(hosts)) {
      // The CTA carries #reserve as a bare href, the rest are nav entries.
      expect(nav, href).toContain(href);
      const src = read(file);
      expect(src, `${file} has no ${href}`).toContain(`id="${href.slice(1)}"`);
      // The header is sticky, so an anchor jump lands under it unless the band
      // itself reserves the space.
      expect(src, `${href} is not an .el-band`).toMatch(
        new RegExp(`id="${href.slice(1)}" className="el-band`),
      );
    }
    expect(read('app/globals.css')).toMatch(
      /\.ember-larder \.el-band\s*\{[^}]*scroll-margin-top/,
    );
  });

  it('owns the only h1 and keeps the bands on h2 and h3', () => {
    expect(read(`${ROOT}/Hero.tsx`)).toMatch(/<h1/);
    for (const file of ['Products', 'Story', 'SetMenu', 'Reviews', 'Reserve', 'Visit']) {
      const src = read(`${ROOT}/${file}.tsx`);
      expect(src, file).not.toMatch(/<h1/);
      expect(src, file).toMatch(/<h2/);
    }
  });

  it('is a standalone client site with its own theme, not a brand page', () => {
    expect(existsSync(path.join(process.cwd(), 'app/(sites)/ember-larder/page.tsx'))).toBe(true);
    const page = read('app/(sites)/ember-larder/page.tsx');
    expect(page).toMatch(/export const metadata/);
    expect(page).toMatch(/title: 'Ember Larder/);
    expect(landing).toMatch(/className="ember-larder/);
    expect(landing).not.toMatch(/BrandNav|SiteChrome|components\/brand\//);
  });
});

describe('ember larder motion', () => {
  const landing = read(`${ROOT}/EmberLarder.tsx`);

  it('gates every animation behind one reduced-motion switch at the root', () => {
    expect(landing).toMatch(/<MotionConfig reducedMotion="user">/);
    expect(landing).toMatch(/from 'framer-motion'/);
  });

  it('lifts the headline out of a mask, one line at a time', () => {
    const hero = read(`${ROOT}/Hero.tsx`);
    expect(hero).toMatch(/className="el-mask"/);
    expect(hero).toMatch(/el-mask-inner/);
    expect(hero).toMatch(/initial=\{\{ y: '108%' \}\}/);
    expect(hero).toMatch(/animate=\{\{ y: '0%' \}\}/);
    // The aria-label carries the sentence the masked lines are hiding.
    expect(hero).toMatch(/aria-label=\{larder\.tagline\}/);
    expect(hero).toMatch(/aria-hidden/);
  });

  it('parallaxes the photograph against the copy and the ticker', () => {
    const hero = read(`${ROOT}/Hero.tsx`);
    expect(hero).toMatch(/useScroll\(\{/);
    expect(hero).toMatch(/offset: \['start start', 'end start'\]/);
    expect(hero).toMatch(/useTransform\(scrollYProgress/);
    expect(hero).toMatch(/style=\{\{ y: imageY \}\}/);
    expect(hero).toMatch(/style=\{\{ y: copyY, opacity: copyFade \}\}/);
    expect(hero).toMatch(/<Image[\s\S]*?priority[\s\S]*?\/>/);
    expect(hero).toMatch(/el-ticker/);
    expect(ticker.length).toBeGreaterThanOrEqual(4);
  });

  it('counts the hero numbers up only when they come on screen', () => {
    const hero = read(`${ROOT}/Hero.tsx`);
    expect(hero).toMatch(/useInView\(ref/);
    expect(hero).toMatch(/if \(!inView\) return;/);
    expect(hero).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    expect(hero).toMatch(/cancelAnimationFrame\(raf\)/);
  });

  it('runs the coals off one canvas that stops when nobody is watching', () => {
    const field = read(`${ROOT}/EmberField.tsx`);
    expect(field).toMatch(/getContext\('2d'\)/);
    expect(field).toMatch(/globalCompositeOperation = 'lighter'/);
    expect(field).toMatch(/requestAnimationFrame/);
    expect(field).toMatch(/cancelAnimationFrame/);
    expect(field).toMatch(/new IntersectionObserver/);
    expect(field).toMatch(/visibilitychange/);
    expect(field).toMatch(/prefers-reduced-motion/);
    expect(field).toMatch(/devicePixelRatio/);
    // Reduced motion paints once instead of looping.
    expect(field).toMatch(/if \(reduce\) paint\(\);/);
    expect(field).toMatch(/aria-hidden/);
    // A page-wide field does not need sixty frames.
    expect(field).toMatch(/const FRAME_MS = 1000 \/ 30;/);
    expect(field).toMatch(/if \(now - last < FRAME_MS\) return;/);
  });

  it('burns one coal field behind the whole page, not one per band', () => {
    const page = read(`${ROOT}/EmberLarder.tsx`);
    const hero = read(`${ROOT}/Hero.tsx`);
    const css = read('app/globals.css');
    expect(page).toMatch(/<EmberField className="el-ember" /);
    expect(hero).not.toMatch(/EmberField/);
    // Pinned to the viewport, above the photograph, below the copy and bands.
    expect(css).toMatch(/\.ember-larder \.el-ember\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.ember-larder \.el-ember\s*\{[^}]*z-index:\s*2/);
    // A canvas is a replaced element: `inset: 0` alone leaves it 300x150.
    expect(css).toMatch(/\.ember-larder \.el-ember\s*\{[^}]*width:\s*100%/);
    expect(css).toMatch(/\.ember-larder \.el-ember\s*\{[^}]*height:\s*100%/);
    expect(css).toMatch(/\.ember-larder \.el-band\s*\{[^}]*z-index:\s*3/);
    expect(css).toMatch(/\.ember-larder \.el-footer\s*\{[^}]*z-index:\s*3/);
  });

  it('lets the coals glow through the panels rather than blurring them out', () => {
    const css = read('app/globals.css');
    // Declarations only — a comment may name the property it warns against.
    const body = (selector: string) =>
      (css.match(new RegExp(`\\.ember-larder \\.${selector} \\{([^}]*)\\}`))?.[1] ?? '').replace(
        /\/\*[\s\S]*?\*\//g,
        '',
      );
    // Frost inside a raised band samples only the band, so a blurred card hides
    // the fire behind it. These panels are translucent and deliberately unblurred.
    for (const panel of ['el-card', 'el-quote', 'el-form-card', 'el-set-price-card', 'el-plan']) {
      const rule = body(panel);
      expect(rule, `${panel} exists`).not.toBe('');
      expect(rule, `${panel} frosts the fire away`).not.toMatch(/backdrop-filter/);
      expect(rule, `${panel} is translucent`).toMatch(/background: linear-gradient\([^)]*rgba\(/);
    }
    // The sheets that cover the page sit over the bands, so frost is free there.
    for (const panel of ['el-dialog', 'el-drawer']) {
      const rule = body(panel);
      expect(rule, panel).toMatch(/backdrop-filter: blur\(/);
      const alphas = [...rule.matchAll(/rgba\([^)]*,\s*0\.(\d+)\)/g)].map((m) =>
        Number(m[1]) / 10 ** m[1].length,
      );
      expect(alphas.length, `${panel} fades`).toBeGreaterThan(1);
      // Below nine tenths a coal drifting past would wash out the ticket.
      expect(Math.min(...alphas), panel).toBeGreaterThanOrEqual(0.9);
    }
    // A map you cannot see the fire through is just a coloured rectangle.
    expect(css).toMatch(/\.ember-larder \.el-plan-ground \{[^}]*fill: rgba\(/);
  });

  it('leans each product card toward the pointer in real 3D', () => {
    const shop = read(`${ROOT}/Products.tsx`);
    expect(shop).toMatch(/useSpring\(/);
    expect(shop).toMatch(/onPointerMove=\{onPointerMove\}/);
    expect(shop).toMatch(/onPointerLeave=\{reset\}/);
    expect(shop).toMatch(/if \(e\.pointerType !== 'mouse'\) return;/);
    expect(shop).toMatch(/perspective: 900/);
    expect(shop).toMatch(/style=\{\{ rotateX, rotateY \}\}/);
    expect(shop).toMatch(/el-card-glare/);
    const css = read('app/globals.css');
    // The card itself rotates (inline, above), so a pointer can lean it — but
    // nothing inside may ride a translateZ ramp: a lifted layer paints over its
    // controls while the hit test stays at the flat box, so the add button stops
    // taking real pointer clicks.
    expect(css).not.toMatch(/\.ember-larder \.el-card-body\s*\{[^}]*translateZ\(/);
    expect(css).not.toMatch(/\.ember-larder \.el-card-media\s*\{[^}]*translateZ\(/);
  });

  it('cross-fades the group filter and staggers the grid', () => {
    const shop = read(`${ROOT}/Products.tsx`);
    expect(shop).toMatch(/<AnimatePresence mode="popLayout">/);
    expect(shop).toMatch(/layout/);
    expect(shop).toMatch(/layoutId="el-tab-underline"/);
    expect(shop).toMatch(/role="tablist"/);
    expect(shop).toMatch(/aria-selected=\{on\}/);
    expect(shop).toMatch(/delay: Math\.min\(index, 6\) \* 0\.05/);
  });

  it('draws the set dinner as one burn down the page', () => {
    const set = read(`${ROOT}/SetMenu.tsx`);
    expect(set).toMatch(/useScroll\(\{ target: ref/);
    expect(set).toMatch(/const draw = useSpring\(scrollYProgress/);
    expect(set).toMatch(/style=\{\{ scaleY: draw \}\}/);
    expect(set).toMatch(/el-courses-line/);
    const css = read('app/globals.css');
    expect(css).toMatch(/\.ember-larder \.el-courses-line\s*\{[^}]*transform-origin:\s*top center/);
  });

  it('pauses the quote belt when a reader leans on it', () => {
    const voices = read(`${ROOT}/Reviews.tsx`);
    expect(voices).toMatch(/el-belt-track/);
    expect(voices).toMatch(/\[\.\.\.reviews, \.\.\.reviews\]/);
    const css = read('app/globals.css');
    expect(css).toMatch(/\.ember-larder \.el-belt-track\s*\{[^}]*animation:\s*el-belt/);
    expect(css).toMatch(
      /\.ember-larder \.el-belt:hover \.el-belt-track,\s*\.ember-larder \.el-belt:focus-within \.el-belt-track\s*\{[^}]*animation-play-state:\s*paused/,
    );
    expect(css).toMatch(/@keyframes el-belt/);
  });

  it('hands the booking sheet over to a hold reference instead of a fake API', () => {
    const reserve = read(`${ROOT}/Reserve.tsx`);
    expect(reserve).toMatch(/onSubmit=\{submit\}/);
    expect(reserve).toMatch(/e\.preventDefault\(\)/);
    expect(reserve).not.toMatch(/fetch\(|axios|supabase/);
    expect(reserve).toMatch(/AnimatePresence mode="wait"/);
    expect(reserve).toMatch(/layoutId="el-chip-time"/);
    expect(reserve).toMatch(/layoutId="el-chip-size"/);
  });

  it('pulses the pin on a drawn plan rather than embedding a map', () => {
    const visit = read(`${ROOT}/Visit.tsx`);
    expect(visit).toMatch(/<svg viewBox/);
    expect(visit).toMatch(/el-plan-pin/);
    expect(visit).not.toMatch(/googleapis|maps/);
    const css = read('app/globals.css');
    expect(css).toMatch(/\.ember-larder \.el-plan-halo\s*\{[^}]*animation:\s*el-halo/);
    expect(css).toMatch(/@keyframes el-halo/);
  });

  it('stops the belts, the breathing hero and the glow when motion is asked for', () => {
    const css = read('app/globals.css');
    // The theme's own block is the last reduced-motion query in the sheet.
    const reduce = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduce.slice(0, 1200)).toMatch(/\.ember-larder \.el-belt-track/);
    expect(reduce.slice(0, 1200)).toMatch(/\.ember-larder \.el-hero-img/);
    expect(reduce.slice(0, 1200)).toMatch(/animation: none !important/);
    // A belt that cannot move must still be readable.
    expect(reduce).toMatch(/\.ember-larder \.el-belt\s*\{[^}]*overflow-x:\s*auto/);
  });

  it('reveals every band once, on the way in', () => {
    const reveal = read(`${ROOT}/Reveal.tsx`);
    expect(reveal).toMatch(/whileInView=\{\{ opacity: 1, y: 0 \}\}/);
    expect(reveal).toMatch(/viewport=\{\{ once: true/);
    const story = read(`${ROOT}/Story.tsx`);
    expect(story).toMatch(/<Reveal/);
    expect(story).toMatch(/useScroll\(\{ target: ref/);
    expect(story).toMatch(/<Image[\s\S]*?story\.jpg/);
    // `delay` is framer's unit — seconds. A call site that hands over 120 leaves
    // the band invisible for two minutes, which reads as missing content.
    expect(read(`${ROOT}/Reveal.tsx`)).toMatch(/Seconds before the band lifts/);
    for (const file of ['Products', 'Story', 'SetMenu', 'Reviews', 'Reserve', 'Visit']) {
      const src = read(`${ROOT}/${file}.tsx`);
      for (const [, expr] of src.matchAll(/<Reveal[^>]*?delay=\{([\d.*\s]+)\}/g)) {
        for (const literal of expr.matchAll(/[\d.]+/g)) {
          expect(Number.parseFloat(literal[0]), `${file}: <Reveal delay={${expr.trim()}}>`).toBeLessThan(1);
        }
      }
    }
  });
});

describe('ember larder shop and pass', () => {
  it('renders one card per product with price, note and an add control', () => {
    const shop = read(`${ROOT}/Products.tsx`);
    expect(shop).toMatch(/visible\.map/);
    expect(shop).toMatch(/\{product\.note\}/);
    expect(shop).toMatch(/inr\(unitPrice\(product, chosen\)\)/);
    // The foot answers "how much food is this", not "what does it cost" twice.
    expect(shop).toMatch(/\{product\.details\.metric\}/);
    expect(shop.match(/inr\(unitPrice\(product, chosen\)\)/g)).toHaveLength(1);
    expect(shop).toMatch(/isRecommended\(product\)/);
    expect(shop).toMatch(/product\.choices\?\.length \? 'Choose and add' : '\+ Add'/);
    expect(shop).toMatch(/aria-label=\{`One more \$\{product\.name\}`\}/);
  });

  it('filters on the group the data declares, with Everything first', () => {
    const shop = read(`${ROOT}/Products.tsx`);
    expect(shop).toMatch(/filter === 'all' \? products : products\.filter\(\(p\) => p\.group === filter\)/);
    expect(shop).toMatch(/import \{ groups, isRecommended, products/);
  });

  it('opens the variants in a modal sheet, not inline on the card', () => {
    const dialog = read(`${ROOT}/ProductDialog.tsx`);
    expect(dialog).toMatch(/role="dialog"/);
    expect(dialog).toMatch(/aria-modal="true"/);
    expect(dialog).toMatch(/aria-pressed=\{on\}/);
    expect(dialog).toMatch(/Escape/);
    expect(dialog).toMatch(/document\.body\.style\.overflow/);
    expect(dialog).toMatch(/closeRef\.current\?\.focus\(\)/);
    expect(dialog).toMatch(/exit=\{\{ opacity: 0 \}\}/);
    expect(dialog).toMatch(/MAX_QTY/);
    expect(dialog).toMatch(/Add · \$\{inr\(price \* qty\)\}/);
    // Re-choosing a variant invalidates the previous confirmation.
    expect(dialog).toMatch(/setAdded\(false\)/);
  });

  it('keeps the pass open after the last line is dropped', () => {
    const drawer = read(`${ROOT}/CartDrawer.tsx`);
    expect(drawer).toMatch(/The basket is cold/);
    expect(drawer).toMatch(/\{inr\(subtotal\)\}/);
    expect(drawer).toMatch(/GST \(\{Math\.round\(GST_RATE \* 100\)\}%\)/);
    expect(drawer).toMatch(/\{inr\(total\)\}/);
    expect(drawer).toMatch(/chosenLabel\(p, line\.chosen\)/);
    expect(drawer).toMatch(/orderNumber\(\)/);
    expect(drawer).toMatch(/dispatch\(\{ type: 'clear' \}\)/);
    expect(drawer).toMatch(/exit=\{\{ x: '100%' \}\}/);
  });

  it('rides a basket bar under the thumb on a phone only', () => {
    const bar = read(`${ROOT}/BasketBar.tsx`);
    const css = read('app/globals.css');
    expect(bar).toMatch(/cartCount\(cart\)/);
    expect(bar).toMatch(/aria-hidden=\{count === 0\}/);
    expect(css).toMatch(/\.ember-larder \.el-bar-wrap\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.ember-larder \.el-bar-wrap\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.ember-larder \.el-bar-wrap\s*\{[^}]*display:\s*block/,
    );
    // The header basket steps aside when the bar takes over.
    expect(css).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.ember-larder \.el-basket-btn\s*\{[^}]*display:\s*none/,
    );
    expect(css).toMatch(/\.ember-larder \.el-drawer\s*\{[^}]*env\(safe-area-inset-bottom\)/);
    // A floating bar must not sit on top of the end of the page while it is up.
    expect(read(`${ROOT}/EmberLarder.tsx`)).toMatch(
      /data-bar-up=\{cartCount\(cart\) > 0 \? 'true' : 'false'\}/,
    );
    expect(css).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.ember-larder\[data-bar-up='true'\] \.el-footer\s*\{[^}]*padding-bottom:\s*88px/,
    );
  });

  it('keeps the header basket honest about what is in it', () => {
    const nav = read(`${ROOT}/Nav.tsx`);
    expect(nav).toMatch(/cartCount\(cart\)/);
    expect(nav).toMatch(/\$\{count\} in basket/);
    expect(nav).toMatch(/\{inr\(total\)\}/);
    expect(nav).toMatch(/data-scrolled=\{scrolled \? 'true' : 'false'\}/);
    expect(nav).toMatch(/requestAnimationFrame/);
    expect(nav).toMatch(/aria-expanded=\{open\}/);
  });
});

describe('ember larder theme', () => {
  const css = read('app/globals.css');

  it('scopes every rule to the site so the brand shell keeps its own tokens', () => {
    const block = css.slice(css.indexOf('   Ember Larder — charcoal and ember'));
    expect(block).toMatch(/^\.ember-larder \{\n  --el-soot:/m);
    expect(block).toMatch(/--el-ember: #ff6a3d;/);
    expect(block).toMatch(/--el-bone: #f3ece1;/);
    expect(block).toMatch(/font-family: var\(--font-serif\)/);
    // No bare `el-` rule may leak outside the scope.
    const leaks = block
      .split('\n')
      .filter((line) => /^\.el-/.test(line) || /^\.ember-larder[^ ]/.test(line));
    expect(leaks, leaks.join(', ')).toEqual([]);
  });

  it('keeps the ember accent the same colour the gallery swatch prints', () => {
    const site = websites.find((w) => w.slug === 'ember-larder');
    const token = css.match(/--el-ember:\s*(#[0-9a-fA-F]{6})/)?.[1] ?? '';
    expect(token.toUpperCase()).toBe(site?.accent.toUpperCase());
  });

  it('makes every tap target thumb-sized', () => {
    expect(css).toMatch(/\.ember-larder \.el-stepper button\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.ember-larder \.el-opt\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.ember-larder \.el-tab\s*\{[^}]*min-height:\s*48px/);
    expect(css).toMatch(/\.ember-larder \.el-dialog-close\s*\{[^}]*width:\s*44px/);
    expect(css).toMatch(/\.ember-larder \.el-mobile-sheet a\s*\{[^}]*min-height:\s*48px/);
    // The compact overrides are where a 40px slips back in unnoticed.
    expect(css).toMatch(/\.ember-larder \.el-stepper-sm button\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.ember-larder \.el-line-drop\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.ember-larder \.el-card-zoom\s*\{[^}]*min-height:\s*44px/);
    // Nothing tappable in this theme may be smaller than a thumb. The quantity
    // readout is a span, so it is matched by selector rather than by rule order.
    const block = css.slice(css.indexOf('Ember Larder — charcoal and ember'));
    const tappable = /(button|\.el-opt|\.el-tab|\.el-chip|\.el-seat|\.el-line-drop|\.el-burger|\.el-card-zoom|\.el-cta|:is\(a)/;
    const small = [...block.matchAll(/([^{}\n]+)\{([^}]*)\}/g)]
      .filter(([, sel, body]) => tappable.test(sel) && /min-(width|height):\s*(?:[1-9]|[1-3][0-9]|4[0-3])px/.test(body))
      .map(([sel]) => sel.trim());
    expect(small, small.join('\n')).toEqual([]);
  });

  it('stacks the dialog and the bands for a narrow screen', () => {
    expect(css).toMatch(/\.ember-larder \.el-dialog\s*\{[^}]*grid-template-columns:/);
    expect(css).toMatch(
      /@media \(max-width: 880px\)[\s\S]*?\.ember-larder \.el-dialog\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.ember-larder \.el-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/,
    );
    expect(css).toMatch(/\.ember-larder \.el-header\s*\{[^}]*position:\s*sticky/);
    expect(css).toMatch(/\.ember-larder \.el-ember\s*\{[^}]*pointer-events:\s*none/);
  });
});

describe('ember larder imagery', () => {
  it('ships every referenced photograph', () => {
    for (const src of ['/ember-larder/hero.jpg', '/ember-larder/story.jpg', ...products.map((p) => p.image)]) {
      const file = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
      expect(existsSync(file), src).toBe(true);
    }
  });

  it('describes the plate photographs and leaves the decoration silent', () => {
    const shop = read(`${ROOT}/Products.tsx`);
    expect(shop).toMatch(/alt=\{product\.name\}/);
    expect(shop).toMatch(/sizes=/);
    const drawer = read(`${ROOT}/CartDrawer.tsx`);
    expect(drawer).toMatch(/alt=""/);
    const hero = read(`${ROOT}/Hero.tsx`);
    expect(hero).toMatch(/src="\/ember-larder\/hero\.jpg"/);
    expect(hero).toMatch(/alt=""/);
  });

  it('gives the work gallery a real preview card', () => {
    const file = path.join(process.cwd(), 'public/showcase/ember-larder/preview.png');
    expect(existsSync(file), 'run the capture script after `npm run build`').toBe(true);
  });
});

describe('ember larder copy rules', () => {
  it('never promises a price the data cannot charge', () => {
    const all = JSON.stringify({ larder, products, groups, setMenu, reviews, ticker });
    expect(all).not.toMatch(/discount|% off|free delivery/i);
    expect(all).not.toMatch(/cheapest|lowest price/i);
  });

  it('keeps the set dinner one price with five courses', () => {
    expect(setMenu.courses).toHaveLength(5);
    expect(setMenu.price).toBe(inr(2400));
    expect(setMenu.per).toMatch(/six to fourteen/);
    expect(setMenu.courses.map((c) => c.label)).toEqual([
      'First',
      'Second',
      'Third',
      'Fourth',
      'Last',
    ]);
  });

  it('attributes every quote to a person and a habit, not a star rating', () => {
    expect(reviews.length).toBeGreaterThanOrEqual(4);
    for (const r of reviews) {
      expect(r.by).toMatch(/^[A-Z][a-z]+ [A-Z]\.$/);
      expect(r.from.toLowerCase()).toMatch(/ate|bought|buys|booked|visit|came/);
      expect(r.quote.length).toBeGreaterThan(40);
    }
  });

  it('says the same thing about the fire everywhere', () => {
    const text = `${larder.intro} ${larder.story} ${setMenu.blurb}`.toLowerCase();
    expect(text).toContain('sal wood');
    expect(text).toContain('hearth');
  });
});
