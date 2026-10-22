import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { websites } from '@/content/websites/sites';
import { cafe, galleryShots, tickerPhrases } from '@/components/sites/dream-cafe/cafe';
import { isRecommended, menuGroups, type MenuTag } from '@/components/sites/dream-cafe/menu';

const TAGS: MenuTag[] = ['Vegan', 'Vegetarian', 'Gluten-free', 'House-made', 'Seasonal', 'Iced'];

describe('dream cafe store registry entry', () => {
  const site = websites.find((w) => w.slug === 'dream-cafe');

  it('is registered at /dream-cafe with a gallery-ready accent', () => {
    expect(site, 'missing entry in content/websites/sites.ts').toBeDefined();
    expect(site?.path).toBe('/dream-cafe');
    expect(site?.screenshot).toBe('/showcase/dream-cafe/preview.png');
    expect(site?.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(site?.techStack.length).toBeGreaterThan(1);
  });

  it('reads as delivered work, not a demo, and names no city', () => {
    const text = `${site?.title} ${site?.business} ${site?.description} ${site?.theme}`.toLowerCase();
    expect(text).not.toContain('demo');
    expect(text).not.toContain('pune');
  });
});

describe('dream cafe menu data', () => {
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
      expect(item.src, item.name).toBe(`/dream-cafe/menu/${item.id}.jpg`);
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

describe('dream cafe square tile grid', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/dream-cafe/MenuExperience.tsx');
  const dialog = read('components/sites/dream-cafe/ItemDialog.tsx');
  const css = read('app/globals.css');

  it('serves the whole menu as one square grid, and only the whole menu', () => {
    // "All" is the flat board; a single section goes on the barrel instead
    // (see the barrel gallery contract below), which is what he asked for
    // on 2026-10-22.
    expect(src).toMatch(/\) : cat === 'all' \?/);
    expect(src).toMatch(/dc-square-grid/);
    expect(src).toMatch(/menuGroups\.flatMap/);
    expect(css).toMatch(/\.dream-cafe \.dc-square-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/\.dream-cafe \.dc-tile\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/);
  });

  it('marks each tile with its category and keeps the shared star', () => {
    expect(src).toMatch(/dc-tile-cat/);
    expect(src).toMatch(/dc-card-star/);
    expect(src).not.toMatch(/dc-pick-card-star"/);
  });

  it('keeps the floating grid for Gen Z and prints a listing for Traditional', () => {
    // The switch now restructures: trad renders a menu listing instead
    // of the tile grid. He asked for it 2026-10-18, replacing the old
    // "restyles rather than restructures" contract.
    expect(src).toMatch(/mode === 'trad'/);
    expect(src).toMatch(/dc-menu-list/);
    expect(src).toMatch(/dc-square-grid/);
    expect(css).toMatch(/\.dream-cafe \.dc-menu-list\s*\{/);
  });

  it('sits the mode switch below the grid, as customers see cards first', () => {
    expect(src.search(/dc-square-grid/)).toBeLessThan(src.search(/className="dc-mode"/));
  });

  it('opens the tapped item in a centered dialog with the add control inside', () => {
    expect(src).toMatch(/<ItemDialog/);
    expect(dialog).toMatch(/role="dialog"/);
    expect(dialog).toMatch(/aria-modal="true"/);
    expect(dialog).toMatch(/dc-dialog-add/);
    expect(dialog).toMatch(/item\.details\.ingredients/);
    expect(dialog).toMatch(/item\.details\.allergens/);
    expect(dialog).toMatch(/kcal/);
    expect(dialog).toMatch(/Escape/);
    // The dialog is the only way in: no flip cards, no per-tile buttons.
    expect(src).not.toMatch(/dc-flip|BoardRow|dc-pick-strip|toggleFlip/);
  });

  it('swaps the add button for a stepper once the item is on the tray', () => {
    expect(dialog).toMatch(/qty\s*>\s*0\s*\?/);
    expect(dialog).toMatch(/setQty/);
  });

  it('keeps the ordering controls thumb-sized', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-dialog-add\s*\{[^}]*min-height:\s*48px/);
    expect(css).toMatch(/\.dream-cafe \.dc-dialog-close\s*\{[^}]*width:\s*44px/);
  });

  it('drops the prose that used to surround the cards', () => {
    expect(src).not.toMatch(/group\.prompt|group\.blurb|group\.kicker/);
    expect(src).not.toMatch(/Vegan · Vegetarian/);
    expect(src).not.toMatch(/Tap any card/);
    expect(src).not.toMatch(/dc-pick-tab/);
  });
});

describe('dream cafe category filter tabs', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/dream-cafe/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('offers one tab per menu section plus All last, defaulting to Coffee', () => {
    expect(src).toMatch(/useState<'all' \| string>\('coffee'\)/);
    // Coffee leads the tab row, then the food sections, with All last.
    expect(src).toMatch(/filter\(\(g\) => g\.id === 'coffee'\)/);
    expect(src).toMatch(/tabGroups\.map[\s\S]*?dc-cat-tab/);
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
    expect(src.search(/dc-cat-tabs/)).toBeLessThan(src.search(/dc-square-grid/));
    // The mode switch stays below the grid.
    expect(src.search(/dc-square-grid/)).toBeLessThan(src.search(/className="dc-mode"/));
  });

  it('keeps the tabs thumb-sized pills in both skins', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-cat-tab\s*\{/);
    expect(css).toMatch(/\.dream-cafe \.dc-cat-tabs\s*\{/);
  });
});

