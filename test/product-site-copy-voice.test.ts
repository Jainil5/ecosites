// test/product-site-copy-voice.test.ts
//
// The brand voice is that these are systems running, not previews of what we
// might build. Source comments may still say "demo" for the developers reading
// them, and links may point at the /demos path — the rule is about the words a
// visitor actually reads, so the scan takes the copy lines and skips the notes.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (rel: string) =>
  readFileSync(path.join(process.cwd(), rel), 'utf8').replace(/\r\n/g, '\n');

/**
 * Words that tell a reader "this is not the real thing". `placeholder` and
 * `trial` stay off the list — one is an input's empty state, the other is a
 * salon offer; neither hedges about the build.
 */
const HEDGE = /\bdemos?\b|\bdemonstration\w*\b|\bsamples?\b|studio build|mock\w*\b/i;

const FILES = [
  'components/sites/namesake/Namesake.tsx',
  'components/sites/namesake/data.ts',
  'components/sites/ember-larder/CartDrawer.tsx',
  'components/sites/ember-larder/SiteFooter.tsx',
  'components/sites/ember-larder/data.ts',
  'components/sites/coffee-cups/Testimonials.tsx',
  'components/sites/coffee-cups/testimonialsData.ts',
  'components/sites/hair-adore/Register.tsx',
  'components/sites/hair-adore/orders.ts',
  'components/sites/hair-adore/useOrders.ts',
  'components/sites/analytical-register/Overview.tsx',
  'components/sites/analytical-register/overview-data.ts',
  'components/sites/analytical-register/menu-data.ts',
  'components/sites/savour/Savour.tsx',
  'components/sites/coffee-cups/cafe.ts',
];

/** A line a visitor could read: not a comment, not a route, not an identifier. */
const copyLine = (line: string) => {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('*/')) return false;
  // Links and imports carry the word inside a path or an identifier, never as prose.
  if (/href=|from '|import |path:|slug:|\bkey=/.test(t)) return false;
  return true;
};

describe('the copy a visitor reads', () => {
  it('never announces itself as a preview', () => {
    for (const rel of FILES) {
      const lines = read(rel).split('\n');
      lines.forEach((line, i) => {
        if (!copyLine(line)) return;
        expect(`${rel}:${i + 1}  ${line.trim()}`, line).not.toMatch(HEDGE);
      });
    }
  });

  it('says what the invented businesses are, in plain words', () => {
    // Honest framing replaces the hedge: our own houses, built for the product.
    const namesake = read('components/sites/namesake/data.ts');
    expect(namesake).toMatch(/Built for the product/);
    const footer = read('components/sites/ember-larder/SiteFooter.tsx');
    expect(footer).toMatch(/our own house/i);
    const voices = read('components/sites/coffee-cups/Testimonials.tsx');
    expect(voices).toMatch(/Voices we wrote for the room/);
  });
});
