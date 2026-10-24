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
    // font-mono is consumed by 13 screener files; font-sans by Coffee Cups.
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

  it('halves nothing on a phone until a device trace says why', () => {
    // A 390px headless run under software rasterisation measured blur(14px) and
    // blur(7px) inside the same noise band, so the frost stays as designed.
    // If this is revisited, it needs a real device trace, not this rig.
    const phone = css.slice(css.indexOf('.gs-card-hover'), css.indexOf('.gs-nav-row'));
    expect(phone).not.toContain('backdrop-filter');
  });

  it('ships the three background effects behind the reduced-motion gate', () => {
    for (const keyframe of ['@keyframes brand-bg-ripple', '@keyframes brand-bg-wave', '@keyframes brand-bg-orbit']) {
      expect(css, keyframe).toContain(keyframe);
    }
    expect(css).toContain('.brand-bg');
  });
});

describe('pointer and scroll motion', () => {
  const css = read('app/globals.css');
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

  it('ships the lighting, reveal, count and field primitives', () => {
    for (const cls of [
      '.gs-lit {',
      '.gs-lit-drift {',
      ".gs-line:not([data-shown='true']) > span",
      '.gs-count',
      '.gs-scramble {',
      '.brand-bg-horizon',
      '.brand-bg-scan',
    ]) {
      expect(css, cls).toContain(cls);
    }
    for (const keyframe of ['@keyframes brand-bg-horizon', '@keyframes brand-bg-scan']) {
      expect(css, keyframe).toContain(keyframe);
    }
  });

  it('keeps the counted total in the markup, so a waiting stat never reads as zero', () => {
    // 0 is a claim about the business; the hidden-until-counted state is the
    // difference between a number arriving and a number being wrong.
    const src = read('components/brand/CountUp.tsx');
    expect(src).toContain('run ? shown : value');
    expect(src).toContain("data-counted={run ? 'true' : undefined}");
  });

  it('mounts the horizon and scan under the effect layers', () => {
    const src = read('components/brand/BrandBackground.tsx');
    expect(src.indexOf('brand-bg-horizon')).toBeLessThan(src.indexOf('brand-bg-ripple'));
    expect(src.indexOf('brand-bg-scan')).toBeGreaterThan(src.indexOf('brand-bg-orbit'));
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

  it('flies the camera down the mesh as the page descends', () => {
    const field = read('components/brand/MotionField.tsx');
    // Scroll re-seats every row's depth and wraps it back into the band, with a
    // near-edge fade over the seam — otherwise a recycled row pops at the lens.
    expect(field).toContain('scrollState.progress');
    expect(field).toMatch(/const seat = \(u: number\)/);
    expect(field).toContain('seamBand');
    expect(field).toMatch(/ctx\.rotate\(fling \* params\.roll\)/);
    expect(field).toContain('ctx.restore()');
  });
});

describe('landing reel contract', () => {
  const reel = read('components/brand/MotionReel.tsx');
  const kb = 1024;

  it('ships the clip and its poster, inside the landing page weight budget', () => {
    // A background film on shared hosting has to have a number attached to it,
    // or it grows every time someone "just" re-renders it at a higher bitrate.
    const size = (rel: string) => statSync(path.join(process.cwd(), rel)).size;
    expect(size('public/brand/reel.mp4')).toBeLessThan(640 * kb);
    expect(size('public/brand/reel-480.mp4')).toBeLessThan(320 * kb);
    expect(size('public/brand/reel-poster.webp')).toBeLessThan(96 * kb);
    // The phone source has to be the smaller one, or the media query is a lie.
    expect(size('public/brand/reel-480.mp4')).toBeLessThan(size('public/brand/reel.mp4'));
  });

  it('keeps the keyframes and the encoder recipe in the repo', () => {
    for (const frame of ['key-01.webp', 'key-02.webp', 'key-03.webp']) {
      expect(existsSync(path.join(process.cwd(), 'public/brand/frames', frame)), frame).toBe(true);
    }
    const script = read('scripts/brand-reel.sh');
    // xfade back to the first keyframe is what makes the loop seamless.
    expect(script).toContain('xfade');
    expect(script).toContain('reel-480.mp4');
  });

  it('lets the motion preference decide before it downloads anything', () => {
    // Not self-starting anywhere in the file: the moment the element begins on
    // its own, the motion preference below it is a race rather than a gate.
    expect(reel).not.toMatch(/autoplay/i);
    expect(reel).toContain('prefers-reduced-motion');
    expect(reel).toContain('video.play()');
    expect(reel).toContain('preload="metadata"');
    expect(reel).toContain('poster="/brand/reel-poster.webp"');
  });

  it('plays behind the landing page and nowhere else', () => {
    expect(read('components/brand/BrandBackground.tsx')).toMatch(
      /pathname === '\/' \? <MotionReel/
    );
    expect(read('app/(site)/layout.tsx')).not.toContain('MotionReel');
    expect(read('app/globals.css')).toContain('.brand-bg-reel');
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

describe('whatsapp enquiry control', () => {
  const fab = read('components/brand/WhatsAppFab.tsx');
  const css = read('app/globals.css');

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

  it('is a square plane, not a rounded foreign object', () => {
    expect(css).toMatch(/\.gs-wa-plate\s*\{[^}]*background:\s*var\(--gs-plane\)/s);
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
