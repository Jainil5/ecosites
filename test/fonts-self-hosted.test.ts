import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The deploy host builds behind a proxy that rewrites the font URLs inside the
 * CSS Google Fonts returns. next/font/google reads a file extension off the end
 * of one of those URLs, gets `null` back, and takes the whole build down with
 * `Cannot read properties of null (reading '1')` — a failure that cannot be
 * reproduced from a laptop, because a laptop reaches Google Fonts fine.
 *
 * So the faces are checked in. These tests are the reason that stays true.
 */
const layout = readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8');

/** Every `./fonts/*.woff2` the layout declares, as written. */
const referenced = [...layout.matchAll(/'\.\/fonts\/([^']+\.woff2)'/g)].map((m) => m[1]);

/** Every face file sitting in the folder. */
const onDisk = readdirSync(path.join(process.cwd(), 'app/fonts'));

describe('self-hosted fonts', () => {
  it('asks no question of Google Fonts at build time', () => {
    // Matched as an import, not as a string: the layout explains out loud in a
    // comment what the networked loader used to do to the deploy build.
    expect(layout).not.toMatch(/from\s+['"]next\/font\/google['"]/);
    expect(layout).toContain("from 'next/font/local'");
    // The google-only options; their absence is what proves the loader is not
    // the networked one.
    expect(layout).not.toContain('subsets:');
  });

  it('references at least one file per font variable the skin reads', () => {
    for (const variable of [
      '--font-display',
      '--font-label',
      '--font-mono',
      '--font-sans',
      '--font-serif',
      '--font-display-serif',
      '--font-rj-display',
    ]) {
      expect(layout, `${variable} is undeclared`).toContain(`variable: '${variable}'`);
    }
    expect(referenced.length).toBe(7);
  });

  it('ships every face it names, and ships it as a real woff2', () => {
    for (const file of referenced) {
      const abs = path.join(process.cwd(), 'app/fonts', file);
      expect(existsSync(abs), `app/layout.tsx names app/fonts/${file}, which is not in the repo`).toBe(true);
      const bytes = readFileSync(abs);
      expect(bytes.subarray(0, 4).toString('ascii'), file).toBe('wOF2');
      // A variable face is only worth checking in if it is still variable; a
      // single-cut file would silently fake every weight but one.
      expect(bytes.length, `${file} looks too small to be a variable face`).toBeGreaterThan(15_000);
    }
  });

  it('leaves no face orphaned in the folder', () => {
    for (const file of onDisk) {
      expect(referenced, `app/fonts/${file} is loaded by nothing`).toContain(file);
    }
  });

  it('measures the serif faces against a serif before swapping', () => {
    // next/font/local defaults its metric overrides to Arial. Playfair,
    // Fraunces and the Garamond are nowhere near Arial's proportions, so the
    // fallback would sit too small and the headline would jump on swap.
    for (const variable of ['--font-serif', '--font-display-serif', '--font-rj-display']) {
      const at = layout.indexOf(`variable: '${variable}'`);
      expect(at, `${variable} is undeclared`).toBeGreaterThan(-1);
      const block = layout.slice(layout.lastIndexOf('localFont({', at), layout.indexOf('});', at));
      expect(block, variable).toContain("adjustFontFallback: 'Times New Roman'");
    }
  });
});
