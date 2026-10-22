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

describe('brand skin tokens', () => {
  const config = read('tailwind.config.ts');

  it('defines the dark-glass scale', () => {
    for (const [token, hex] of [
      ['canvas', '#0C0D0C'],
      ['paper', '#FFFFFF0D'],
      ['plane', '#22C55E'],
      ['forest', '#4ADE80'],
      ['lime', '#BEF264'],
      ['ink', '#F2F5F2'],
      ['ink-2', '#B6C2B8'],
      ['ink-3', '#7E8F82'],
      ['hairline', '#FFFFFF1F'],
      ['plane-deep', '#0E2417'],
      ['plane-ink', '#071209'],
    ] as const) {
      expect(config, token).toContain(hex.toUpperCase());
    }
  });

  it('separates text-on-plane from text-on-field', () => {
    // ink is light now, so anything sitting on a filled green plane needs the
    // near-black plane-ink instead; without the token, brand components would
    // hardcode the hex one per button.
    expect(config).toMatch(/'plane-ink':/);
    const css = read('app/globals.css');
    expect(css).toContain('--gs-plane-ink');
    const solid = css.slice(css.indexOf('.gs-btn-solid {'), css.indexOf('.gs-btn-solid:hover'));
    expect(solid).toContain('var(--gs-plane-ink)');
  });

  it('keeps the interactive accent green so the mark and the UI agree', () => {
    expect(config).toMatch(/DEFAULT:\s*'#22C55E'/);
  });

  it('maps display to the poster grotesque and keeps a mono label key', () => {
    expect(config).toContain('--font-display');
    expect(config).toContain('--font-label');
    expect(config).toMatch(/display:\s*\['var\(--font-display\)'/);
  });

  it('leaves the demo-owned font keys alone', () => {
    // font-mono is consumed by 13 screener files; font-sans by Dream Cafe.
    expect(config).toMatch(/mono:\s*\['var\(--font-mono\)'/);
    expect(config).toMatch(/sans:\s*\['var\(--font-sans\)'/);
  });

  it('still defines every shadow and accent shade components reference', () => {
    // Tailwind drops unknown utility classes silently instead of failing the
    // build, so a deleted token breaks styling without ever erroring. This
    // guard is the only thing that catches it during the migration window.
    for (const shadow of ['plate', 'glow', 'glow-lg', 'card', 'card-hover']) {
      // Hyphenated keys are quoted in the config, so allow an optional quote
      // before the colon.
      expect(config, `shadow-${shadow}`).toMatch(new RegExp(`${shadow}'?\\s*:`));
    }
    for (const shade of ['soft', 'dark']) {
      expect(config, `accent.${shade}`).toContain(`${shade}:`);
    }
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
    const archivo = layout.slice(layout.indexOf('Archivo({'), layout.indexOf('variable: \'--font-display\''));
    for (const w of (archivo.match(/'(\d{3})'/g) || []).map((s) => s.replace(/'/g, ''))) {
      expect(['100', '200', '300', '400', '500', '600', '700', '800', '900'], `Archivo ${w}`).toContain(w);
    }
  });
});

describe('brand skin primitives', () => {
  const css = read('app/globals.css');

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

  it('declares the goo filter once and never wraps text in it', () => {
    expect(read('components/brand/GooDefs.tsx')).toContain('id="gs-goo"');
    expect(css).toContain('filter: url(#gs-goo)');
    // Every entrance and loop sits behind a no-preference query.
    expect(css).toContain('@media (prefers-reduced-motion: no-preference)');
  });

  it('frosts the card surface so panels read as glass', () => {
    // The backdrop blur is what makes the animated field visible *through*
    // the cards; without it the skin is just a dark theme.
    const card = css.slice(css.indexOf('.gs-card {'));
    expect(card.slice(0, 400)).toContain('backdrop-filter');
  });

  it('ships the three background effects behind the reduced-motion gate', () => {
    for (const keyframe of ['@keyframes brand-bg-ripple', '@keyframes brand-bg-wave', '@keyframes brand-bg-orbit']) {
      expect(css, keyframe).toContain(keyframe);
    }
    expect(css).toContain('.brand-bg');
  });
});

describe('background effect component contract', () => {
  const src = read('components/brand/BrandBackground.tsx');

  it('offers exactly the ripple, wave, and orbit effects', () => {
    expect(src).toContain("'ripple'");
    expect(src).toContain("'wave'");
    expect(src).toContain("'orbit'");
    expect(src).not.toContain("'drift'");
  });

  it('is mounted by the brand layout', () => {
    expect(read('app/(site)/layout.tsx')).toContain('BrandBackground');
  });
});

describe('motion field contract', () => {
  const src = read('components/brand/MotionField.tsx');

  it('gates its loop on the visitor motion preference', () => {
    expect(src).toContain('prefers-reduced-motion');
    // Reduced motion still paints one composed still, never an empty field.
    expect(src).toContain('draw(0)');
  });

  it('stops painting when the tab is hidden and when it unmounts', () => {
    expect(src).toContain('visibilitychange');
    expect(src).toContain('cancelAnimationFrame');
  });

  it('is mounted by the background and styled by the skin', () => {
    expect(read('components/brand/BrandBackground.tsx')).toContain('<MotionField');
    expect(read('app/globals.css')).toContain('.brand-bg-motion');
  });
});

describe('scroll motion contract', () => {
  const driver = read('components/brand/ScrollMotion.tsx');
  const css = read('app/globals.css');

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

  it('surges the background field with the same momentum', () => {
    expect(read('components/brand/MotionField.tsx')).toContain('scrollState.velocity');
    expect(read('components/brand/scroll-state.ts')).toContain('velocity');
  });
});

describe('brand routes carry no light-skin leftovers', () => {
  // The dark skin flipped token semantics: text that sat on paper now sits
  // on the glass field. These are the classes the migration replaced, and a
  // leftover renders as invisible ink-on-ink text rather than an error.
  // (bg-ink is legitimate now: ink is light, so it fills light chips/badges.)
  const forbidden = [
    'text-forest', 'focus:bg-ink', '!border-canvas', '!text-canvas',
    'beacon', 'go-cta', 'go-label', 'go-stat-value', 'go-compile',
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
    const css = read('app/globals.css');
    for (const dead of ['.go-cta', '.go-logo-scene', '.beacon', '.field-drift']) {
      expect(css, dead).not.toContain(dead);
    }
  });
});
