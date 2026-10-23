import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { websites } from '@/content/websites/sites';
import { cafe, galleryShots, tickerPhrases } from '@/components/sites/coffee-cups/cafe';
import { isRecommended, menuGroups, type MenuTag } from '@/components/sites/coffee-cups/menu';

const TAGS: MenuTag[] = ['Vegan', 'Vegetarian', 'Gluten-free', 'House-made', 'Seasonal', 'Iced'];

describe('coffee cups store registry entry', () => {
  const site = websites.find((w) => w.slug === 'coffee-cups');

  it('is registered at /coffee-cups with a gallery-ready accent', () => {
    expect(site, 'missing entry in content/websites/sites.ts').toBeDefined();
    expect(site?.path).toBe('/coffee-cups');
    expect(site?.screenshot).toBe('/showcase/coffee-cups/preview.png');
    expect(site?.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(site?.techStack.length).toBeGreaterThan(1);
  });

  it('reads as delivered work, not a demo, and names no city', () => {
    const text = `${site?.title} ${site?.business} ${site?.description} ${site?.theme}`.toLowerCase();
    expect(text).not.toContain('demo');
    expect(text).not.toContain('pune');
  });
});

describe('coffee cups menu data', () => {
  it('serves three sections: Coffee, Food, Beverages', () => {
    expect(menuGroups.map((g) => g.id)).toEqual(['coffee', 'food', 'beverages']);
  });

  it('expands the menu to 31 items across the sections', () => {
    const counts = Object.fromEntries(menuGroups.map((g) => [g.id, g.items.length]));
    expect(counts).toEqual({ coffee: 9, food: 17, beverages: 5 });
    expect(menuGroups.flatMap((g) => g.items).length).toBe(31);
  });

  it('keeps every group long enough to fill a board', () => {
    for (const group of menuGroups) {
      expect(group.items.length, group.id).toBeGreaterThanOrEqual(5);
      expect(group.items.length, group.id).toBeLessThanOrEqual(18);
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
      expect(item.src, item.name).toBe(`/coffee-cups/menu/${item.id}.jpg`);
    }
  });

  it('prompts each category and pre-picks exactly one featured item', () => {
    const prompts: Record<string, string> = {
      coffee: 'Select your coffee',
      food: 'Select your plate',
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
      'Cold Brew',
      'Frappé',
      'Everything Bagel',
      'Avocado & Egg Bagel',
      'Pressed Toastie',
      'Roasted Tomato Soup',
      'Cheese Burst Pizza',
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

describe('coffee cups square tile grid', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/coffee-cups/MenuExperience.tsx');
  const dialog = read('components/sites/coffee-cups/ItemDialog.tsx');
  const css = read('app/globals.css');

  it('serves the whole menu as one square grid, and only the whole menu', () => {
    // "All" is the flat board; a single section goes on the barrel instead
    // (see the barrel gallery contract below), which is what he asked for
    // on 2026-10-22.
    expect(src).toMatch(/\) : cat === 'all' \?/);
    expect(src).toMatch(/cc-square-grid/);
    expect(src).toMatch(/menuGroups\.flatMap/);
    expect(css).toMatch(/\.coffee-cups \.cc-square-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/\.coffee-cups \.cc-tile\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/);
  });

  it('marks each tile with its category and keeps the shared star', () => {
    expect(src).toMatch(/cc-tile-cat/);
    expect(src).toMatch(/cc-card-star/);
    expect(src).not.toMatch(/cc-pick-card-star"/);
  });

  it('keeps the floating grid for Gen Z and prints a listing for Traditional', () => {
    // The switch now restructures: trad renders a menu listing instead
    // of the tile grid. He asked for it 2026-10-18, replacing the old
    // "restyles rather than restructures" contract.
    expect(src).toMatch(/mode === 'trad'/);
    expect(src).toMatch(/cc-menu-list/);
    expect(src).toMatch(/cc-square-grid/);
    expect(css).toMatch(/\.coffee-cups \.cc-menu-list\s*\{/);
  });

  it('sits the mode switch below the grid, as customers see cards first', () => {
    expect(src.search(/cc-square-grid/)).toBeLessThan(src.search(/className="cc-mode"/));
  });

  it('opens the tapped item in a centered dialog with the add control inside', () => {
    expect(src).toMatch(/<ItemDialog/);
    expect(dialog).toMatch(/role="dialog"/);
    expect(dialog).toMatch(/aria-modal="true"/);
    expect(dialog).toMatch(/cc-dialog-add/);
    expect(dialog).toMatch(/item\.details\.ingredients/);
    expect(dialog).toMatch(/item\.details\.allergens/);
    expect(dialog).toMatch(/kcal/);
    expect(dialog).toMatch(/Escape/);
    // The dialog is the only way in: no flip cards, no per-tile buttons.
    expect(src).not.toMatch(/cc-flip|BoardRow|cc-pick-strip|toggleFlip/);
  });

  it('swaps the add button for a stepper once the item is on the tray', () => {
    expect(dialog).toMatch(/qty\s*>\s*0\s*\?/);
    expect(dialog).toMatch(/setQty/);
  });

  it('keeps the ordering controls thumb-sized', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-dialog-add\s*\{[^}]*min-height:\s*48px/);
    expect(css).toMatch(/\.coffee-cups \.cc-dialog-close\s*\{[^}]*width:\s*44px/);
  });

  it('gives the description its own space on a phone', () => {
    // His ask on 2026-10-23: the note only ever lived in the dialog, so a
    // phone shopper scrolled 31 photos with no idea what any of them were.
    expect(src).toMatch(/<span className="cc-tile-note">\{item\.note\}<\/span>/);
    expect(css).toMatch(/\.coffee-cups \.cc-tile-cap\s*\{[^}]*grid-template-columns:/);
    expect(css).toMatch(/\.coffee-cups \.cc-tile-note\s*\{[^}]*-webkit-line-clamp:\s*1/);
    // Below the phone breakpoint the caption leaves the photo and sits on
    // its own paper strip, which is where the extra room comes from.
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-tile\s*\{[^}]*aspect-ratio:\s*auto/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-tile-img\s*\{[^}]*position:\s*relative/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-tile-cap\s*\{[^}]*position:\s*static/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-tile-note\s*\{[^}]*-webkit-line-clamp:\s*2/,
    );
  });

  it('drops the prose that used to surround the cards', () => {
    expect(src).not.toMatch(/group\.prompt|group\.blurb|group\.kicker/);
    expect(src).not.toMatch(/Vegan · Vegetarian/);
    expect(src).not.toMatch(/Tap any card/);
    expect(src).not.toMatch(/cc-pick-tab/);
  });
});

describe('coffee cups category filter tabs', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/coffee-cups/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('offers one tab per menu section plus All last, defaulting to Coffee', () => {
    expect(src).toMatch(/useState<'all' \| string>\('coffee'\)/);
    // Coffee leads the tab row, then the food sections, with All last.
    expect(src).toMatch(/filter\(\(g\) => g\.id === 'coffee'\)/);
    expect(src).toMatch(/tabGroups\.map[\s\S]*?cc-cat-tab/);
    expect(src.search(/tabGroups\.map/)).toBeLessThan(src.search(/>\s*All\s*</));
  });

  it('filters the one grid instead of restructuring it', () => {
    // All items carry their group id; the visible list is a filter of it.
    expect(src).toMatch(/groupId: group\.id/);
    expect(src).toMatch(/cat === 'all' \|\| .*groupId/);
    // One grid renders the filtered list.
    expect(src).toMatch(/visible\.map/);
  });

  it('sits the tabs above the grid, so the switch is seen before the cards', () => {
    expect(src).toMatch(/role="tablist"/);
    expect(src).toMatch(/aria-selected/);
    expect(src.search(/cc-cat-tabs/)).toBeLessThan(src.search(/cc-square-grid/));
    // The mode switch stays below the grid.
    expect(src.search(/cc-square-grid/)).toBeLessThan(src.search(/className="cc-mode"/));
  });

  it('keeps the tabs thumb-sized pills in both skins', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-cat-tab\s*\{/);
    expect(css).toMatch(/\.coffee-cups \.cc-cat-tabs\s*\{/);
  });
});

describe('coffee cups coffee-stain background', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/coffee-cups/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('paints the menu on a deep espresso-to-caramel wash', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-menu\s*\{[^}]*#241108[^}]*#a85a20/);
  });

  it('lays decorative coffee rings and bean swirls behind the grid', () => {
    // Both layers are rendered, aria-hidden, and never eat a click.
    expect(src).toMatch(/<div aria-hidden className="cc-stains" \/>/);
    expect(src).toMatch(/<div aria-hidden className="cc-beans" \/>/);
    expect(css).toMatch(/\.coffee-cups \.cc-stains\s*\{[^}]*radial-gradient\([^)]*transparent[^}]*pointer-events:\s*none/);
    // Beans + steam ship as an inline SVG pattern: no extra network asset.
    expect(css).toMatch(/\.coffee-cups \.cc-beans\s*\{[^}]*url\("data:image\/svg\+xml/);
  });

  it('drifts the bean pattern slowly and stops for reduced motion', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-beans\s*\{[^}]*animation:\s*cc-beans-drift/);
    expect(css).toMatch(/@keyframes cc-beans-drift/);
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.coffee-cups \.cc-beans\s*\{[^}]*animation: none/);
  });
});