describe('dream cafe coffee-stain background', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/dream-cafe/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('paints the menu on a deep espresso-to-caramel wash', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-menu\s*\{[^}]*#241108[^}]*#a85a20/);
  });

  it('lays decorative coffee rings and bean swirls behind the grid', () => {
    // Both layers are rendered, aria-hidden, and never eat a click.
    expect(src).toMatch(/<div aria-hidden className="dc-stains" \/>/);
    expect(src).toMatch(/<div aria-hidden className="dc-beans" \/>/);
    expect(css).toMatch(/\.dream-cafe \.dc-stains\s*\{[^}]*radial-gradient\([^)]*transparent[^}]*pointer-events:\s*none/);
    // Beans + steam ship as an inline SVG pattern: no extra network asset.
    expect(css).toMatch(/\.dream-cafe \.dc-beans\s*\{[^}]*url\("data:image\/svg\+xml/);
  });

  it('drifts the bean pattern slowly and stops for reduced motion', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-beans\s*\{[^}]*animation:\s*dc-beans-drift/);
    expect(css).toMatch(/@keyframes dc-beans-drift/);
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.dream-cafe \.dc-beans\s*\{[^}]*animation: none/);
  });
});

describe('dream cafe mode switch fits its labels', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('never clips the Traditional label', () => {
    // Two equal columns sized to the wider label, so the sliding pill
    // still covers 50% while "Traditional" keeps its full text width.
    expect(css).toMatch(/\.dream-cafe \.dc-mode\s*\{[^}]*display:\s*inline-grid/);
    expect(css).toMatch(/\.dream-cafe \.dc-mode\s*\{[^}]*grid-template-columns:\s*repeat\(\s*2,\s*minmax\(\s*max-content,\s*1fr\s*\)\s*\)/);
  });

  it('gives the switch a thumb-sized tap target on phones', () => {
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.dream-cafe \.dc-mode-btn\s*\{[^}]*min-height:\s*44px/);
  });
});

describe('dream cafe traditional printed listing', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/dream-cafe/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('lists each section under a printed heading and honors the tab filter', () => {
    // Sections come from the same tabGroups/cat state the grid uses.
    expect(src).toMatch(/tabGroups[\s\S]{0,80}cat === 'all' \|\| g\.id === cat/);
    expect(src).toMatch(/dc-list-heading/);
  });

  it('prints rows with a thumbnail, dotted leader and price', () => {
    expect(src).toMatch(/dc-list-thumb/);
    expect(src).toMatch(/dc-list-leader/);
    expect(src).toMatch(/dc-list-price/);
    expect(css).toMatch(/\.dc-list-leader\s*\{[^}]*border-bottom:[^}]*dotted/);
    expect(css).toMatch(/\.dc-list-name\s*\{[^}]*--font-serif/);
  });

  it('opens the same center dialog from a listing row', () => {
    expect(src).toMatch(/dc-list-row[\s\S]{0,220}setOpenedId\(item\.id\)/);
  });

  it('keeps rows thumb-sized and shows tray counts', () => {
    expect(css).toMatch(/\.dc-list-row\s*\{[^}]*min-height:\s*44px/);
    expect(src).toMatch(/dc-list-qty/);
  });
});

