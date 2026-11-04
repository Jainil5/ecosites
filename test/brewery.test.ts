import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { websites } from '@/content/websites/sites';
import { brewery, galleryShots } from '@/components/sites/brewery/brewery';
import { isRecommended, menuGroups, type MenuTag } from '@/components/sites/brewery/menu';

const TAGS: MenuTag[] = ['Vegan', 'Vegetarian', 'Gluten-free', 'House-made', 'Seasonal', 'Iced'];

describe('brewery store registry entry', () => {
  const site = websites.find((w) => w.slug === 'brewery');

  it('is registered at /brewery with a gallery-ready accent', () => {
    expect(site, 'missing entry in content/websites/sites.ts').toBeDefined();
    expect(site?.path).toBe('/brewery');
    expect(site?.screenshot).toBe('/showcase/brewery/preview.png');
    expect(site?.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(site?.techStack.length).toBeGreaterThan(1);
  });

  it('reads as delivered work, not a demo, and names no city', () => {
    const text = `${site?.title} ${site?.business} ${site?.description} ${site?.theme}`.toLowerCase();
    expect(text).not.toContain('demo');
    expect(text).not.toContain('pune');
  });
});

describe('brewery menu data', () => {
  it('serves four sections: Brews, Kitchen, Café, Coolers', () => {
    expect(menuGroups.map((g) => g.id)).toEqual(['brews', 'food', 'coffee', 'beverages']);
    expect(menuGroups.map((g) => g.title)).toEqual(['Brews', 'Kitchen', 'Café', 'Coolers']);
  });

  it('expands the menu to 41 items across the sections', () => {
    const counts = Object.fromEntries(menuGroups.map((g) => [g.id, g.items.length]));
    expect(counts).toEqual({ brews: 8, food: 19, coffee: 9, beverages: 5 });
    expect(menuGroups.flatMap((g) => g.items).length).toBe(41);
  });

  it('keeps every group long enough to fill a board', () => {
    for (const group of menuGroups) {
      expect(group.items.length, group.id).toBeGreaterThanOrEqual(5);
      expect(group.items.length, group.id).toBeLessThanOrEqual(20);
      expect(group.title.trim().length).toBeGreaterThan(0);
      expect(group.blurb.trim().length).toBeGreaterThan(0);
    }
  });

  it('has unique item names across the whole menu', () => {
    const names = menuGroups.flatMap((g) => g.items.map((i) => i.name));
    expect(new Set(names).size).toBe(names.length);
  });

  it('serves only widely known, easy-to-photo items', () => {
    const byGroup = Object.fromEntries(
      menuGroups.map((g) => [g.id, g.items.map((i) => i.name)]),
    ) as Record<string, string[]>;
    expect(byGroup.brews).toEqual([
      'Copper Road Pilsner',
      'Ridgeway Pale Ale',
      'Nightporter',
      'Green Room IPA',
      'Honey Wheat',
      'Nitro Cold IPA',
      'Tamarind Sour',
      'Sunday Tripel',
    ]);
    expect(byGroup.coffee).toEqual([
      'Espresso',
      'Flat White',
      'Cappuccino',
      'Cortado',
      'Vanilla Latte',
      'Cold Brew',
      'Frappé',
      'Iced Latte',
      'Hot Chocolate',
    ]);
    expect(byGroup.food).toEqual([
      'Everything Bagel',
      'Avocado & Egg Bagel',
      'Scramble Bagel',
      'Almond Croissant',
      'Blueberry Muffin',
      'Coconut Chia Bowl',
      'Pressed Toastie',
      'Roasted Tomato Soup',
      'Grilled Chicken Sandwich',
      'Mushroom & Egg Bowl',
      'Caesar Salad',
      'Salt & Vinegar Fries',
      'Bombay Grilled Sandwich',
      'Margherita Pizza',
      'Cheese Burst Pizza',
      'Pink Sauce Pasta',
      'Paneer Tikka Roll',
      'Loaded Brewpub Fries',
      'Smoked Chicken Wings',
    ]);
    expect(byGroup.beverages).toEqual([
      'Mint Lemonade',
      'Peach Iced Tea',
      'Fresh Lime Soda',
      'Mango Lassi',
      'Diet Coke',
    ]);
  });

  it('gives every item a unique id and a photo path derived from it', () => {
    const ids = menuGroups.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size, 'duplicate ids').toBe(ids.length);
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.id, item.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(item.src, item.name).toBe(`/brewery/menu/${item.id}.jpg`);
    }
  });

  it('prompts each category and pre-picks exactly one featured item', () => {
    const prompts: Record<string, string> = {
      brews: 'Select your pint',
      food: 'Select your plate',
      coffee: 'Select your coffee',
      beverages: 'Select your drink',
    };
    for (const group of menuGroups) {
      expect(group.prompt, group.id).toBe(prompts[group.id]);
      const featured = group.items.filter((i) => i.featured);
      expect(featured.length, group.id).toBe(1);
      expect(featured[0].badge, group.id).toBeTruthy();
    }
    expect(menuGroups.find((g) => g.id === 'coffee')!.items.find((i) => i.featured)!.id).toBe('cold-brew');
    expect(menuGroups.find((g) => g.id === 'coffee')!.items.find((i) => i.featured)!.badge).toBe('Top rated');
    expect(menuGroups.find((g) => g.id === 'brews')!.items.find((i) => i.featured)!.id).toBe(
      'copper-road-pilsner',
    );
    expect(menuGroups.find((g) => g.id === 'brews')!.items.find((i) => i.featured)!.badge).toBe(
      'House pilsner',
    );
  });

  it('gives every beer its strength, its bitterness and a plate to go with', () => {
    const brews = menuGroups.find((g) => g.id === 'brews')!.items;
    const plates = menuGroups.find((g) => g.id === 'food')!.items;
    for (const beer of brews) {
      expect(beer.abv, beer.name).toBeGreaterThan(3);
      expect(beer.abv, beer.name).toBeLessThan(10);
      expect(beer.ibu, beer.name).toBeGreaterThan(5);
      expect(beer.ibu, beer.name).toBeLessThan(100);
      expect(beer.style, beer.name).toBeTruthy();
      // The pairing names a real plate from the kitchen.
      expect(plates.map((p) => p.name), beer.name).toContain(beer.pairing);
    }
  });

  it('names the beer every plate asks for', () => {
    const names = menuGroups.find((g) => g.id === 'brews')!.items.map((b) => b.name);
    for (const plate of menuGroups.find((g) => g.id === 'food')!.items) {
      expect(names, plate.name).toContain(plate.pairing);
    }
  });

  it('stars every item worth pushing, in every category', () => {
    // Recommended = carries a badge or is the featured pick; the card shows ★ for these.
    for (const group of menuGroups) {
      expect(group.items.some(isRecommended), group.id).toBe(true);
    }
    const starred = menuGroups
      .flatMap((g) => g.items)
      .filter(isRecommended)
      .map((i) => i.name);
    expect(starred).toEqual([
      'Copper Road Pilsner',
      'Nightporter',
      'Green Room IPA',
      'Sunday Tripel',
      'Everything Bagel',
      'Avocado & Egg Bagel',
      'Pressed Toastie',
      'Roasted Tomato Soup',
      'Cheese Burst Pizza',
      'Loaded Brewpub Fries',
      'Smoked Chicken Wings',
      'Cold Brew',
      'Frappé',
      'Mango Lassi',
    ]);
  });

  it('gives every item back-of-card details', () => {
    const ALLERGENS = ['gluten', 'dairy', 'egg', 'nuts', 'soy', 'sesame', 'fish'];
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.details.ingredients.length, item.name).toBeGreaterThanOrEqual(3);
      for (const part of item.details.ingredients) {
        expect(part.length, `${item.name}: ${part}`).toBeGreaterThan(1);
        expect(part.length, `${item.name}: ${part}`).toBeLessThan(40);
      }
      for (const allergen of item.details.allergens) {
        expect(ALLERGENS, item.name).toContain(allergen);
      }
      expect(item.details.kcal, item.name).toBeGreaterThan(0);
      expect(item.details.kcal, item.name).toBeLessThan(1200);
    }
  });

  it('prices every item in rupees and keeps the display string in step', () => {
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.amount, item.name).toBeGreaterThan(0);
      expect(item.price, item.name).toBe('₹' + item.amount.toLocaleString('en-IN'));
    }
  });

  it('keeps item notes to one scannable line', () => {
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.note.length, item.name).toBeGreaterThan(10);
      expect(item.note.length, item.name).toBeLessThanOrEqual(80);
      expect(item.note, item.name).not.toMatch(/\n/);
    }
  });

  it('only uses dietary tags the legend explains', () => {
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.tags.length, item.name).toBeGreaterThan(0);
      for (const tag of item.tags) expect(TAGS, `${item.name}: ${tag}`).toContain(tag);
    }
  });
});