describe('coffee cups mode switch fits its labels', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('never clips the Traditional label', () => {
    // Two equal columns sized to the wider label, so the sliding pill
    // still covers 50% while "Traditional" keeps its full text width.
    expect(css).toMatch(/\.coffee-cups \.cc-mode\s*\{[^}]*display:\s*inline-grid/);
    expect(css).toMatch(/\.coffee-cups \.cc-mode\s*\{[^}]*grid-template-columns:\s*repeat\(\s*2,\s*minmax\(\s*max-content,\s*1fr\s*\)\s*\)/);
  });

  it('gives the switch a thumb-sized tap target on phones', () => {
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.coffee-cups \.cc-mode-btn\s*\{[^}]*min-height:\s*44px/);
  });
});

describe('coffee cups traditional printed listing', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/coffee-cups/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('lists each section under a printed heading and honors the tab filter', () => {
    // Sections come from the same tabGroups/cat state the grid uses.
    expect(src).toMatch(/tabGroups[\s\S]{0,80}cat === 'all' \|\| g\.id === cat/);
    expect(src).toMatch(/cc-list-heading/);
  });

  it('prints rows with a thumbnail, dotted leader and price', () => {
    expect(src).toMatch(/cc-list-thumb/);
    expect(src).toMatch(/cc-list-leader/);
    expect(src).toMatch(/cc-list-price/);
    expect(css).toMatch(/\.cc-list-leader\s*\{[^}]*border-bottom:[^}]*dotted/);
    expect(css).toMatch(/\.cc-list-name\s*\{[^}]*--font-serif/);
  });

  it('opens the same center dialog from a listing row', () => {
    expect(src).toMatch(/cc-list-row[\s\S]{0,220}setOpenedId\(item\.id\)/);
  });

  it('keeps rows thumb-sized and shows tray counts', () => {
    expect(css).toMatch(/\.cc-list-row\s*\{[^}]*min-height:\s*44px/);
    expect(src).toMatch(/cc-list-qty/);
  });
});

