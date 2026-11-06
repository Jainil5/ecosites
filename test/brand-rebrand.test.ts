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
    expect(company.tagline).toBe('Technology for Every Business.');
    expect(company.badge).toBe('Web, Software & AI');
    expect(company.contact.whatsappMessage).toContain('Website & Intelligence');
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