describe('brewery square tile grid', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/MenuExperience.tsx');
  const dialog = read('components/sites/brewery/ItemDialog.tsx');
  const css = read('app/globals.css');

  it('serves the whole menu as one square grid, and only the whole menu', () => {
    // "All" is the flat board; a single section goes on the barrel instead
    // (see the barrel gallery contract below), which is what he asked for
    // on 2026-10-22.
    expect(src).toMatch(/\) : cat === 'all' \?/);
    expect(src).toMatch(/br-square-grid/);
    expect(src).toMatch(/menuGroups\.flatMap/);
    expect(css).toMatch(/\.brewery \.br-square-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/\.brewery \.br-tile\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/);
  });

  it('marks each tile with its category and keeps the shared star', () => {
    expect(src).toMatch(/br-tile-cat/);
    expect(src).toMatch(/br-card-star/);
    expect(src).not.toMatch(/br-pick-card-star"/);
  });

  it('keeps the floating grid for Gen Z and prints a listing for Traditional', () => {
    // The switch now restructures: trad renders a menu listing instead
    // of the tile grid. He asked for it 2026-10-18, replacing the old
    // "restyles rather than restructures" contract.
    expect(src).toMatch(/mode === 'trad'/);
    expect(src).toMatch(/br-menu-list/);
    expect(src).toMatch(/br-square-grid/);
    expect(css).toMatch(/\.brewery \.br-menu-list\s*\{/);
  });

  it('sits the mode switch in the tab row above the grid', () => {
    expect(src.search(/className="br-mode"/)).toBeLessThan(src.search(/br-square-grid/));
  });

  it('opens the tapped item in a centered dialog with the add control inside', () => {
    expect(src).toMatch(/<ItemDialog/);
    expect(dialog).toMatch(/role="dialog"/);
    expect(dialog).toMatch(/aria-modal="true"/);
    expect(dialog).toMatch(/br-dialog-add/);
    expect(dialog).toMatch(/item\.details\.ingredients/);
    expect(dialog).toMatch(/item\.details\.allergens/);
    expect(dialog).toMatch(/kcal/);
    expect(dialog).toMatch(/Escape/);
    // The dialog is the only way in: no flip cards, no per-tile buttons.
    expect(src).not.toMatch(/br-flip|BoardRow|br-pick-strip|toggleFlip/);
  });

  it('swaps the add button for a stepper once the item is on the tray', () => {
    expect(dialog).toMatch(/qty\s*>\s*0\s*\?/);
    expect(dialog).toMatch(/setQty/);
  });

  it('keeps the ordering controls thumb-sized', () => {
    expect(css).toMatch(/\.brewery \.br-dialog-add\s*\{[^}]*min-height:\s*48px/);
    expect(css).toMatch(/\.brewery \.br-dialog-close\s*\{[^}]*width:\s*44px/);
  });

  it('gives the description its own space on a phone', () => {
    // His ask on 2026-10-23: the note only ever lived in the dialog, so a
    // phone shopper scrolled 31 photos with no idea what any of them were.
    expect(src).toMatch(/<span className="br-tile-note">\{item\.note\}<\/span>/);
    expect(css).toMatch(/\.brewery \.br-tile-cap\s*\{[^}]*grid-template-columns:/);
    expect(css).toMatch(/\.brewery \.br-tile-note\s*\{[^}]*-webkit-line-clamp:\s*1/);
    // Below the phone breakpoint the caption leaves the photo and sits on
    // its own paper strip, which is where the extra room comes from.
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-tile\s*\{[^}]*aspect-ratio:\s*auto/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-tile-img\s*\{[^}]*position:\s*relative/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-tile-cap\s*\{[^}]*position:\s*static/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-tile-note\s*\{[^}]*-webkit-line-clamp:\s*2/,
    );
  });

  it('drops the prose that used to surround the cards', () => {
    expect(src).not.toMatch(/group\.prompt|group\.blurb|group\.kicker/);
    expect(src).not.toMatch(/Vegan · Vegetarian/);
    expect(src).not.toMatch(/Tap any card/);
    expect(src).not.toMatch(/br-pick-tab/);
  });
});

