import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { company } from '@/content/brand/company';

// Rendered sources: everything a visitor can see. Docs live outside these dirs.
const SOURCES = ['content', 'components', 'app'];

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(tsx?|css)$/.test(full)) yield full;
  }
}

describe('Website & Intelligence rename', () => {
  it('carries the new brand fields', () => {
    expect(company.name).toBe('Website & Intelligence');
    expect(company.tagline).toBe('Any Idea, Online.');
    expect(company.badge).toBe('AI-First Web & Tech Team');
    expect(company.contact.whatsappMessage).toContain('Website & Intelligence');
  });

  // The positioning is the claim, so it is checked as a claim: an AI-first
  // agency has to say AI-first somewhere a crawler reads it, and it has to say
  // who it is for — any size of business, not one kind of shop.
  it('states the AI-first positioning in the registry', () => {
    expect(company.badge.toLowerCase()).toContain('ai-first');
    expect(company.pitch.toLowerCase()).toContain('ai-first');
    for (const layer of ['mobile application', 'agent', 'automation', 'backend']) {
      expect(company.pitch.toLowerCase(), layer).toContain(layer);
    }
  });

  // The poster headline is the tagline, typeset in two phrases. It used to be
  // retyped in the hero, which is how a tagline change left the old one on the
  // opening screen. One split, one guard.
  it('sets the hero headline from the tagline', () => {
    const hero = readFileSync('components/brand/Hero.tsx', 'utf8');
    const phrases = [...hero.matchAll(/<GlyphScramble text="([^"]+)"/g)].map((m) => m[1]);
    expect(phrases).toHaveLength(2);
    expect(`${phrases[0]} ${phrases[1]}.`).toBe(company.tagline);
  });

  it('leaves no trace of the old name in rendered sources', () => {
    // Case-sensitive on purpose: 'Website IN' and 'WebsiteIN' are the old
    // wordmark forms; 'Website & Intelligence' cannot match either. The middle
    // alternative catches the split JSX wordmark (`Website<span>IN</span>`).
    const oldName = /Website IN(?![a-z])|WebsiteIN(?!telligence)|Website\s*(<[^>]*>\s*)?IN(?![a-z])/;
    for (const dir of SOURCES) {
      if (!existsSync(dir)) continue;
      for (const file of files(dir)) {
        expect(readFileSync(file, 'utf8'), file).not.toMatch(oldName);
      }
    }
  });

  it('takes the wordmark from the registry instead of retyping it', () => {
    // The name was written out in both the bar and the footer. The bar's copy
    // lost the "&" and nothing noticed, because the registry itself was right.
    // So one component reads company.name, and no file may retype the answer.
    const wordmark = readFileSync('components/brand/Wordmark.tsx', 'utf8');
    expect(wordmark).toContain('company.name');
    for (const file of [
      'components/brand/Wordmark.tsx',
      'components/Navbar.tsx',
      'components/Footer.tsx',
    ]) {
      const src = readFileSync(file, 'utf8');
      expect(src, `${file} retypes the brand name`).not.toContain(company.name);
      if (file !== 'components/brand/Wordmark.tsx') {
        expect(src, `${file} renders the lockup by hand`).toContain('<Wordmark />');
      }
    }
  });
});