describe('dream cafe tile 3D pointer tilt', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/dream-cafe/MenuExperience.tsx');
  const css = read('app/globals.css');

  it('leans the hovered tile toward the pointer in perspective', () => {
    expect(src).toMatch(/onPointerMove=/);
    expect(src).toMatch(/onPointerLeave=/);
    expect(src).toMatch(/setProperty\('--ry'/);
    expect(src).toMatch(/setProperty\('--rx'/);
    expect(css).toMatch(/\.dream-cafe \.dc-tile:hover\s*\{[^}]*perspective\([^)]*\)\s*rotateX\(var\(--rx/);
    expect(css).toMatch(/rotateY\(var\(--ry/);
  });

  it('drifts the photo under the caption for depth', () => {
    expect(src).toMatch(/setProperty\('--px'/);
    expect(css).toMatch(/\.dc-tile:hover \.dc-tile-img img\s*\{[^}]*translate3d\(var\(--px/);
  });

  it('only tilts on hover-capable fine pointers', () => {
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)/);
    expect(src).toMatch(/matchMedia\('\(hover: hover\)'\)/);
  });

  it('stays still when the customer asks for reduced motion', () => {
    expect(src).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    // The reduce block already zeroes the tile hover transform.
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*?\.dream-cafe \.dc-tile,?\s*\.dream-cafe \.dc-tile:hover/);
  });
});

describe('dream cafe ambient 3D float', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('breathes every tile with a 3D wobble on all devices', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-square-grid\s*\{[^}]*perspective:\s*\d+px/);
    expect(css).toMatch(/\.dream-cafe \.dc-tile\s*\{[^}]*animation:\s*dc-float/);
  });

  it('animates the individual transform properties so the hover tilt still composes', () => {
    const kf = css.match(/@keyframes dc-float\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
    expect(kf).toContain('translate:');
    expect(kf).toContain('rotate:');
    // transform inside the keyframes would override the pointer-tilt hover rule.
    expect(kf).not.toContain('transform');
  });

  it('staggers the float so the grid moves like a wave, not in lockstep', () => {
    expect(css).toMatch(/\.dc-tile:nth-child\(4n \+ 2\)\s*\{[^}]*animation-(delay|duration)/);
    expect(css).toMatch(/\.dc-tile:nth-child\(4n \+ 3\)\s*\{[^}]*animation-(delay|duration)/);
    expect(css).toMatch(/\.dc-tile:nth-child\(4n\)\s*\{[^}]*animation-(delay|duration)/);
  });

  it('stops the float for reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]{0,1600}\.dream-cafe \.dc-tile,\s*\.dream-cafe \.dc-tile:hover,[\s\S]{0,160}?animation: none/);
  });

  it('rocks the tiles harder on phones', () => {
    // He reported "cards are not moving" at 375px: the 6px laptop bob reads
    // as still on a small high-density screen, so phones get a bigger swing.
    expect(css).toMatch(/@keyframes dc-float\s*\{[\s\S]*?translate:\s*0 var\(--dc-bob/);
    expect(css).toMatch(/\.dream-cafe \.dc-tile\s*\{[^}]*--dc-bob:\s*-6px/);
    expect(css).toMatch(/@media \(max-width: 639px\)[\s\S]*?\.dream-cafe \.dc-tile\s*\{[^}]*--dc-bob:\s*-1[0-9]px/);
  });
});

describe('dream cafe barrel gallery', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const src = read('components/sites/dream-cafe/MenuExperience.tsx');
  const barrel = read('components/sites/dream-cafe/BarrelGallery.tsx');
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
    expect(src.search(/dc-cat-tabs/)).toBeLessThan(gallery);
  });

  it('stands the cards on a cylinder whose radius comes from the card size', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-stage\s*\{[^}]*--step:\s*calc\(360deg \/ var\(--n/);
    expect(css).toMatch(/--r:\s*calc\(\(var\(--cw\) \+ var\(--gap\)\)/);
    expect(css).toMatch(/2 \* sin\(var\(--step\) \/ 2\)/);
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-slot\s*\{[^}]*transform:\s*rotateY\(var\(--a[^}]*translateZ\(var\(--r\)\)/);
  });

  it('keeps the facing card on the picture plane and views the barrel from above', () => {
    // Push the cylinder back by its own radius before tipping it, or the near
    // arc lands between the camera and the stage and inflates past it.
    expect(css).toMatch(
      /\.dream-cafe \.dc-barrel-ring\s*\{[^}]*transform:\s*rotateX\(var\(--tilt\)\) translateZ\(calc\(var\(--r\) \* -1\)\) rotateY\(var\(--rot/,
    );
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-ring\s*\{[^}]*transform-style:\s*preserve-3d/);
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-stage\s*\{[^}]*perspective:\s*var\(--persp\)/);
    // The far side must not show through the near cards as a mirror.
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-slot\s*\{[^}]*backface-visibility:\s*hidden/);
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-card\s*\{[^}]*backface-visibility:\s*hidden/);
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
    expect(barrel).toMatch(/dc-barrel-dot/);
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
    expect(barrel).toMatch(/dc-barrel-qty/);
    expect(barrel).toMatch(/cart\[item\.id\]/);
    // Sized for the card, not the 480px source.
    expect(barrel).toMatch(/sizes=/);
  });

  it('gives phones a barrel a thumb can drive', () => {
    // Card width rides the viewport, so the barrel scales instead of switching.
    expect(css).toMatch(/--cw:\s*clamp\(196px,\s*60vw,\s*248px\)/);
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-stage\s*\{[^}]*touch-action:\s*pan-y/);
    expect(css).toMatch(/--dot-hit:\s*38px/);
    expect(css).toMatch(/\.dream-cafe \.dc-barrel-nav\s*\{[^}]*width:\s*44px/);
    // Bigger caption type and more stage room below the phone breakpoint.
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.dream-cafe \.dc-barrel-stage\s*\{[^}]*height:\s*calc\(var\(--ch\) \+ 86px\)/,
    );
    expect(css).toMatch(
      /@media \(max-width: 639px\)[\s\S]*?\.dream-cafe \.dc-barrel-name\s*\{[^}]*font-size:\s*16\.5px/,
    );
  });

  it('keeps the shape but stops the movement for reduced motion', () => {
    expect(barrel).toMatch(/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
    expect(barrel).toMatch(/if \(still\(\)\)/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.dream-cafe \.dc-barrel-card,\s*\.dream-cafe \.dc-barrel-card\[data-active='true'\]\s*\{[^}]*translate: none/,
    );
  });
});