describe('brewery category filter tabs', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('offers one tab per menu section plus All first, defaulting to Brews', () => {
    expect(src).toMatch(/useState<'all' \| string>\('brews'\)/);
    // All leads the tab row, then Brews, then the other sections.
    expect(src).toMatch(/filter\(\(g\) => g\.id === 'brews'\)/);
    expect(src).toMatch(/tabGroups\.map[\s\S]*?br-cat-tab/);
    expect(src.search(/>\s*All\s*</)).toBeLessThan(src.search(/tabGroups\.map/));
  });

  it('filters the one grid instead of restructuring it', () => {
    // All items carry their group id; the visible list is a filter of it.
    expect(src).toMatch(/groupId: group\.id/);
    expect(src).toMatch(/cat === 'all' \|\| .*groupId/);
    // One grid renders the filtered list.
    expect(src).toMatch(/visible\.map/);
  });

  it('sits the tabs and mode switch above the grid in one row', () => {
    expect(src).toMatch(/role="tablist"/);
    expect(src).toMatch(/aria-selected/);
    expect(src).toMatch(/br-tab-row/);
    expect(src.search(/br-cat-tabs/)).toBeLessThan(src.search(/br-square-grid/));
    // The mode switch shares the tab row, above the cards.
    expect(src.search(/className="br-mode"/)).toBeLessThan(src.search(/br-square-grid/));
  });

  it('keeps the tabs thumb-sized pills in both skins', () => {
    expect(css).toMatch(/\.brewery \.br-cat-tab\s*\{/);
    expect(css).toMatch(/\.brewery \.br-cat-tabs\s*\{/);
  });
});

describe('brewery taproom background', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('paints the menu on a deep bottle-green-to-brass wash', () => {
    expect(css).toMatch(/\.brewery \.br-menu\s*\{[^}]*#0b1610[^}]*#7a5a22/);
  });

  it('lays decorative glass rings and hop swirls behind the grid', () => {
    // Both layers are rendered, aria-hidden, and never eat a click.
    expect(src).toMatch(/<div aria-hidden className="br-rings" \/>/);
    expect(src).toMatch(/<div aria-hidden className="br-hops" \/>/);
    expect(css).toMatch(/\.brewery \.br-rings\s*\{[^}]*radial-gradient\([^)]*transparent[^}]*pointer-events:\s*none/);
    // Hops and bubbles ship as an inline SVG pattern: no extra network asset.
    expect(css).toMatch(/\.brewery \.br-hops\s*\{[^}]*url\("data:image\/svg\+xml/);
  });

  it('drifts the bean pattern slowly and stops for reduced motion', () => {
    expect(css).toMatch(/\.brewery \.br-hops\s*\{[^}]*animation:\s*br-hops-drift/);
    expect(css).toMatch(/@keyframes br-hops-drift/);
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.brewery \.br-hops\s*\{[^}]*animation: none/);
  });
});

describe('brewery mode switch fits its labels', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('never clips the Traditional label', () => {
    // Two equal columns sized to the wider label, so the sliding pill
    // still covers 50% while "Traditional" keeps its full text width.
    expect(css).toMatch(/\.brewery \.br-mode\s*\{[^}]*display:\s*inline-grid/);
    expect(css).toMatch(/\.brewery \.br-mode\s*\{[^}]*grid-template-columns:\s*repeat\(\s*2,\s*minmax\(\s*max-content,\s*1fr\s*\)\s*\)/);
  });

  it('gives the switch a thumb-sized tap target on phones', () => {
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.brewery \.br-mode-btn\s*\{[^}]*min-height:\s*44px/);
  });
});

describe('brewery traditional printed listing', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('lists each section under a printed heading and honors the tab filter', () => {
    // Sections come from the same tabGroups/cat state the grid uses.
    expect(src).toMatch(/tabGroups[\s\S]{0,80}cat === 'all' \|\| g\.id === cat/);
    expect(src).toMatch(/br-list-heading/);
  });

  it('prints rows with a thumbnail, dotted leader and price', () => {
    expect(src).toMatch(/br-list-thumb/);
    expect(src).toMatch(/br-list-leader/);
    expect(src).toMatch(/br-list-price/);
    expect(css).toMatch(/\.br-list-leader\s*\{[^}]*border-bottom:[^}]*dotted/);
    expect(css).toMatch(/\.br-list-name\s*\{[^}]*--font-serif/);
  });

  it('opens the same center dialog from a listing row', () => {
    expect(src).toMatch(/br-list-row[\s\S]{0,220}setOpenedId\(item\.id\)/);
  });

  it('keeps rows thumb-sized and shows tray counts', () => {
    expect(css).toMatch(/\.br-list-row\s*\{[^}]*min-height:\s*44px/);
    expect(src).toMatch(/br-list-qty/);
  });
});

