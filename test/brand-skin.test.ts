import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');

describe('brand skin tokens', () => {
  const config = read('tailwind.config.ts');

  it('defines the light canvas scale', () => {
    for (const [token, hex] of [
      ['canvas', '#FFFFFF'],
      ['paper', '#FDF8F4'],
      ['band', '#FAF3E8'],
      ['tint', '#FFF3EB'],
      ['ink', '#0D0B08'],
      ['hairline', '#EAE0D6'],
      ['accent', '#FE6200'],
    ] as const) {
      expect(config, token).toContain(hex.toUpperCase());
    }
  });

  it('maps display to the serif and adds label + body keys', () => {
    expect(config).toContain('--font-display');
    expect(config).toContain('--font-label');
    expect(config).toContain('--font-body');
  });

  it('leaves the demo-owned font keys alone', () => {
    // font-mono is consumed by 13 screener files; font-sans by Dream Cafe.
    expect(config).toMatch(/mono:\s*\['var\(--font-mono\)'/);
    expect(config).toMatch(/sans:\s*\['var\(--font-sans\)'/);
  });
});

describe('brand skin fonts', () => {
  const layout = read('app/layout.tsx');

  it('loads the three brand faces as variables', () => {
    expect(layout).toContain('Source_Serif_4');
    expect(layout).toContain('Fustat');
    expect(layout).toContain('Geist_Mono');
    expect(layout).toContain('--font-label');
    expect(layout).toContain('--font-body');
  });

  it('drops Share_Tech_Mono but keeps Fira_Code for the demos', () => {
    expect(layout).not.toContain('Share_Tech_Mono');
    expect(layout).toContain('Fira_Code');
    expect(layout).toContain('Inter');
  });
});

describe('wi-* primitives', () => {
  const css = read('app/globals.css');

  it('defines the button, label and display primitives', () => {
    for (const cls of ['wi-btn', 'wi-btn-solid', 'wi-btn-ghost', 'wi-label', 'wi-display']) {
      expect(css, cls).toContain(`.${cls}`);
    }
  });

  it('uses square corners on the button, like freehand', () => {
    expect(css).toMatch(/\.wi-btn\s*\{[^}]*border-radius:\s*0/);
  });

  it('sets headlines to serif weight 300', () => {
    expect(css).toMatch(/\.wi-display\s*\{[^}]*font-weight:\s*300/);
    expect(css).toMatch(/\.wi-display\s*\{[^}]*line-height:\s*1\.2/);
  });

  it('puts every entrance and loop behind prefers-reduced-motion', () => {
    const start = css.indexOf('.wi-band-rise');
    const block = css.slice(css.lastIndexOf('@media', start), start);
    expect(block).toContain('prefers-reduced-motion: no-preference');
  });
});