describe('dream cafe mobile floating order bar', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const tray = read('components/sites/dream-cafe/OrderTray.tsx');
  const css = read('app/globals.css');

  it('keeps a constant order bar pinned to the bottom on phones', () => {
    // His ask: the order part "should be there" while the menu scrolls.
    expect(tray).toMatch(/dc-tray-bar/);
    expect(tray).toMatch(/aria-expanded=\{open\}/);
    expect(tray).toMatch(/cartCount/);
    expect(css).toMatch(/\.dream-cafe \.dc-tray-bar\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.dream-cafe \.dc-tray-bar\s*\{[^}]*position:\s*fixed/);
  });

  it('opens the full tray as a bottom sheet over a dimmed scrim', () => {
    expect(tray).toMatch(/dc-tray-scrim/);
    expect(tray).toMatch(/data-open=\{open \? 'true' : 'false'\}/);
    expect(css).toMatch(/\.dream-cafe \.dc-tray-panel\s*\{[^}]*transform:\s*translateY\(1\d\d%\)/);
    expect(css).toMatch(/\.dream-cafe \.dc-tray\[data-open='true'\] \.dc-tray-panel\s*\{[^}]*transform:\s*none/);
  });

  it('clears the last menu row from under the bar', () => {
    expect(css).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.dream-cafe \.dc-menu\s*\{[^}]*padding-bottom:\s*(8\d|9\d|1\d\d)px/);
  });
});