describe('coffee cups tile 3D pointer tilt', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/coffee-cups/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('leans the hovered tile toward the pointer in perspective', () => {
    expect(src).toMatch(/onPointerMove=/);
    expect(src).toMatch(/onPointerLeave=/);
    expect(src).toMatch(/setProperty\('--ry'/);
    expect(src).toMatch(/setProperty\('--rx'/);
    expect(css).toMatch(/\.coffee-cups \.cc-tile:hover\s*\{[^}]*perspective\([^)]*\)\s*rotateX\(var\(--rx/);
    expect(css).toMatch(/rotateY\(var\(--ry/);
  });

  it('drifts the photo under the caption for depth', () => {
    expect(src).toMatch(/setProperty\('--px'/);
    expect(css).toMatch(/\.cc-tile:hover \.cc-tile-img img\s*\{[^}]*translate3d\(var\(--px/);
  });

  it('only tilts on hover-capable fine pointers', () => {
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
    expect(src).toMatch(/matchMedia\('\(hover: hover\)'\)/);
  });

  it('stays still when the customer asks for reduced motion', () => {
    expect(src).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    // The reduce block already zeroes the tile hover transform.
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.coffee-cups \.cc-tile,?\s*\.coffee-cups \.cc-tile:hover/);
  });
});

describe('coffee cups ambient 3D float', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('breathes every tile with a 3D wobble on all devices', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-square-grid\s*\{[^}]*perspective:\s*\d+px/);
    expect(css).toMatch(/\.coffee-cups \.cc-tile\s*\{[^}]*animation:\s*cc-float/);
  });

  it('animates the individual transform properties so the hover tilt still composes', () => {
    const kf = css.match(/@keyframes cc-float\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(kf).toContain('translate:');
    expect(kf).toContain('rotate:');
    // transform inside the keyframes would override the pointer-tilt hover rule.
    expect(kf).not.toContain('transform');
  });

  it('staggers the float so the grid moves like a wave, not in lockstep', () => {
    expect(css).toMatch(/\.cc-tile:nth-child\(4n \+ 2\)\s*\{[^}]*animation-(delay|duration)/);
    expect(css).toMatch(/\.cc-tile:nth-child\(4n \+ 3\)\s*\{[^}]*animation-(delay|duration)/);
    expect(css).toMatch(/\.cc-tile:nth-child\(4n\)\s*\{[^}]*animation-(delay|duration)/);
  });

  it('stops the float for reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]{0,1600}\.coffee-cups \.cc-tile,\s*\.coffee-cups \.cc-tile:hover,[\s\S]{0,160}?animation: none/);
  });

  it('rocks the tiles harder on phones', () => {
    // He reported "cards are not moving" at 375px: the 6px laptop bob reads
    // as still on a small high-density screen, so phones get a bigger swing.
    expect(css).toMatch(/@keyframes cc-float\s*\{[\s\S]*?translate:\s*0 var\(--cc-bob/);
    expect(css).toMatch(/\.coffee-cups \.cc-tile\s*\{[^}]*--cc-bob:\s*-6px/);
    expect(css).toMatch(/@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-tile\s*\{[^}]*--cc-bob:\s*-1[0-9]px/);
  });
});

describe('coffee cups barrel gallery', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/coffee-cups/MenuExperience.tsx');
  const barrel = read('components/sites/coffee-cups/BarrelGallery.tsx');
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
    expect(src.search(/cc-cat-tabs/)).toBeLessThan(gallery);
  });

  it('stands the cards on a cylinder whose radius comes from the card size', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-stage\s*\{[^}]*--step:\s*calc\(360deg \/ var\(--n/);
    expect(css).toMatch(/--r:\s*calc\(\(var\(--cw\) \+ var\(--gap\)\)/);
    expect(css).toMatch(/2 \* sin\(var\(--step\) \/ 2\)/);
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-slot\s*\{[^}]*transform:\s*rotateY\(var\(--a[^}]*translateZ\(var\(--r\)\)/);
  });

  it('keeps the facing card on the picture plane and views the barrel from above', () => {
    // Push the cylinder back by its own radius before tipping it, or the near
    // arc lands between the camera and the stage and inflates past it.
    expect(css).toMatch(
      /\.coffee-cups \.cc-barrel-ring\s*\{[^}]*transform:\s*rotateX\(var\(--tilt\)\) translateZ\(calc\(var\(--r\) \* -1\)\) rotateY\(var\(--rot/,
    );
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-ring\s*\{[^}]*transform-style:\s*preserve-3d/);
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-stage\s*\{[^}]*perspective:\s*var\(--persp\)/);
    // The far side must not show through the near cards as a mirror.
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-slot\s*\{[^}]*backface-visibility:\s*hidden/);
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-card\s*\{[^}]*backface-visibility:\s*hidden/);
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
    expect(barrel).toMatch(/cc-barrel-dot/);
    expect(barrel).toMatch(/aria-current=/);
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
    expect(barrel).toMatch(/cc-barrel-qty/);
    expect(barrel).toMatch(/cart\[item\.id\]/);
    // Sized for the card, not the 480px source.
    expect(barrel).toMatch(/sizes=/);
  });

  it('gives phones a barrel a thumb can drive', () => {
    // Card width rides the viewport, so the barrel scales instead of switching.
    expect(css).toMatch(/--cw:\s*clamp\(196px,\s*60vw,\s*248px\)/);
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-stage\s*\{[^}]*touch-action:\s*pan-y/);
    expect(css).toMatch(/--dot-hit:\s*38px/);
    expect(css).toMatch(/\.coffee-cups \.cc-barrel-nav\s*\{[^}]*width:\s*44px/);
    // Bigger caption type and more stage room below the phone breakpoint:
    // the card grows taller so the description is not squeezed against the
    // photo, and the note gets three lines before it clips.
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-barrel\s*\{[^}]*--ch:\s*calc\(var\(--cw\) \* 1\.36\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-barrel-stage\s*\{[^}]*height:\s*calc\(var\(--ch\) \+ 92px\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.coffee-cups \.cc-barrel-name\s*\{[^}]*font-size:\s*17px/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.cc-barrel-card\[data-active='true'\] \.cc-barrel-note\s*\{[^}]*max-height:\s*66px/,
    );
  });

  it('keeps the shape but stops the movement for reduced motion', () => {
    expect(barrel).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    expect(barrel).toMatch(/if \(still\(\)\)/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.coffee-cups \.cc-barrel-card,\s*\.coffee-cups \.cc-barrel-card\[data-active='true'\]\s*\{[^}]*translate: none/,
    );
  });
});

describe('coffee cups mobile floating order bar', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const tray = read('components/sites/coffee-cups/OrderTray.tsx');
  const css = read('app/globals.css');

  it('keeps a constant order bar pinned to the bottom on phones', () => {
    // His ask: the order part "should be there" while the menu scrolls.
    expect(tray).toMatch(/cc-tray-bar/);
    expect(tray).toMatch(/aria-expanded=\{open\}/);
    expect(tray).toMatch(/cartCount/);
    expect(css).toMatch(/\.coffee-cups \.cc-tray-bar\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.coffee-cups \.cc-tray-bar\s*\{[^}]*position:\s*fixed/);
  });

  it('opens the full tray as a bottom sheet over a dimmed scrim', () => {
    expect(tray).toMatch(/cc-tray-scrim/);
    expect(tray).toMatch(/data-open=\{open \? 'true' : 'false'\}/);
    expect(css).toMatch(/\.coffee-cups \.cc-tray-panel\s*\{[^}]*transform:\s*translateY\(1\d\d%\)/);
    expect(css).toMatch(/\.coffee-cups \.cc-tray\[data-open='true'\] \.cc-tray-panel\s*\{[^}]*transform:\s*none/);
  });

  it('takes the parked sheet out of the tab order', () => {
    // Off-screen but still focusable is how a keyboard user ends up pressing
    // + on a tray they cannot see.
    expect(css).toMatch(/\.coffee-cups \.cc-tray-panel\s*\{[^}]*visibility:\s*hidden/);
    expect(css).toMatch(
      /\.coffee-cups \.cc-tray\[data-open='true'\] \.cc-tray-panel\s*\{[^}]*visibility:\s*visible/,
    );
  });

  it('keeps the sheet steppers thumb-sized', () => {
    expect(css).toMatch(
      /@media \(max-width: 1023px\)[\s\S]*?\.coffee-cups \.cc-tray-step button\s*\{[^}]*width:\s*44px/,
    );
  });

  it('clears the last menu row from under the bar', () => {
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.coffee-cups \.cc-menu\s*\{[^}]*padding-bottom:\s*(8\d|9\d|1\d\d)px/);
  });
});

