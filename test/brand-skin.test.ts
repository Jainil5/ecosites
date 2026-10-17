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

  it('defines the green cut-plane scale', () => {
    for (const [token, hex] of [
      ['canvas', '#E9F0EA'],
      ['paper', '#F4F7F3'],
      ['plane', '#22C55E'],
      ['forest', '#14532D'],
      ['lime', '#BEF264'],
      ['ink', '#0B1410'],
      ['hairline', '#CBD9CD'],
    ] as const) {
      expect(config, token).toContain(hex.toUpperCase());
    }
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
});

describe('brand routes carry no dark-skin classes', () => {
  // Tailwind drops unknown utility classes silently, so a leftover from the
  // old dark shell renders as invisible ink-on-canvas text rather than an
  // error. The list is what the migration replaced, token by token.
  const forbidden = [
    'text-foreground', 'text-subtle', 'bg-deep', 'bg-surface', 'bg-elevated',
    'shadow-card', 'shadow-glow', 'bg-white/[0', 'border-white/', 'glass',
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