describe('dream cafe order tray after the grid redesign', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const tray = read('components/sites/dream-cafe/OrderTray.tsx');
  const css = read('app/globals.css');

  it('hands the tray back to the customer once they add after ordering', () => {
    // The ticket shows only while the tray is empty: a fresh + goes straight
    // back to the line list instead of hiding behind a stale ticket.
    expect(tray).toMatch(/ticket\s*&&\s*lines\.length\s*===\s*0/);
  });

  it('never clips the section that hosts the sticky tray', () => {
    // overflow-hidden on an ancestor silently traps position: sticky —
    // the desktop tray slid off-screen when the menu section had it.
    const src = read('components/sites/dream-cafe/MenuExperience.tsx');
    const menu = src.match(/className="dc-menu[^"]*"/)?.[0] ?? '';
    expect(menu).not.toContain('overflow-hidden');
  });

  it('styles its restart control with a class that still exists', () => {
    expect(tray).not.toMatch(/dc-flip/);
    expect(tray).toMatch(/dc-tray-restart/);
    expect(css).toMatch(/\.dream-cafe \.dc-tray-restart\s*\{/);
  });
});

describe('dream cafe identity', () => {
  it('is named Dream Cafe and carries a sunrise tagline', () => {
    expect(cafe.name).toBe('Dream Cafe');
    expect(cafe.tagline.trim().length).toBeGreaterThan(10);
  });

  // This is a studio build, not a real business: nothing on the page may route
  // a visitor to someone else's phone line, inbox or corner.
  it('holds no real contact details', () => {
    const text = [cafe.email, cafe.address, cafe.story, ...cafe.hours.map((h) => `${h.days} ${h.time}`)].join(' ');
    expect(cafe.email).toMatch(/@dreamcafe\.example$/);
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

describe('dream cafe landing/menu route split', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  it('keeps the landing free of the menu board', () => {
    const landing = read('components/sites/dream-cafe/DreamCafe.tsx');
    expect(landing).not.toMatch(/MenuExperience/);
    expect(landing).toMatch(/<Hero/);
    expect(landing).toMatch(/<Mosaic/);
  });

  it('serves the menu board at /dream-cafe/menu', () => {
    const route = read('app/(sites)/dream-cafe/menu/page.tsx');
    expect(route).toMatch(/CafeMenuPage/);
    const page = read('components/sites/dream-cafe/CafeMenuPage.tsx');
    expect(page).toMatch(/<MenuExperience/);
    expect(page).toMatch(/<Nav/);
    expect(page).toMatch(/<SiteFooter/);
  });

  it('invites customers from the hero into the menu page', () => {
    const hero = read('components/sites/dream-cafe/Hero.tsx');
    expect(hero).toMatch(/href="\/dream-cafe\/menu"/);
    expect(hero).toMatch(/View our menu/);
  });

  it('points the nav Menu link and Order ahead at the menu route', () => {
    const nav = read('components/sites/dream-cafe/Nav.tsx');
    expect(nav).toMatch(/'\/dream-cafe\/menu'/);
    expect(nav).toMatch(/'\/dream-cafe#room'/);
  });
});

describe('dream cafe floating bean field', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('renders individual drifting bean glyphs, hidden from a11y tooling', () => {
    const beans = read('components/sites/dream-cafe/BeansField.tsx');
    expect(beans).toMatch(/aria-hidden/);
    expect(beans).toMatch(/dc-bean\b/);
    // Each bean gets its own loop timing via inline custom properties.
    expect(beans).toMatch(/--dur/);
    expect(beans).toMatch(/--delay/);
  });

  it('animates each bean and stops for reduced motion', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-bean\s*\{[^}]*animation:\s*dc-bean-float/);
    expect(css).toMatch(/@keyframes dc-bean-float/);
    expect(css).toMatch(/\.dream-cafe \.dc-beans-field\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.dream-cafe \.dc-bean\s*\{[^}]*animation: none/,
    );
  });

  it('floats beans on the landing hero and behind the menu board', () => {
    expect(read('components/sites/dream-cafe/Hero.tsx')).toMatch(/<BeansField/);
    expect(read('components/sites/dream-cafe/MenuExperience.tsx')).toMatch(/<BeansField/);
  });
});