describe('coffee cups order tray after the grid redesign', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const tray = read('components/sites/coffee-cups/OrderTray.tsx');
  const css = read('app/globals.css');

  it('hands the tray back to the customer once they add after ordering', () => {
    // The ticket shows only while the tray is empty: a fresh + goes straight
    // back to the line list instead of hiding behind a stale ticket.
    expect(tray).toMatch(/ticket\s*&&\s*lines\.length\s*===\s*0/);
  });

  it('never clips the section that hosts the sticky tray', () => {
    // overflow-hidden on an ancestor silently traps position: sticky —
    // the desktop tray slid off-screen when the menu section had it.
    const src = read('components/sites/coffee-cups/MenuExperience.tsx');
    const menu = src.match(/className="cc-menu[^"]*"/)?.[0] ?? '';
    expect(menu).not.toContain('overflow-hidden');
  });

  it('styles its restart control with a class that still exists', () => {
    expect(tray).not.toMatch(/cc-flip/);
    expect(tray).toMatch(/cc-tray-restart/);
    expect(css).toMatch(/\.coffee-cups \.cc-tray-restart\s*\{/);
  });
});

describe('coffee cups identity', () => {
  it('is named Coffee Cups and carries a sunrise tagline', () => {
    expect(cafe.name).toBe('Coffee Cups');
    expect(cafe.tagline.trim().length).toBeGreaterThan(10);
  });

  // This is a studio build, not a real business: nothing on the page may route
  // a visitor to someone else's phone line, inbox or corner.
  it('holds no real contact details', () => {
    const text = [cafe.email, cafe.address, cafe.story, ...cafe.hours.map((h) => `${h.days} ${h.time}`)].join(' ');
    expect(cafe.email).toMatch(/@coffeecups\.example$/);
    expect(text).not.toMatch(/\+?\d[\d\s-]{8,}\d/);
    expect(text).not.toMatch(/\b(pune|mumbai|delhi|bengaluru)\b/i);
  });

  it('never borrows the reference shop’s name or place', () => {
    const text = JSON.stringify({ cafe, menuGroups, tickerPhrases, galleryShots }).toLowerCase();
    expect(text).not.toContain('sunbeam');
    expect(text).not.toContain('brooklyn');
  });

  it('lists hours that cover the week', () => {
    expect(cafe.hours.length).toBeGreaterThanOrEqual(2);
    for (const slot of cafe.hours) {
      expect(slot.days.trim().length).toBeGreaterThan(0);
      expect(slot.time).toMatch(/^\d{1,2}:\d{2}/);
    }
  });

  it('points socials at placeholders rather than a real profile', () => {
    for (const social of cafe.socials) {
      expect(social.label.trim().length).toBeGreaterThan(0);
      expect(social.href).toBe('#');
    }
  });
});