describe('brewery tile 3D pointer tilt', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('leans the hovered tile toward the pointer in perspective', () => {
    expect(src).toMatch(/onPointerMove=/);
    expect(src).toMatch(/onPointerLeave=/);
    expect(src).toMatch(/setProperty\('--ry'/);
    expect(src).toMatch(/setProperty\('--rx'/);
    expect(css).toMatch(/\.brewery \.br-tile:hover\s*\{[^}]*perspective\([^)]*\)\s*rotateX\(var\(--rx/);
    expect(css).toMatch(/rotateY\(var\(--ry/);
  });

  it('drifts the photo under the caption for depth', () => {
    expect(src).toMatch(/setProperty\('--px'/);
    expect(css).toMatch(/\.br-tile:hover \.br-tile-img img\s*\{[^}]*translate3d\(var\(--px/);
  });

  it('only tilts on hover-capable fine pointers', () => {
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
    expect(src).toMatch(/matchMedia\('\(hover: hover\)'\)/);
  });

  it('stays still when the customer asks for reduced motion', () => {
    expect(src).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    // The reduce block already zeroes the tile hover transform.
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.brewery \.br-tile,?\s*\.brewery \.br-tile:hover/);
  });
});

describe('brewery ambient 3D float', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('breathes every tile with a 3D wobble on all devices', () => {
    expect(css).toMatch(/\.brewery \.br-square-grid\s*\{[^}]*perspective:\s*\d+px/);
    expect(css).toMatch(/\.brewery \.br-tile\s*\{[^}]*animation:\s*br-float/);
  });

  it('animates the individual transform properties so the hover tilt still composes', () => {
    const kf = css.match(/@keyframes br-float\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(kf).toContain('translate:');
    expect(kf).toContain('rotate:');
    // transform inside the keyframes would override the pointer-tilt hover rule.
    expect(kf).not.toContain('transform');
  });

  it('staggers the float so the grid moves like a wave, not in lockstep', () => {
    expect(css).toMatch(/\.br-tile:nth-child\(4n \+ 2\)\s*\{[^}]*animation-(delay|duration)/);
    expect(css).toMatch(/\.br-tile:nth-child\(4n \+ 3\)\s*\{[^}]*animation-(delay|duration)/);
    expect(css).toMatch(/\.br-tile:nth-child\(4n\)\s*\{[^}]*animation-(delay|duration)/);
  });

  it('stops the float for reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]{0,1600}\.brewery \.br-tile,\s*\.brewery \.br-tile:hover,[\s\S]{0,160}?animation: none/);
  });

  it('rocks the tiles harder on phones', () => {
    // He reported "cards are not moving" at 375px: the 6px laptop bob reads
    // as still on a small high-density screen, so phones get a bigger swing.
    expect(css).toMatch(/@keyframes br-float\s*\{[\s\S]*?translate:\s*0 var\(--br-bob/);
    expect(css).toMatch(/\.brewery \.br-tile\s*\{[^}]*--br-bob:\s*-6px/);
    expect(css).toMatch(/@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-tile\s*\{[^}]*--br-bob:\s*-1[0-9]px/);
  });
});

describe('brewery barrel gallery', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/MenuExperience.tsx');
  const barrel = read('components/sites/brewery/BarrelGallery.tsx');
  const css = read('app/globals.css');

  it('puts one section on the barrel and keeps All on the flat board', () => {
    // In the render: Traditional listing first, then the All grid, then the
    // barrel — the barrel only takes a single section in the Gen Z skin.
    const trad = src.search(/mode === 'trad' \?/);
    const grid = src.search(/\) : cat === 'all' \?/);
    const gallery = src.search(/<BarrelGallery/);
    expect(trad).toBeGreaterThan(-1);
    expect(grid).toBeGreaterThan(trad);
    expect(gallery).toBeGreaterThan(grid);
    expect(src).toMatch(/key=\{cat\}/);
    expect(src).toMatch(/entries=\{visible\}/);
    expect(src).toMatch(/label=\{activeGroup\?\.title/);
    // The tabs still sit above whatever board is served.
    expect(src.search(/br-cat-tabs/)).toBeLessThan(gallery);
    // role="tab" is only honest if it controls a real tabpanel.
    expect(src).toMatch(/aria-controls="br-menu-board"/);
    expect(src).toMatch(/id="br-menu-board"/);
    expect(src).toMatch(/role="tabpanel"/);
    expect(src).toMatch(/aria-labelledby=\{`br-tab-\$\{cat\}`\}/);
  });

  it('stands the cards on a cylinder whose radius comes from the card size', () => {
    expect(css).toMatch(/\.brewery \.br-barrel-stage\s*\{[^}]*--step:\s*calc\(360deg \/ var\(--n/);
    expect(css).toMatch(/--r:\s*calc\(\(var\(--cw\) \+ var\(--gap\)\)/);
    expect(css).toMatch(/2 \* sin\(var\(--step\) \/ 2\)/);
    expect(css).toMatch(/\.brewery \.br-barrel-slot\s*\{[^}]*transform:\s*rotateY\(var\(--a[^}]*translateZ\(var\(--r\)\)/);
  });

  it('keeps the facing card on the picture plane and views the barrel from above', () => {
    // Push the cylinder back by its own radius before tipping it, or the near
    // arc lands between the camera and the stage and inflates past it.
    expect(css).toMatch(
      /\.brewery \.br-barrel-ring\s*\{[^}]*transform:\s*rotateX\(var\(--tilt\)\) translateZ\(calc\(var\(--r\) \* -1\)\) rotateY\(var\(--rot/,
    );
    expect(css).toMatch(/\.brewery \.br-barrel-ring\s*\{[^}]*transform-style:\s*preserve-3d/);
    expect(css).toMatch(/\.brewery \.br-barrel-stage\s*\{[^}]*perspective:\s*var\(--persp\)/);
    // The far side must not show through the near cards as a mirror.
    expect(css).toMatch(/\.brewery \.br-barrel-slot\s*\{[^}]*backface-visibility:\s*hidden/);
    expect(css).toMatch(/\.brewery \.br-barrel-card\s*\{[^}]*backface-visibility:\s*hidden/);
  });

  it('drives the whole spin from one custom property', () => {
    expect(barrel).toMatch(/setProperty\('--rot'/);
    expect(barrel).toMatch(/ref=\{ringRef\}/);
    expect(barrel).toMatch(/ref=\{stageRef\}/);
    // Depth cues are derived in CSS from the angle to camera, not per frame.
    expect(css).toMatch(/--rel:\s*calc\(var\(--a[^)]*\)\s*\+\s*var\(--rot/);
    expect(css).toMatch(/--face:\s*max\(0,\s*cos\(var\(--rel\)\)\)/);
    expect(css).toMatch(/opacity:\s*calc\([^}]*var\(--face\)/);
    expect(barrel).not.toMatch(/getBoundingClientRect\(\)[\s\S]*?for \(/);
  });

  it('spins on drag, sideways wheel, keys, dots and taps', () => {
    expect(barrel).toMatch(/setPointerCapture/);
    expect(barrel).toMatch(/releasePointerCapture/);
    expect(barrel).toMatch(/Math\.abs\(dx\) < 6/);
    expect(barrel).toMatch(/FLING_STEPS/);
    // A vertical wheel belongs to the page, never to the barrel.
    expect(barrel).toMatch(/Math\.abs\(e\.deltaX\) <= Math\.abs\(e\.deltaY\)/);
    expect(barrel).toMatch(/ArrowRight/);
    expect(barrel).toMatch(/br-barrel-dot/);
    expect(barrel).toMatch(/aria-current=/);
  });

  it('drifts one slow turn at a time while nobody is busy with it', () => {
    expect(barrel).toMatch(/AUTO_MS/);
    expect(barrel).toMatch(/AUTO_START_MS/);
    // The heartbeat holds the countdown for hover, drags, keys and hidden tabs.
    expect(barrel).toMatch(/engagedRef/);
    expect(barrel).toMatch(/hoveringRef/);
    expect(barrel).toMatch(/document\.visibilityState/);
    expect(barrel).toMatch(/onPointerEnter=/);
    expect(barrel).toMatch(/onPointerLeave=/);
    // Reduced motion keeps the barrel still.
    expect(barrel).toMatch(/if \(n < 2 \|\| still\(\)\) return/);
  });

  it('shows a swipe hint that waits for the barrel to come on screen', () => {
    expect(barrel).toMatch(/HINT_MS/);
    // Armed by intersection, so the countdown does not burn behind the hero.
    expect(barrel).toMatch(/new IntersectionObserver/);
    expect(barrel).toMatch(/setHintArmed\(true\)/);
    expect(barrel).toMatch(/setTimeout\(\(\) => setShowHint\(false\), HINT_MS\)/);
    // The customer taking the wheel retires it immediately.
    expect(barrel).toMatch(/setShowHint\(false\)/);
    // It sits under the facing card, not across the middle of it.
    expect(css).toMatch(/\.brewery \.br-swipe-hint\s*\{[^}]*align-items:\s*flex-end/);
    expect(css).toMatch(/\.brewery \.br-swipe-hint\[data-live='true'\]\s*\{[^}]*opacity:\s*1/);
  });

  it('opens the facing card only, and never on the tail of a drag', () => {
    expect(barrel).toMatch(/if \(movedRef\.current\) return/);
    expect(barrel).toMatch(/i !== activeRef\.current/);
    expect(barrel).toMatch(/onOpen\(entries\[i\]\.item\.id\)/);
    // Focus turns the barrel for the keyboard alone: click-focus fires before
    // click, so spinning there would turn one tap into an open.
    expect(barrel).toMatch(/:focus-visible/);
  });

  it('keeps every ordering affordance on a barrel card', () => {
    expect(barrel).toMatch(/item\.name/);
    expect(barrel).toMatch(/item\.price/);
    expect(barrel).toMatch(/item\.note/);
    expect(barrel).toMatch(/BarrelStar/);
    expect(barrel).toMatch(/br-barrel-qty/);
    expect(barrel).toMatch(/cartQtyForItem\(cart, item\.id\)/);
    // Sized for the card, not the 480px source.
    expect(barrel).toMatch(/sizes=/);
  });

  it('gives phones a barrel a thumb can drive', () => {
    // Card width rides the viewport, so the barrel scales instead of switching.
    expect(css).toMatch(/--cw:\s*clamp\(196px,\s*60vw,\s*248px\)/);
    expect(css).toMatch(/\.brewery \.br-barrel-stage\s*\{[^}]*touch-action:\s*pan-y/);
    expect(css).toMatch(/--dot-hit:\s*40px/);
    expect(css).toMatch(/\.brewery \.br-barrel-nav\s*\{[^}]*width:\s*44px/);
    // Bigger caption type and more stage room below the phone breakpoint:
    // the card grows taller so the description is not squeezed against the
    // photo, and the note gets three lines before it clips.
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-barrel\s*\{[^}]*--ch:\s*calc\(var\(--cw\) \* 1\.36\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-barrel-stage\s*\{[^}]*height:\s*calc\(var\(--ch\) \+ 92px\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.brewery \.br-barrel-name\s*\{[^}]*font-size:\s*17px/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.br-barrel-card\[data-active='true'\] \.br-barrel-note\s*\{[^}]*max-height:\s*66px/,
    );
  });

  it('keeps the shape but stops the movement for reduced motion', () => {
    expect(barrel).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    expect(barrel).toMatch(/if \(still\(\)\)/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.brewery \.br-barrel-card,\s*\.brewery \.br-barrel-card\[data-active='true'\]\s*\{[^}]*translate: none/,
    );
  });
});

describe('brewery combo builder', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const combo = read('components/sites/brewery/ComboBuilder.tsx');

  it('charges exactly the price it shows', () => {
    // The pair is added as two ordinary cart lines, so any discount printed in
    // the summary would have to survive into cartTotal(). It cannot, so the
    // summary must quote the plain sum of the two menu amounts.
    expect(combo).toMatch(/const comboPrice = brew\.amount \+ food\.amount;/);
    expect(combo).not.toMatch(/DISCOUNT/);
    expect(combo).not.toMatch(/br-combo-was/);
    expect(combo).toMatch(/\{inr\(comboPrice\)\}/);
  });

  it('puts one brew and one plate on the tray per combo', () => {
    expect(combo).toMatch(/dispatch\(\{ type: 'add', id: variantKey\(brew\.id\) \}\)/);
    expect(combo).toMatch(/dispatch\(\{ type: 'add', id: variantKey\(food\.id\) \}\)/);
    // Two labelled wheels, the pint drawn from the brews and the plate from food.
    expect(combo).toMatch(/find\(\(g\) => g\.id === 'brews'\)/);
    expect(combo).toMatch(/find\(\(g\) => g\.id === 'food'\)/);
    expect(combo).toMatch(/role="listbox"/);
    expect(combo).toMatch(/role="option"/);
  });
});

describe('brewery mobile floating order bar', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const tray = read('components/sites/brewery/OrderTray.tsx');
  const css = read('app/globals.css');

  it('keeps a constant order bar pinned to the bottom on phones', () => {
    // His ask: the order part "should be there" while the menu scrolls.
    expect(tray).toMatch(/br-tray-bar/);
    expect(tray).toMatch(/aria-expanded=\{open\}/);
    expect(tray).toMatch(/cartCount/);
    expect(css).toMatch(/\.brewery \.br-tray-bar\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.brewery \.br-tray-bar\s*\{[^}]*position:\s*fixed/);
  });

  it('opens the full tray as a bottom sheet over a dimmed scrim', () => {
    expect(tray).toMatch(/br-tray-scrim/);
    expect(tray).toMatch(/data-open=\{open \? 'true' : 'false'\}/);
    expect(css).toMatch(/\.brewery \.br-tray-panel\s*\{[^}]*transform:\s*translateY\(1\d\d%\)/);
    expect(css).toMatch(/\.brewery \.br-tray\[data-open='true'\] \.br-tray-panel\s*\{[^}]*transform:\s*none/);
  });

  it('takes the parked sheet out of the tab order', () => {
    // Off-screen but still focusable is how a keyboard user ends up pressing
    // + on a tray they cannot see.
    expect(css).toMatch(/\.brewery \.br-tray-panel\s*\{[^}]*visibility:\s*hidden/);
    expect(css).toMatch(
      /\.brewery \.br-tray\[data-open='true'\] \.br-tray-panel\s*\{[^}]*visibility:\s*visible/,
    );
  });

  it('keeps the sheet steppers thumb-sized', () => {
    expect(css).toMatch(
      /@media \(max-width: 1023px\)[\s\S]*?\.brewery \.br-tray-step button\s*\{[^}]*width:\s*44px/,
    );
  });

  it('clears the last menu row from under the bar', () => {
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.brewery \.br-menu\s*\{[^}]*padding-bottom:\s*(8\d|9\d|1\d\d)px/);
  });
});

describe('brewery order tray after the grid redesign', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const tray = read('components/sites/brewery/OrderTray.tsx');
  const css = read('app/globals.css');

  it('hands the tray back to the customer once they add after ordering', () => {
    // The ticket shows only while the tray is empty: a fresh + goes straight
    // back to the line list instead of hiding behind a stale ticket.
    expect(tray).toMatch(/ticket\s*&&\s*lines\.length\s*===\s*0/);
  });

  it('never clips the section that hosts the sticky tray', () => {
    // overflow-hidden on an ancestor silently traps position: sticky —
    // the desktop tray slid off-screen when the menu section had it.
    const src = read('components/sites/brewery/MenuExperience.tsx');
    const menu = src.match(/className="br-menu[^"]*"/)?.[0] ?? '';
    expect(menu).not.toContain('overflow-hidden');
  });

  it('styles its restart control with a class that still exists', () => {
    expect(tray).not.toMatch(/br-flip/);
    expect(tray).toMatch(/br-tray-restart/);
    expect(css).toMatch(/\.brewery \.br-tray-restart\s*\{/);
  });
});

describe('brewery tap wall', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/brewery/Taps.tsx');
  const css = read('app/globals.css');

  it('gives every beer on the wall a handle, a marker and a place on the board', () => {
    expect(src).toMatch(/id="taps"/);
    expect(src).toMatch(/role="tablist"/);
    expect(src).toMatch(/role="tab"/);
    expect(src).toMatch(/role="tabpanel"/);
    expect(src).toMatch(/aria-selected=\{i === active\}/);
    expect(src).toMatch(/aria-labelledby=\{`br-tap-\$\{beer\.id\}`\}/);
    // One handle per beer, with its name and strength on the marker plate.
    expect(src).toMatch(/br-tap-handle/);
    expect(src).toMatch(/className="br-tap-name"/);
    expect(src).toMatch(/className="br-tap-abv"/);
  });

  it('reads out the strength, the bitterness and the plate it pours with', () => {
    expect(src).toMatch(/\{beer\.abv\}% ABV/);
    expect(src).toMatch(/\{beer\.ibu\} IBU/);
    expect(src).toMatch(/\{beer\.price\}/);
    expect(src).toMatch(/className="br-tap-pair-name"/);
    expect(src).toMatch(/\{beer\.pairing/);
  });

  it('hangs the wall on a brass rail and marks the pulled tap', () => {
    expect(css).toMatch(/\.brewery \.br-tap-wall\s*\{[^}]*overflow-x:\s*auto/);
    expect(css).toMatch(/\.brewery \.br-tap-handle\[data-active='true'\] \.br-tap-grip/);
    expect(css).toMatch(/\.brewery \.br-tap\[aria-selected='true'\] \.br-tap-marker/);
    // The handles must be reachable by thumb, so the wall scrolls sideways.
    expect(css).toMatch(/\.brewery \.br-tap\s*\{[^}]*width:\s*112px/);
  });
});

describe('brewery identity', () => {
  it('is named Brewery and carries a taproom tagline', () => {
    expect(brewery.name).toBe('Brewery');
    expect(brewery.tagline.trim().length).toBeGreaterThan(10);
  });

  // This is a studio build, not a real business: nothing on the page may route
  // a visitor to someone else's phone line, inbox or corner.
  it('holds no real contact details', () => {
    const text = [brewery.email, brewery.address, brewery.story, ...brewery.hours.map((h) => `${h.days} ${h.time}`)].join(' ');
    expect(brewery.email).toMatch(/@brewery\.example$/);
    expect(text).not.toMatch(/\+?\d[\d\s-]{8,}\d/);
    expect(text).not.toMatch(/\b(pune|mumbai|delhi|bengaluru)\b/i);
  });

  it('never borrows the reference shop’s name or place', () => {
    const text = JSON.stringify({ brewery, menuGroups, galleryShots }).toLowerCase();
    expect(text).not.toContain('sunbeam');
    expect(text).not.toContain('brooklyn');
  });

  it('lists hours that cover the week', () => {
    expect(brewery.hours.length).toBeGreaterThanOrEqual(2);
    for (const slot of brewery.hours) {
      expect(slot.days.trim().length).toBeGreaterThan(0);
      expect(slot.time).toMatch(/^\d{1,2}:\d{2}/);
    }
  });

  it('points socials at placeholders rather than a real profile', () => {
    for (const social of brewery.socials) {
      expect(social.label.trim().length).toBeGreaterThan(0);
      expect(social.href).toBe('#');
    }
  });
});

describe('brewery one scroll', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  it('runs hero, taps, menu, story, feed, voices, room and visit in that order on one page', () => {
    const landing = read('components/sites/brewery/Brewery.tsx');
    const order = [
      '<Hero',
      '<Taps',
      '<MenuExperience',
      '<Story',
      '<Feed',
      '<Testimonials',
      '<Mosaic',
      '<Visit',
    ];
    let prev = -1;
    for (const tag of order) {
      const at = landing.search(new RegExp(tag));
      expect(at, `${tag} is out of order`).toBeGreaterThan(prev);
      prev = at;
    }
  });

  it('retires the split routes rather than leaving both in place', () => {
    for (const gone of [
      'app/(sites)/brewery/menu',
      'app/(sites)/brewery/testimonials',
      'components/sites/brewery/CafeMenuPage.tsx',
    ]) {
      expect(existsSync(path.join(process.cwd(), gone)), `${gone} should be gone`).toBe(false);
    }
  });

  it('anchors the hero into the scroll instead of another route', () => {
    const hero = read('components/sites/brewery/Hero.tsx');
    expect(hero).toMatch(/href="#menu"/);
    expect(hero).toMatch(/href="#voices"/);
    // The landing leads with the coffee, and it owns the only h1.
    expect(hero).toMatch(/<h1/);
    expect(hero).toMatch(/kicker/);
  });

  it('points every nav link at a band on the same page', () => {
    const nav = read('components/sites/brewery/Nav.tsx');
    for (const id of ['#menu', '#story', '#voices', '#feed', '#room', '#visit']) {
      expect(nav, id).toContain(`href: '${id}'`);
    }
    expect(nav).not.toMatch(/\/brewery\/(menu|testimonials)/);
  });
});

describe('brewery floating hop field', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('renders individual drifting hop cones and bubbles, hidden from a11y tooling', () => {
    const hops = read('components/sites/brewery/HopField.tsx');
    expect(hops).toMatch(/aria-hidden/);
    expect(hops).toMatch(/br-hop\b/);
    expect(hops).toMatch(/br-bubble/);
    // Each hop gets its own loop timing via inline custom properties.
    expect(hops).toMatch(/--dur/);
    expect(hops).toMatch(/--delay/);
  });

  it('animates each hop and stops for reduced motion', () => {
    expect(css).toMatch(/\.brewery \.br-hop\s*\{[^}]*animation:\s*br-hop-float/);
    expect(css).toMatch(/@keyframes br-hop-float/);
    expect(css).toMatch(/\.brewery \.br-hop-field\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.brewery \.br-hop\s*\{[^}]*animation: none/,
    );
  });

  it('floats hops on the landing hero and behind the menu board', () => {
    expect(read('components/sites/brewery/Hero.tsx')).toMatch(/<HopField/);
    expect(read('components/sites/brewery/MenuExperience.tsx')).toMatch(/<HopField/);
  });
});

describe('brewery imagery', () => {
  it('ships every referenced photo in public/', () => {
    const shots = [
      brewery.heroImage,
      ...galleryShots.map((s) => s.src),
      ...menuGroups.flatMap((g) => g.items.map((i) => i.src)),
    ];
    for (const src of shots) {
      const file = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
      expect(existsSync(file), src).toBe(true);
    }
  });

  it('describes each gallery shot for screen readers', () => {
    for (const shot of galleryShots) {
      expect(shot.alt.length, shot.src).toBeGreaterThan(15);
    }
    expect(galleryShots.length).toBeGreaterThanOrEqual(4);
  });

  it('prioritizes the above-the-fold tiles and defers everything else', () => {
    const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
    // The hero is ~746px from y=113, so it fills the first screen and is the
    // LCP element — Next flags it by name. The menu board below it still
    // prioritizes only its first row and lazy-loads the rest.
    const grid = read('components/sites/brewery/MenuExperience.tsx');
    expect(grid).toMatch(/priority=\{i < 4\}/);
    expect(grid).toMatch(/loading=\{i < 4 \? undefined : 'lazy'\}/);
    expect(read('components/sites/brewery/Hero.tsx')).toMatch(/<Image[\s\S]*?priority[\s\S]*?\/>/);
  });

  it('retires the ticker ribbon that used to sit under the hero', () => {
    expect(existsSync(path.join(process.cwd(), 'components/sites/brewery/Ticker.tsx'))).toBe(
      false,
    );
  });
});

describe('brewery instagram feed', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  it('ships exactly the three links he rotates, as a one-line-swap data file', async () => {
    const { instaFeed } = await import('@/components/sites/brewery/instaFeed');
    expect(instaFeed).toHaveLength(3);
    for (const post of instaFeed) {
      expect(post.url).toMatch(/^https:\/\/www\.instagram\.com\/(?:[\w.-]+\/)?(p|reel)\/[\w-]+\/?$/);
      expect(post.caption.length).toBeGreaterThan(10);
    }
    // The three he passed on 2026-10-19:
    expect(instaFeed.map((p) => p.url)).toEqual([
      'https://www.instagram.com/starbucks/p/DaWEQ3vEgYh/',
      'https://www.instagram.com/starbucks/reel/DYkcaYbvk7l/',
      'https://www.instagram.com/starbucks/p/DZZ6InukqOE/',
    ]);
  });

  it('embeds the live post with a graceful fallback link', () => {
    const post = read('components/sites/brewery/InstagramPost.tsx');
    expect(post).toMatch(/embed\/captioned/);
    expect(post).toMatch(/\(p\|reel\)/);
    expect(post).toMatch(/addEventListener\('message'/);
    expect(post).toMatch(/rel="noopener noreferrer"/);
    expect(post).toMatch(/target="_blank"/);
  });

  it('sits the feed after the menu and the voices and before the room, in one scroll', () => {
    const landing = read('components/sites/brewery/Brewery.tsx');
    expect(landing).toMatch(/<Feed/);
    expect(landing.search(/<MenuExperience/)).toBeLessThan(landing.search(/<Feed/));
    expect(landing.search(/<Feed/)).toBeLessThan(landing.search(/<Testimonials/));
    expect(landing.search(/<Testimonials/)).toBeLessThan(landing.search(/<Mosaic/));
    expect(landing.search(/<Mosaic/)).toBeLessThan(landing.search(/<Visit/));
    const feed = read('components/sites/brewery/Feed.tsx');
    expect(feed).toMatch(/id="feed"/);
    expect(feed).toMatch(/InstagramPost/);
  });
});

describe('brewery testimonials carousel', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('tags every demo voice to a real menu item', async () => {
    const { testimonials } = await import('@/components/sites/brewery/testimonialsData');
    expect(testimonials.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(menuGroups.flatMap((g) => g.items.map((i) => i.id)));
    for (const t of testimonials) {
      expect(ids.has(t.itemId), `${t.name} -> ${t.itemId}`).toBe(true);
      expect(t.quote.length).toBeGreaterThan(30);
      expect(t.quote).not.toMatch(/@|\.com|\+\d{8}/);
    }
  });

  it('serves the voices as a band inside the same scroll', () => {
    const page = read('components/sites/brewery/Testimonials.tsx');
    expect(page).toMatch(/br-voices/);
    expect(page).toMatch(/br-voice\b/);
    expect(page).toMatch(/id="voices"/);
    // A band, not a page: it must not bring its own chrome or a second h1.
    expect(page).not.toMatch(/<Nav|<SiteFooter/);
    expect(page).not.toMatch(/<h1/);
    const landing = read('components/sites/brewery/Brewery.tsx');
    expect(landing).toMatch(/<Testimonials/);
  });

  it('slides the voices through a motion.dev carousel with full controls', () => {
    const page = read('components/sites/brewery/Testimonials.tsx');
    expect(page).toMatch(/from 'framer-motion'/);
    expect(page).toMatch(/<motion\.div/);
    expect(page).toMatch(/aria-roledescription="carousel"/);
    expect(page).toMatch(/drag="x"/);
    expect(page).toMatch(/Previous testimonials/);
    expect(page).toMatch(/Next testimonials/);
    expect(page).toMatch(/Go to testimonial page/);
    expect(page).toMatch(/useReducedMotion/);
    expect(page).toMatch(/setInterval/);
    expect(css).toMatch(/\.brewery \.br-carousel-track\s*\{[^}]*display:\s*flex/);
    expect(css).toMatch(/\.brewery \.br-carousel-card\s*\{[^}]*flex:\s*0 0/);
    expect(css).toMatch(/\.brewery \.br-carousel-dot\[data-active='true'\]/);
  });

  it('measures card width once so the track cannot land between cards', () => {
    // The card basis used to be hardcoded in CSS at a 1024px breakpoint while
    // JS switched to two-up at 768px. Between those widths the track advanced
    // by half a card and showed two clipped ones, so both now read one
    // measurement handed down as custom properties.
    const page = read('components/sites/brewery/Testimonials.tsx');
    expect(page).toMatch(/cardW: \(w - gap \* \(perView - 1\)\) \/ perView/);
    expect(page).toMatch(/'--card-w'/);
    expect(page).toMatch(/'--gap'/);
    expect(page).toMatch(/-page \* \(metrics\.cardW \+ metrics\.gap\)/);
    expect(css).toMatch(/\.brewery \.br-carousel-card\s*\{[^}]*flex:\s*0 0 var\(--card-w/);
    expect(css).toMatch(/\.brewery \.br-carousel-track\s*\{[^}]*gap:\s*var\(--gap/);
    // No media query may re-assert a card width behind the measurement.
    const mq = css.slice(css.indexOf('@media (max-width: 1023px)'));
    expect(mq.slice(0, mq.indexOf('\n}')))
      .not.toMatch(/\.br-carousel-card\s*\{[^}]*flex-basis/);
  });

  it('gives the customer a real pause, not just hover', () => {    // Autoplay that only stops on hover fails WCAG 2.2.2: keyboard and touch
    // users never trigger it, and it resumes the moment the pointer leaves.
    const page = read('components/sites/brewery/Testimonials.tsx');
    expect(page).toMatch(/userPaused/);
    expect(page).toMatch(/setUserPaused\(\(p\) => !p\)/);
    expect(page).toMatch(/aria-pressed=\{userPaused\}/);
    expect(page).toMatch(/Pause the testimonials/);
    // Hover is a separate signal so it cannot undo an explicit pause.
    expect(page).toMatch(/if \(userPaused \|\| hovering \|\| reduceMotion/);
    expect(css).toMatch(/\.brewery \.br-carousel-pause\[aria-pressed='true'\]/);
  });

  it('wires the nav and the visit block back into the board', () => {
    const nav = read('components/sites/brewery/Nav.tsx');
    expect(nav).toMatch(/'#voices'/);
    expect(nav).toMatch(/'#feed'/);
    const visit = read('components/sites/brewery/Visit.tsx');
    expect(visit).toMatch(/href="#menu"/);
    const voices = read('components/sites/brewery/Testimonials.tsx');
    expect(voices).toMatch(/href="#menu"/);
  });
});

describe('brewery rename', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  /**
   * This file is the one place the retired slug is allowed to survive: the
   * redirect contract below has to name it to prove the old URLs still work.
   */
  const SELF = 'test/brewery.test.ts';
  const textFile = (name: string) => /\.(ts|tsx|css|mjs|js|json|sql|html|svg)$/.test(name);

  const walk = (rel: string): string[] => {
    const abs = path.join(process.cwd(), rel);
    if (!existsSync(abs)) return [];
    return readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
      const child = path.posix.join(rel, entry.name);
      if (entry.isDirectory()) return walk(child);
      return textFile(entry.name) ? [child] : [];
    });
  };

  it('leaves no trace of the retired name in any source file', () => {
    const stale = ['app', 'components', 'content', 'scripts', 'test']
      .flatMap(walk)
      .filter((rel) => rel !== SELF)
      .filter((rel) => /coffee[\s-_]?cups|\bcc-|Coffee\s+Cups/i.test(read(rel)));
    expect(stale, `still carries the old brand: ${stale.join(', ')}`).toEqual([]);
  });

  it('moved the routes, components and assets, not just the copy', () => {
    expect(existsSync(path.join(process.cwd(), 'app/(sites)/brewery/page.tsx'))).toBe(true);
    expect(existsSync(path.join(process.cwd(), 'components/sites/brewery/Brewery.tsx'))).toBe(
      true,
    );
    for (const gone of [
      'app/(sites)/coffee-cups',
      'components/sites/coffee-cups',
      'public/coffee-cups',
      'public/showcase/coffee-cups',
    ]) {
      expect(existsSync(path.join(process.cwd(), gone)), `${gone} should be gone`).toBe(false);
    }
    for (const asset of [
      'hero.jpg',
      'tap-wall.jpg',
      'flight.jpg',
      'kettle.jpg',
      'room-night.jpg',
      'chalkboard.jpg',
      'pour.jpg',
    ]) {
      expect(existsSync(path.join(process.cwd(), 'public/brewery', asset)), asset).toBe(true);
    }
    expect(existsSync(path.join(process.cwd(), 'public/showcase/brewery/preview.png'))).toBe(
      true,
    );
  });

  it('keeps the retired URLs alive with a permanent redirect', () => {
    const config = read('next.config.mjs');
    expect(config).toMatch(/async redirects\(\)/);
    expect(config).toContain("source: '/coffee-cups', destination: '/brewery', permanent: true");
    expect(config).toContain(
      "source: '/coffee-cups/:path*', destination: '/brewery/:path*', permanent: true",
    );
    expect(config).toContain("source: '/dream-cafe', destination: '/brewery', permanent: true");
    // The README is the one prose file allowed to name the old brand, and only
    // to explain the redirect.
    const readme = read('README.md');
    expect(readme).toMatch(/\| Brewery \| `\/brewery` \|/);
    expect(readme).toMatch(/redirect/i);
  });

  it('splits the wordmark so the lockup reads Brewery', () => {
    for (const rel of ['components/sites/brewery/Nav.tsx', 'components/sites/brewery/SiteFooter.tsx']) {
      const file = read(rel);
      expect(file, `${rel} serif half`).toMatch(/br-serif[^>]*>Brew</);
      expect(file, `${rel} caps half`).toMatch(/>ery</);
    }
  });

  it('carries the new name through data, contact lines and photo paths', () => {
    expect(brewery.name).toBe('Brewery');
    expect(brewery.email).toBe('hello@brewery.example');
    expect(brewery.heroImage).toBe('/brewery/hero.jpg');
    expect(websites.find((w) => w.slug === 'brewery')?.title).toBe('Brewery');
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.src.startsWith('/brewery/menu/'), item.src).toBe(true);
    }
    for (const shot of galleryShots) {
      expect(shot.src.startsWith('/brewery/'), shot.src).toBe(true);
    }
  });
});