describe('dream cafe imagery', () => {
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
    const grid = read('components/sites/dream-cafe/MenuExperience.tsx');
    expect(grid).toMatch(/priority=\{i < 4\}/);
    expect(grid).toMatch(/loading=\{i < 4 \? undefined : 'lazy'\}/);
    expect(read('components/sites/dream-cafe/Hero.tsx')).not.toMatch(/priority/);
  });

  it('keeps the ticker short enough to loop without wrapping', () => {
    expect(tickerPhrases.length).toBeGreaterThanOrEqual(5);
    for (const phrase of tickerPhrases) {
      expect(phrase.length).toBeLessThanOrEqual(34);
      expect(phrase).not.toMatch(/[.!]$/);
    }
  });
});

describe('dream cafe instagram feed', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

  it('ships exactly the three links he rotates, as a one-line-swap data file', async () => {
    const { instaFeed } = await import('@/components/sites/dream-cafe/instaFeed');
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
    const post = read('components/sites/dream-cafe/InstagramPost.tsx');
    expect(post).toMatch(/embed\/captioned/);
    expect(post).toMatch(/\(p\|reel\)/);
    expect(post).toMatch(/addEventListener\('message'/);
    expect(post).toMatch(/rel="noopener noreferrer"/);
    expect(post).toMatch(/target="_blank"/);
  });

  it('sits the feed on the landing between the room and the visit block', () => {
    const landing = read('components/sites/dream-cafe/DreamCafe.tsx');
    expect(landing).toMatch(/<Feed/);
    expect(landing.search(/<Mosaic/)).toBeLessThan(landing.search(/<Feed/));
    expect(landing.search(/<Feed/)).toBeLessThan(landing.search(/<Visit/));
    const feed = read('components/sites/dream-cafe/Feed.tsx');
    expect(feed).toMatch(/id="feed"/);
    expect(feed).toMatch(/InstagramPost/);
  });
});

describe('dream cafe 3d testimonials', () => {
  const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
  const css = read('app/globals.css');

  it('tags every demo voice to a real menu item', async () => {
    const { testimonials } = await import('@/components/sites/dream-cafe/testimonialsData');
    expect(testimonials.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(menuGroups.flatMap((g) => g.items.map((i) => i.id)));
    for (const t of testimonials) {
      expect(ids.has(t.itemId), `${t.name} -> ${t.itemId}`).toBe(true);
      expect(t.quote.length).toBeGreaterThan(30);
      expect(t.quote).not.toMatch(/@|\.com|\+\d{8}/);
    }
  });

  it('serves the voices at /dream-cafe/testimonials', () => {
    const route = read('app/(sites)/dream-cafe/testimonials/page.tsx');
    expect(route).toMatch(/Testimonials/);
    const page = read('components/sites/dream-cafe/Testimonials.tsx');
    expect(page).toMatch(/dc-voices/);
    expect(page).toMatch(/dc-voice\b/);
    expect(page).toMatch(/<Nav/);
    expect(page).toMatch(/<SiteFooter/);
  });

  it('floats the cards in a real 3D field with depth, tilt and an active lift', () => {
    expect(css).toMatch(/\.dream-cafe \.dc-voices\s*\{[^}]*perspective:/);
    expect(css).toMatch(/\.dream-cafe \.dc-voice\s*\{[^}]*translateZ\(var\(--z/);
    expect(css).toMatch(/animation:\s*dc-voice-float/);
    expect(css).toMatch(/@keyframes dc-voice-float/);
    expect(css).toMatch(/\.dream-cafe \.dc-voice\[data-active='true'\]/);
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.dream-cafe \.dc-voice\s*\{[^}]*animation: none/,
    );
  });

  it('wires the nav and the visit block into both new surfaces', () => {
    const nav = read('components/sites/dream-cafe/Nav.tsx');
    expect(nav).toMatch(/'\/dream-cafe#feed'/);
    expect(nav).toMatch(/'\/dream-cafe\/testimonials'/);
    const visit = read('components/sites/dream-cafe/Visit.tsx');
    expect(visit).toMatch(/\/dream-cafe\/testimonials/);
  });
});