describe('coffee cups landing/menu route split', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  it('keeps the landing free of the menu board', () => {
    const landing = read('components/sites/coffee-cups/CoffeeCups.tsx');
    expect(landing).not.toMatch(/MenuExperience/);
    expect(landing).toMatch(/<Hero/);
    expect(landing).toMatch(/<Mosaic/);
  });

  it('serves the menu board at /coffee-cups/menu', () => {
    const route = read('app/(sites)/coffee-cups/menu/page.tsx');
    expect(route).toMatch(/CafeMenuPage/);
    const page = read('components/sites/coffee-cups/CafeMenuPage.tsx');
    expect(page).toMatch(/<MenuExperience/);
    expect(page).toMatch(/<Nav/);
    expect(page).toMatch(/<SiteFooter/);
  });

  it('invites customers from the hero into the menu page', () => {
    const hero = read('components/sites/coffee-cups/Hero.tsx');
    expect(hero).toMatch(/href="\/coffee-cups\/menu"/);
    expect(hero).toMatch(/View our menu/);
  });

  it('points the nav Menu link and Order ahead at the menu route', () => {
    const nav = read('components/sites/coffee-cups/Nav.tsx');
    expect(nav).toMatch(/'\/coffee-cups\/menu'/);
    expect(nav).toMatch(/'\/coffee-cups#room'/);
  });
});

