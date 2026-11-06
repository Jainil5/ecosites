import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

/** Every .tsx under a directory, recursively. */
function walk(rel: string): string[] {
  const abs = path.join(process.cwd(), rel);
  return readdirSync(abs).flatMap((name) => {
    const p = path.join(abs, name);
    if (statSync(p).isDirectory()) return walk(path.join(rel, name));
    return name.endsWith('.tsx') ? [p] : [];
  });
}

const css = read('app/globals.css');

/** One rule's text, from its selector to the next selector at the same depth. */
function rule(selector: string, until: string): string {
  const from = css.indexOf(selector);
  expect(from, `${selector} is not in the skin`).toBeGreaterThan(-1);
  const to = css.indexOf(until, from);
  expect(to, `${selector} has no end marker ${until}`).toBeGreaterThan(from);
  return css.slice(from, to);
}

/** The number a scroll-momentum multiplier is allowed to reach. */
function amplitude(pattern: RegExp, label: string): number {
  const match = css.match(pattern);
  expect(match, label).not.toBeNull();
  return Number.parseFloat(match![1]);
}

describe('brand skin tokens', () => {
  const config = read('tailwind.config.ts');

  it('defines the graphite-and-bone scale', () => {
    for (const [token, hex] of [
      ['canvas', '#0A0B0B'],
      ['paper', '#FFFFFF08'],
      ['plane', '#1C5E42'],
      ['forest', '#3F8F68'],
      ['lime', '#A9C6A8'],
      ['ink', '#E9E6DF'],
      ['ink-2', '#A6ACA5'],
      ['ink-3', '#757B74'],
      ['hairline', '#FFFFFF14'],
      ['plane-deep', '#101A15'],
      ['plane-ink', '#0A0B0B'],
    ] as const) {
      expect(config, token).toContain(hex);
    }
  });

  it('keeps the interactive accent inside the brand green', () => {
    // One green for the mark and one for the UI, or the logo and the buttons
    // disagree about which colour the company is.
    expect(config).toMatch(/DEFAULT:\s*'#1C5E42'/);
    expect(config).toMatch(/soft:\s*'#3F8F68'/);
    expect(config).not.toMatch(/'#22C55E'|'#BEF264'|'#4ADE80'/);
  });

  it('uses the accent as a material, never as a fill on a control', () => {
    // The neon skin filled every button, chip and corner badge with the
    // accent. Deep emerald under bone type is the same gesture at studio
    // weight, so the loudest thing on a row is the row's title.
    const solid = rule('.gs-btn-solid {', '.gs-btn-solid:hover');
    expect(solid).toContain('background: var(--gs-ink)');
    expect(solid).toContain('color: var(--gs-canvas)');
    expect(solid).not.toContain('var(--gs-plane)');
    expect(rule('.gs-icon {', '.gs-icon-sm')).toContain('background: transparent');
  });

  it('maps display to the poster grotesque and keeps a mono label key', () => {
    expect(config).toContain('--font-display');
    expect(config).toContain('--font-label');
    expect(config).toMatch(/display:\s*\['var\(--font-display\)'/);
  });

  it('leaves the demo-owned font keys alone', () => {
    // font-mono is consumed by 13 screener files; font-sans by Brewery Cafe.
    expect(config).toMatch(/mono:\s*\['var\(--font-mono\)'/);
    expect(config).toMatch(/sans:\s*\['var\(--font-sans\)'/);
  });

  it('still defines every shadow and accent shade components reference', () => {
    // Tailwind drops unknown utility classes silently instead of failing the
    // build, so a deleted token breaks styling without ever erroring.
    for (const shadow of ['plate', 'glow', 'glow-lg', 'card', 'card-hover']) {
      expect(config, `shadow-${shadow}`).toMatch(new RegExp(`${shadow}'?\\s*:`));
    }
    for (const shade of ['soft', 'dark']) {
      expect(config, `accent.${shade}`).toContain(`${shade}:`);
    }
  });

  it('keeps the bloom dark, not luminous', () => {
    // The same shadow keys used to throw a 20px green halo; callers still
    // compile, the light just no longer leaks out of the panel.
    expect(config).toMatch(/glow: '0 0 24px rgba\(28,94,66,0\.2\d\)/);
    expect(css).not.toMatch(/box-shadow:[^;]*rgba\(34,\s*197,\s*94/);
  });
});

describe('brand skin fonts', () => {
  const layout = read('app/layout.tsx');

  it('loads Archivo as the display face and Geist Mono as the label face', () => {
    expect(layout).toContain('Archivo');
    expect(layout).toContain('--font-display');
    expect(layout).toContain('Geist_Mono');
    expect(layout).toContain('--font-label');
  });

  it('drops the freehand serif experiment', () => {
    expect(layout).not.toContain('Source_Serif_4');
    expect(layout).not.toContain('Fustat');
    expect(layout).not.toContain('Share_Tech_Mono');
  });

  it('keeps every font the demo sites depend on', () => {
    expect(layout).toContain('Fira_Code');
    expect(layout).toContain('Inter');
    expect(layout).toContain('Playfair_Display');
    expect(layout).toContain('Fraunces');
  });

  it('never requests a weight or style the face does not ship', () => {
    // next/font throws at build time for a missing axis. Fustat had no italic;
    // Archivo ships 100-900 roman and italic.
    const archivo = layout.slice(layout.indexOf('Archivo({'), layout.indexOf("variable: '--font-display'"));
    for (const w of (archivo.match(/'(\d{3})'/g) || []).map((s) => s.replace(/'/g, ''))) {
      expect(['100', '200', '300', '400', '500', '600', '700', '800', '900'], `Archivo ${w}`).toContain(w);
    }
  });

  it('sets buttons and text links in the display face, not the terminal one', () => {
    // Mono on every control was the other half of the "developer dashboard"
    // read. Labels stay mono — they are annotations — but a call to action is
    // type, and type comes from the face the headlines use.
    expect(rule('.gs-btn {', '.gs-btn-solid')).toContain('var(--font-display)');
    expect(rule('.gs-link {', '.gs-link:hover')).toContain('var(--font-display)');
  });
});

describe('brand skin primitives', () => {
  it('keeps the gs-* block inside @layer components', () => {
    // Unlayered rules beat @layer utilities regardless of source order, so a
    // loose .gs-label would silently win over every text-* class written on it.
    const open = css.indexOf('@layer components {\n  :root {\n    --gs-canvas');
    expect(open).toBeGreaterThan(-1);
    for (const cls of ['.gs-label {', '.gs-display {', '.gs-card {', '.gs-btn {']) {
      expect(css.indexOf(cls), cls).toBeGreaterThan(open);
    }
    const close = css.indexOf('\n}\n', open);
    expect(close).toBeGreaterThan(-1);
  });

  it('frosts the card surface so panels read as glass', () => {
    const card = css.slice(css.indexOf('.gs-card {'));
    expect(card.slice(0, 400)).toContain('backdrop-filter');
  });

  it('halves nothing on a phone until a device trace says why', () => {
    // A 390px headless run under software rasterisation measured blur(14px) and
    // blur(7px) inside the same noise band, so the frost stays as designed.
    // If this is revisited, it needs a real device trace, not this rig.
    expect(rule('.gs-card-hover:hover {', '\n\n  /* The header box is taller')).not.toContain(
      'backdrop-filter',
    );
  });

  it('gives the nav its own body so copy cannot read through it', () => {
    // The bar used to be a card, and a card is 3.5% white: every headline that
    // scrolled under it stayed legible through the chrome, which reads as a
    // layering bug rather than depth. The strip above it — the header's own
    // top padding — had nothing in it at all.
    const bar = rule('.gs-bar {', '\n\n  /* Menu rows');
    expect(bar).toMatch(/rgb\(10 11 11 \/ 0\.8\d\)/);
    expect(bar).toContain('backdrop-filter: blur(18px) saturate(1.15)');
    const shell = rule('.gs-shell::before {', '.gs-bar');
    expect(shell).toMatch(/rgb\(10 11 11 \/ 0\.9\d\) 0%/);
    expect(shell).toContain('pointer-events: none');
    const nav = read('components/Navbar.tsx');
    expect(nav).toContain('gs-bar flex');
    expect(nav).toContain('gs-shell sticky');
    expect(nav).not.toContain('gs-card flex');
  });

  it('declares no filter graph anywhere in the skin', () => {
    // The gooey metaball cluster behind the hero compiler needed an SVG
    // filter, a defs component mounted once per route, and it explained
    // nothing. Nothing in the brand skin borrows a filter by id now.
    expect(css).not.toMatch(/url\(#/);
    expect(css).not.toContain('feColorMatrix');
    expect(existsSync('components/brand/GooDefs.tsx'), 'GooDefs.tsx is back').toBe(false);
  });
});

describe('the field is still', () => {
  // These five files were the moving background: a canvas mesh, a film loop,
  // the goo defs, the object the two shared, and the looping client wall.
  // Their absence is the contract — the depth moved into the planes, the
  // reveals and the shadows, where it reads as craft instead of a screensaver.
  const deleted = [
    'components/brand/MotionField.tsx',
    'components/brand/MotionReel.tsx',
    'components/brand/GooDefs.tsx',
    'components/brand/scroll-state.ts',
    'components/brand/ClientMarquee.tsx',
  ];

  it('has no looping background components left to mount', () => {
    for (const file of deleted) {
      expect(existsSync(file), file).toBe(false);
    }
    const layout = read('app/(site)/layout.tsx');
    expect(layout).toContain('<BrandBackground');
    expect(layout).not.toMatch(/GooDefs|MotionReel|MotionField/);
  });

  it('ships no keyframe for the old field', () => {
    for (const dead of [
      '@keyframes brand-bg-ripple',
      '@keyframes brand-bg-wave',
      '@keyframes brand-bg-orbit',
      '@keyframes brand-bg-horizon',
      '@keyframes brand-bg-scan',
      '@keyframes gs-marquee-run',
      '@keyframes gs-blob-drift',
      '.brand-bg-motion',
      '.brand-bg-scan',
      '.brand-bg-reel',
      '.gs-marquee',
      '.gs-blob',
    ]) {
      expect(css, dead).not.toContain(dead);
    }
  });

  it('lays one still field: wash, horizon, grain', () => {
    const src = read('components/brand/BrandBackground.tsx');
    // A server component: nothing here can animate, and nothing is hydrated.
    expect(src).not.toContain("'use client'");
    expect(src).not.toMatch(/<canvas|\.mp4|useState|useEffect/);
    for (const layer of ['brand-bg-wash', 'brand-bg-horizon', 'brand-bg-grain']) {
      expect(src, layer).toContain(layer);
    }
    expect(src.indexOf('brand-bg-wash')).toBeLessThan(src.indexOf('brand-bg-horizon'));
    expect(src.indexOf('brand-bg-horizon')).toBeLessThan(src.indexOf('brand-bg-grain'));

    const field = rule('.brand-bg {', '.brand-bg-wash');
    expect(field).toContain('position: fixed');
    expect(field).not.toContain('animation');
    expect(css).toMatch(/\.brand-bg-horizon::before\s*\{[^}]*rotateX\(64deg\)/s);
  });

  it('replaced the looping client wall with one that can be read', () => {
    const grid = read('components/brand/ClientGrid.tsx');
    expect(grid).not.toMatch(/gs-marquee|setInterval|requestAnimationFrame/);
    expect(grid).toContain('websites');
    expect(read('app/(site)/page.tsx')).toMatch(/<ClientGrid \/>/);
  });

  it('keeps the film budget out of the page it is not used on', () => {
    // No brand component loads a video; the encoder recipe and the clips stay
    // in the repo as material, unmounted.
    for (const file of walk('components/brand')) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('<video');
    }
    expect(existsSync('scripts/brand-reel.sh'), 'the reel recipe went with the reel').toBe(true);
  });
});

describe('pointer and scroll motion', () => {
  const motionSources = [
    'components/brand/CursorLit.tsx',
    'components/brand/LineReveal.tsx',
    'components/brand/CountUp.tsx',
    'components/brand/GlyphScramble.tsx',
  ];

  it('asks every motion hook what the visitor prefers', () => {
    for (const file of motionSources) {
      expect(read(file), file).toContain('prefers-reduced-motion: reduce');
    }
  });

  it('ships the lighting, reveal, count and scramble primitives', () => {
    for (const cls of [
      '.gs-lit {',
      '.gs-lit-drift {',
      ".gs-line:not([data-shown='true']) > span",
      '.gs-count',
      '.gs-scramble {',
      '.brand-bg-horizon',
      '.brand-bg-grain',
    ]) {
      expect(css, cls).toContain(cls);
    }
  });

  it('keeps the counted total in the markup, so a waiting stat never reads as zero', () => {
    // 0 is a claim about the business; the hidden-until-counted state is the
    // difference between a number arriving and a number being wrong.
    const src = read('components/brand/CountUp.tsx');
    expect(src).toContain('run ? shown : value');
    expect(src).toContain("data-counted={run ? 'true' : undefined}");
  });

  it('keeps the cursor light and the drift under a third of their old reach', () => {
    // Both are good ideas that were turned up too far: a 17% green wash and a
    // 6px lift made the pointer the subject of the page.
    expect(css).toMatch(/rgb\(28 94 66 \/ 0\.1\d\),\n      transparent 62%/);
    expect(rule('.gs-lit-drift {', '\n\n  /* Word-by-word')).toMatch(/\* 3px\)/);
  });
});

describe('scroll motion contract', () => {
  const driver = read('components/brand/ScrollMotion.tsx');

  it('runs Lenis with its own rAF and tears it down on unmount', () => {
    expect(driver).toContain('new Lenis(');
    expect(driver).toContain('autoRaf: true');
    expect(driver).toContain('anchors: true');
    expect(driver).toContain('respectReducedMotion: true');
    expect(driver).toContain('lenis.destroy()');
  });

  it('publishes one momentum set for every effect to read', () => {
    for (const token of ['--scroll-v', '--scroll-p', '--hero-rec']) expect(css).toContain(token);
    expect(driver).toContain("'--scroll-v'");
  });

  it('leaves the numbers in the cascade, with no JS-side copy to drift', () => {
    // scroll-state.ts existed only so a canvas could read what CSS already
    // carries. One publication path, one source of truth.
    expect(driver).not.toMatch(/scrollState|scroll-state/);
  });

  it('hands anchor easing to Lenis instead of double-easing it', () => {
    expect(css).toMatch(/html\.lenis[^}]*scroll-behavior:\s*auto/s);
  });

  it('is mounted by the brand layout only, and its css comes from there', () => {
    const layout = read('app/(site)/layout.tsx');
    expect(layout).toContain('<ScrollMotion');
    expect(layout).toContain("import 'lenis/dist/lenis.css'");
  });

  it('keeps every scroll-driven transform out of the reduced-motion path', () => {
    // Lenis pins velocity at zero itself; the CSS has to say the same thing,
    // or a reduced-motion visitor still gets the hero receding.
    expect(css).toMatch(/prefers-reduced-motion: no-preference\)[\s\S]*--hero-rec[\s\S]*--scroll-v/);
    expect(driver).toContain('lenis.prefersReducedMotion');
  });

  it('keeps the fling inside a designed amplitude', () => {
    // A multiplier an unbounded velocity could push past its ceiling is how a
    // page ends up swinging. --scroll-v is clamped to -1..1, so these numbers
    // are the reach in pixels and degrees, and they are studio-scale now.
    expect(amplitude(/--scroll-v, 0\) \* ([\d.]+)px\)/, 'plane depth')).toBeLessThanOrEqual(12);
    expect(amplitude(/--scroll-v, 0\) \* ([\d.]+)deg\)\)/, 'plane tilt')).toBeLessThanOrEqual(1);
    expect(amplitude(/rotateX\(calc\(var\(--scroll-v, 0\) \* -([\d.]+)deg\)/, 'display tip')).toBeLessThanOrEqual(3);
    expect(amplitude(/\.gs-display\s*\{[\s\S]*?translate3d\(0, calc\(var\(--scroll-v, 0\) \* ([\d.]+)px\)/, 'display drag')).toBeLessThanOrEqual(6);
  });

  it('dives bands in and tips them away on their own view timelines', () => {
    // Two animations, two comma-separated timelines and ranges. A single
    // `animation-range` would silently unpair them and kill the exit.
    expect(css).toMatch(/\.gs-reveal\s*\{[^}]*animation:\s*gs-dive both linear,\s*gs-away both linear/s);
    expect(css).toMatch(/\.gs-reveal\s*\{[^}]*animation-timeline:\s*view\(\),\s*view\(\)/s);
    expect(css).toMatch(/\.gs-reveal\s*\{[^}]*animation-range:[^;]*exit/s);
  });

  it('keeps perspective on both ends of every 3D keyframe', () => {
    // A transform list that gains or loses perspective() mid-flight interpolates
    // by matrix decomposition, which flattens the tilt instead of rotating it.
    for (const name of ['gs-dive', 'gs-away', 'gs-fan-in']) {
      const block = css.match(new RegExp(`@keyframes ${name}\\s*\\{([\\s\\S]*?)\\n  \\}`));
      expect(block, name).not.toBeNull();
      const steps = block![1].split(/\b(?:from|to|\d+%)\s*\{/).slice(1);
      expect(steps.length).toBeGreaterThanOrEqual(2);
      for (const step of steps) expect(step).toContain('perspective(');
    }
  });

  it('fans the landing page registers across their cells', () => {
    expect(css).toMatch(/\.gs-fan\s*>\s*\*\s*\{[^}]*animation-timeline:\s*view\(\)/s);
    expect(css).toMatch(/\.gs-fan\s*>\s*:nth-child\(3n - 1\)/);
    for (const file of [
      'components/brand/ServicesGrid.tsx',
      'components/brand/ProcessBand.tsx',
      'components/brand/WorkStrip.tsx',
      'components/brand/WhyUs.tsx',
    ]) {
      expect(read(file), file).toContain('gs-fan');
    }
  });

  it('keeps the hero planes behind the type and off the reader', () => {
    // Every plane sits at negative Z, so the caps are always the top layer.
    const hero = read('components/brand/Hero.tsx');
    expect(hero).not.toMatch(/GooCluster|OfferBadge/);
    for (const pz of hero.match(/pz=\{(-?\d+)\}/g) ?? []) {
      expect(Number.parseInt(pz.match(/-?\d+/)![0], 10)).toBeLessThan(0);
    }
    expect(hero).toMatch(/<OfferNote \/>/);
  });

  it('puts the whole manifesto behind the type, not beside it', () => {
    // The planes are the hero's depth, and depth only reads when it sits
    // behind something. Under lg they are switched off: on a phone there is
    // no pointer to parallax and a tinted rectangle crossing body copy is
    // just a smudge.
    const hero = read('components/brand/Hero.tsx');
    const planes = hero.match(/className="gs-plane-[ab][^"]*"/g) ?? [];
    expect(planes.length).toBeGreaterThanOrEqual(2);
    for (const plane of planes) expect(plane).toContain('hidden lg:block');
  });

  it('sizes the hero headline from its measure so each phrase holds one line', () => {
    // "TECHNOLOGY FOR" is 9.36em of Archivo 800 at this tracking. The stage is
    // the viewport less the 48px page gutter, so the size has to be that width
    // divided by the measure — a picked number wraps the phrase after its
    // first word, and four stacked words is a mistake, not a statement.
    expect(css).toMatch(
      /\.gs-hero-title\s*\{[^}]*font-size:\s*clamp\([^;]*calc\(\(100vw - 48px\)[^;]*\)\s*;\s*\}/s,
    );
    // The ceiling is 6rem: past max-w-7xl the container stops growing.
    expect(css).toMatch(/\.gs-hero-title\s*\{[^}]*,\s*6rem\)/s);
    expect(css).toMatch(/\.gs-hero-line\s*\{[^}]*white-space:\s*nowrap/s);
    const hero = read('components/brand/Hero.tsx');
    expect(hero).toMatch(/<h1 className="gs-display gs-hero-title/);
    expect((hero.match(/gs-hero-line block/g) ?? []).length).toBe(2);
  });
});

describe('floating menu panels are read off, not through', () => {
  it('gives a menu its own material rather than reusing a card', () => {
    // A card lets the field read through it. A menu is copy someone has to
    // pick off, so it needs a body: the brand's deep forest, a hard frost, and
    // a shadow that puts it above the page.
    const menu = rule('.gs-menu {', '.gs-menu .gs-nav-row:hover');
    expect(menu).toMatch(/rgb\(20 34 28 \/ 0\.9\d\)/);
    expect(menu).toMatch(/backdrop-filter: blur\(2\dpx\)/);
    expect(menu).toContain('-webkit-backdrop-filter');
    expect(menu).toMatch(/box-shadow:\s*\n?\s*0 28px/);
  });

  it('dresses every floating panel in it', () => {
    // Three panels drop out of the chrome: the desktop mega-menu, the mobile
    // sheet, the command palette. One left on card glass reads as a bug.
    for (const [file, count] of [
      ['components/Navbar.tsx', 2],
      ['components/brand/QuickSearch.tsx', 1],
    ] as const) {
      const src = read(file);
      expect(src, `${file} still drops a card`).not.toContain('gs-drop gs-card');
      expect(src.match(/gs-drop gs-menu/g), file).toHaveLength(count);
    }
  });

  it('keeps a picked row visible against the new body', () => {
    // 14% white lights up a panel that is itself a colour; 10% is enough.
    expect(rule('.gs-menu .gs-nav-row:hover,', '.gs-rule {')).toMatch(
      /background: rgb\(255 255 255 \/ 0\.1\)/,
    );
  });
});

describe('whatsapp enquiry control', () => {
  const fab = read('components/brand/WhatsAppFab.tsx');

  it('rides the brand routes only', () => {
    expect(read('app/(site)/layout.tsx')).toContain('<WhatsAppFab');
    for (const file of walk('app/(sites)')) {
      expect(file, `${file} inherits the brand control`).not.toContain('WhatsAppFab');
    }
  });

  it('opens the chat with the question already written', () => {
    expect(fab).toContain('whatsappHrefMessage');
    expect(fab).toMatch(/pricing/);
    expect(fab).toContain('target="_blank"');
    expect(fab).toContain('rel="noopener noreferrer"');
  });

  it('stands down rather than sitting on a link', () => {
    // It floats over scrolling content, so it samples its own footprint.
    expect(fab).toContain('elementsFromPoint');
    expect(fab).toMatch(/closest\('a,button/);
    expect(fab).toMatch(/data-tucked=\{tucked/);
    // One frame of work per scroll, and both listeners come back off.
    expect(fab).toContain('requestAnimationFrame(check)');
    expect(fab).toContain("removeEventListener('scroll', onMove)");
    // Invisible is not enough: it must stop taking clicks and tab stops.
    expect(css).toMatch(/\.gs-wa\[data-tucked='true'\][^}]*pointer-events:\s*none/s);
    expect(fab).toMatch(/tabIndex=\{tucked \? -1 : undefined\}/);
  });

  it('is a square plate of the page material, not a green bubble', () => {
    // A bright round bubble in the corner is the most templated element on the
    // web. Square, bone-filled, hairline edge: the same object, in this skin.
    expect(css).toMatch(/\.gs-wa-plate\s*\{[^}]*background:\s*var\(--gs-ink\)/s);
    expect(css).toMatch(/\.gs-wa-plate\s*\{[^}]*color:\s*var\(--gs-canvas\)/s);
    expect(css).not.toMatch(/\.gs-wa[^-a-z][^}]*border-radius/s);
  });

  it('gates its movement on the motion preference', () => {
    const wa = css.slice(
      css.indexOf('/* Floating WhatsApp enquiry'),
      css.indexOf('Brand background field'),
    );
    const gate = wa.indexOf('prefers-reduced-motion: no-preference');
    expect(gate).toBeGreaterThan(-1);
    // Nothing that moves is declared before the gate, so a reduced-motion
    // visitor still gets the whole control — hidden tag, tucked state and all.
    expect(wa.slice(0, gate)).not.toContain('transition');
    expect(wa.slice(gate)).toContain('transform: translate3d(0.4rem, 0, 0)');
  });

  it('uses the mark itself, wherever whatsapp is offered', () => {
    for (const file of [
      'components/Footer.tsx',
      'components/brand/ContactCta.tsx',
      'components/brand/WhatsAppFab.tsx',
    ]) {
      expect(read(file), file).toContain('WhatsAppGlyph');
    }
    expect(read('components/brand/WhatsAppGlyph.tsx')).toContain('viewBox="0 0 24 24"');
  });
});

describe('brand routes carry no leftovers from either old skin', () => {
  // Two migrations live here. The dark skin flipped token semantics, so text
  // that sat on paper now sits on the field; the premium pass darkened the
  // accent, so `text-plane` — bright green ink on a graphite page — became a
  // contrast failure rather than a style. Both break legibility without
  // ever erroring, which is why they are checked by name.
  const forbidden = [
    'text-plane',
    'bg-plane/',
    'border-plane',
    'focus:bg-ink',
    '!border-canvas',
    '!text-canvas',
    'beacon',
    'go-cta',
    'go-label',
    'go-stat-value',
    'go-compile',
  ];
  const files = [
    ...walk('app/(site)'),
    ...walk('components/brand'),
    'components/Navbar.tsx',
    'components/Footer.tsx',
    'components/SectionHeading.tsx',
    'components/WebsiteCard.tsx',
    'components/DemoCard.tsx',
    'components/ProjectCover.tsx',
  ];

  it.each(files)('%s is migrated', (file) => {
    const src = readFileSync(file, 'utf8');
    for (const token of forbidden) {
      expect(src, `${file} still uses ${token}`).not.toContain(token);
    }
    // Staying token-driven is what made this re-skin a config edit; a stray
    // arbitrary value would pin one component to one skin forever.
    expect(src, `${file} hardcodes a colour`).not.toMatch(/(?:bg|text|border)-\[#/);
  });
});

describe('the previous skins stay deleted', () => {
  // Each of these was the shell once. Leaving them in the tree invites a
  // component to reach back for them, so their absence is the contract.
  it('has no leftover skin components', () => {
    for (const file of [
      'components/GridBackground.tsx',
      'components/brand/Logo3D.tsx',
      'components/brand/SiteFrame.tsx',
    ]) {
      expect(existsSync(file), file).toBe(false);
    }
  });

  it('has no dead skin blocks in globals.css', () => {
    for (const dead of ['.go-cta', '.go-logo-scene', '.beacon', '.field-drift', '.gs-goo']) {
      expect(css, dead).not.toContain(dead);
    }
  });
});