describe('coffee cups floating bean field', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('renders individual drifting bean glyphs, hidden from a11y tooling', () => {
    const beans = read('components/sites/coffee-cups/BeansField.tsx');
    expect(beans).toMatch(/aria-hidden/);
    expect(beans).toMatch(/cc-bean\b/);
    // Each bean gets its own loop timing via inline custom properties.
    expect(beans).toMatch(/--dur/);
    expect(beans).toMatch(/--delay/);
  });

  it('animates each bean and stops for reduced motion', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-bean\s*\{[^}]*animation:\s*cc-bean-float/);
    expect(css).toMatch(/@keyframes cc-bean-float/);
    expect(css).toMatch(/\.coffee-cups \.cc-beans-field\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.coffee-cups \.cc-bean\s*\{[^}]*animation: none/,
    );
  });

  it('floats beans on the landing hero and behind the menu board', () => {
    expect(read('components/sites/coffee-cups/Hero.tsx')).toMatch(/<BeansField/);
    expect(read('components/sites/coffee-cups/MenuExperience.tsx')).toMatch(/<BeansField/);
  });
});

describe('coffee cups imagery', () => {
  it('ships every referenced photo in public/', () => {
    const shots = [
      cafe.heroImage,
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
    // The menu opens the page, so the first grid row is the LCP candidate;
    // the story hero sits below it and must not compete for priority.
    const grid = read('components/sites/coffee-cups/MenuExperience.tsx');
    expect(grid).toMatch(/priority=\{i < 4\}/);
    expect(grid).toMatch(/loading=\{i < 4 \? undefined : 'lazy'\}/);
    expect(read('components/sites/coffee-cups/Hero.tsx')).not.toMatch(/priority/);
  });

  it('keeps the ticker short enough to loop without wrapping', () => {
    expect(tickerPhrases.length).toBeGreaterThanOrEqual(5);
    for (const phrase of tickerPhrases) {
      expect(phrase.length).toBeLessThanOrEqual(34);
      expect(phrase).not.toMatch(/[.!]$/);
    }
  });
});

describe('coffee cups instagram feed', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  it('ships exactly the three links he rotates, as a one-line-swap data file', async () => {
    const { instaFeed } = await import('@/components/sites/coffee-cups/instaFeed');
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
    const post = read('components/sites/coffee-cups/InstagramPost.tsx');
    expect(post).toMatch(/embed\/captioned/);
    expect(post).toMatch(/\(p\|reel\)/);
    expect(post).toMatch(/addEventListener\('message'/);
    expect(post).toMatch(/rel="noopener noreferrer"/);
    expect(post).toMatch(/target="_blank"/);
  });

  it('sits the feed on the landing between the room and the visit block', () => {
    const landing = read('components/sites/coffee-cups/CoffeeCups.tsx');
    expect(landing).toMatch(/<Feed/);
    expect(landing.search(/<Mosaic/)).toBeLessThan(landing.search(/<Feed/));
    expect(landing.search(/<Feed/)).toBeLessThan(landing.search(/<Visit/));
    const feed = read('components/sites/coffee-cups/Feed.tsx');
    expect(feed).toMatch(/id="feed"/);
    expect(feed).toMatch(/InstagramPost/);
  });
});

describe('coffee cups 3d testimonials', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('tags every demo voice to a real menu item', async () => {
    const { testimonials } = await import('@/components/sites/coffee-cups/testimonialsData');
    expect(testimonials.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(menuGroups.flatMap((g) => g.items.map((i) => i.id)));
    for (const t of testimonials) {
      expect(ids.has(t.itemId), `${t.name} -> ${t.itemId}`).toBe(true);
      expect(t.quote.length).toBeGreaterThan(30);
      expect(t.quote).not.toMatch(/@|\.com|\+\d{8}/);
    }
  });

  it('serves the voices at /coffee-cups/testimonials', () => {
    const route = read('app/(sites)/coffee-cups/testimonials/page.tsx');
    expect(route).toMatch(/Testimonials/);
    const page = read('components/sites/coffee-cups/Testimonials.tsx');
    expect(page).toMatch(/cc-voices/);
    expect(page).toMatch(/cc-voice\b/);
    expect(page).toMatch(/<Nav/);
    expect(page).toMatch(/<SiteFooter/);
  });

  it('floats the cards in a real 3D field with depth, tilt and an active lift', () => {
    expect(css).toMatch(/\.coffee-cups \.cc-voices\s*\{[^}]*perspective:/);
    expect(css).toMatch(/\.coffee-cups \.cc-voice\s*\{[^}]*translateZ\(var\(--z/);
    expect(css).toMatch(/animation:\s*cc-voice-float/);
    expect(css).toMatch(/@keyframes cc-voice-float/);
    expect(css).toMatch(/\.coffee-cups \.cc-voice\[data-active='true'\]/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.coffee-cups \.cc-voice\s*\{[^}]*animation: none/,
    );
  });

  it('wires the nav and the visit block into both new surfaces', () => {
    const nav = read('components/sites/coffee-cups/Nav.tsx');
    expect(nav).toMatch(/'\/coffee-cups#feed'/);
    expect(nav).toMatch(/'\/coffee-cups\/testimonials'/);
    const visit = read('components/sites/coffee-cups/Visit.tsx');
    expect(visit).toMatch(/\/coffee-cups\/testimonials/);
  });
});

describe('coffee cups rename', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  /**
   * This file is the one place the retired slug is allowed to survive: the
   * redirect contract below has to name it to prove the old URLs still work.
   */
  const SELF = 'test/coffee-cups.test.ts';
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
      .filter((rel) => /dream[\s-_]?cafe|\bdc-|Dream\s+Cafe/i.test(read(rel)));
    expect(stale, `still carries the old brand: ${stale.join(', ')}`).toEqual([]);
  });

  it('moved the routes, components and assets, not just the copy', () => {
    expect(existsSync(path.join(process.cwd(), 'app/(sites)/coffee-cups/page.tsx'))).toBe(true);
    expect(existsSync(path.join(process.cwd(), 'app/(sites)/coffee-cups/menu/page.tsx'))).toBe(true);
    expect(existsSync(path.join(process.cwd(), 'app/(sites)/coffee-cups/testimonials/page.tsx'))).toBe(
      true,
    );
    expect(existsSync(path.join(process.cwd(), 'components/sites/coffee-cups/CoffeeCups.tsx'))).toBe(
      true,
    );
    for (const gone of [
      'app/(sites)/dream-cafe',
      'components/sites/dream-cafe',
      'public/dream-cafe',
      'public/showcase/dream-cafe',
    ]) {
      expect(existsSync(path.join(process.cwd(), gone)), `${gone} should be gone`).toBe(false);
    }
    for (const asset of [
      'hero.jpg',
      'bagels.jpg',
      'coffee.jpg',
      'interior.jpg',
      'lunch.jpg',
      'pastry.jpg',
      'toast.jpg',
    ]) {
      expect(existsSync(path.join(process.cwd(), 'public/coffee-cups', asset)), asset).toBe(true);
    }
    expect(existsSync(path.join(process.cwd(), 'public/showcase/coffee-cups/preview.png'))).toBe(
      true,
    );
  });

  it('keeps the retired URLs alive with a permanent redirect', () => {
    const config = read('next.config.mjs');
    expect(config).toMatch(/async redirects\(\)/);
    expect(config).toContain("source: '/dream-cafe', destination: '/coffee-cups', permanent: true");
    expect(config).toContain(
      "source: '/dream-cafe/:path*', destination: '/coffee-cups/:path*', permanent: true",
    );
    // The README is the one prose file allowed to name the old brand, and only
    // to explain the redirect.
    const readme = read('README.md');
    expect(readme).toMatch(/\| Coffee Cups \| `\/coffee-cups` \|/);
    expect(readme).toMatch(/redirect/i);
  });

  it('splits the wordmark so the lockup reads Coffee CUPS', () => {
    for (const rel of ['components/sites/coffee-cups/Nav.tsx', 'components/sites/coffee-cups/SiteFooter.tsx']) {
      const file = read(rel);
      expect(file, `${rel} serif half`).toMatch(/cc-serif[^>]*>Coffee</);
      expect(file, `${rel} caps half`).toMatch(/>Cups</);
    }
  });

  it('carries the new name through data, contact lines and photo paths', () => {
    expect(cafe.name).toBe('Coffee Cups');
    expect(cafe.email).toBe('hello@coffeecups.example');
    expect(cafe.heroImage).toBe('/coffee-cups/hero.jpg');
    expect(websites.find((w) => w.slug === 'coffee-cups')?.title).toBe('Coffee Cups');
    for (const item of menuGroups.flatMap((g) => g.items)) {
      expect(item.src.startsWith('/coffee-cups/menu/'), item.src).toBe(true);
    }
    for (const shot of galleryShots) {
      expect(shot.src.startsWith('/coffee-cups/'), shot.src).toBe(true);
    }
  });
});
