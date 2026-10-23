import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { products } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';
import { dev, model, modes, product } from '@/components/sites/namesake/data';
import { resolveRoute } from './helpers/resolve-route';

const read = (rel: string) => readFileSync(path.join(process.cwd(), rel), 'utf8');
// The repo has no .gitattributes, so a Windows checkout hands back CRLF and any
// multi-line match below would miss. Normalise instead of encoding newlines.
const css = read('app/globals.css').replace(/\r\n/g, '\n');
const shell = read('components/sites/namesake/Namesake.tsx');

describe('namesake product wiring', () => {
  const portfolio = products.find((p) => p.slug === 'digital-portfolio');
  const site = websites.find((w) => w.slug === 'namesake');

  it('sells the product off the running demonstration', () => {
    expect(portfolio?.demoPath).toBe('/namesake');
    expect(resolveRoute('/namesake'), '/namesake').not.toBeNull();
  });

  it('registers the same build in the work gallery', () => {
    expect(site?.path).toBe('/namesake');
    expect(site?.screenshot).toBe('/showcase/namesake/preview.png');
    expect(site?.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('namesake sample people', () => {
  it('gives each book its own domain and one section to live in', () => {
    expect(model.person.domain).toBe('rheaverma.com');
    expect(dev.person.domain).toBe('kabirnanda.com');
    expect(modes.map((m) => m.section)).toEqual(['modelling', 'developer']);
    expect(modes.map((m) => m.key)).toEqual(['model', 'dev']);
  });

  it('fills the book: four plates, a comp card, and availability', () => {
    expect(model.campaigns).toHaveLength(4);
    expect(new Set(model.campaigns.map((c) => c.brand)).size).toBe(4);
    expect(new Set(model.campaigns.map((c) => c.plate)).size).toBe(4);
    expect(model.book.length).toBeGreaterThanOrEqual(5);
    expect(model.available.length).toBeGreaterThanOrEqual(4);
    expect(model.credits.length).toBeGreaterThanOrEqual(6);
  });

  it('fills the CV: four shipped systems with a number that moved', () => {
    expect(dev.projects).toHaveLength(4);
    for (const project of dev.projects) {
      expect(project.metric.trim().length, project.name).toBeGreaterThan(0);
      expect(project.stack.length, project.name).toBeGreaterThanOrEqual(3);
      expect(project.summary.split('.').filter(Boolean).length, project.name).toBeGreaterThan(1);
    }
    expect(dev.stack.length).toBeGreaterThanOrEqual(8);
    expect(dev.log.length).toBeGreaterThanOrEqual(4);
  });

  it('counts up from numbers that are not zero', () => {
    for (const stats of [model.stats, dev.stats]) {
      expect(stats).toHaveLength(4);
      for (const stat of stats) {
        expect(stat.value, stat.label).toBeGreaterThan(0);
        expect(stat.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  // The page is a studio build: nothing on it may route a visitor to a real
  // phone line, and the name checker must not invent a registry price.
  it('holds no real contact details and no invented prices', () => {
    const text = JSON.stringify({ product, modes, model, dev });
    expect(text).not.toMatch(/\+?\d[\d\s-]{8,}\d/);
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toMatch(/₹|Rs\.?|per month|\/mo\b/);
    expect(shell).not.toMatch(/₹|wa\.me|tel:/);
  });
});

describe('namesake themes', () => {
  it('drives the hero, name checker and enquiry block off the switched mode', () => {
    expect(shell).toMatch(/className="nk" data-mode=\{mode\}/);
    expect(shell).toMatch(/aria-pressed=\{mode === item\.key\}/);
    expect(css).toMatch(/\.nk\[data-mode='dev'\]\s*\{[^}]*--nk-canvas: #0B1220/);
  });

  it('keeps each section on its own declared palette', () => {
    // Both bands re-declare the same token names, so the editorial book stays
    // light and the engineering CV stays dark whichever mode is switched on.
    expect(css).toMatch(/\.nk-book\s*\{[^}]*--nk-canvas: #F4EEE3/);
    expect(css).toMatch(/\.nk-dev\s*\{[^}]*--nk-canvas: #0B1220/);
    expect(css).toMatch(/\.nk-book\s*\{[^}]*color-scheme: light/);
    expect(css).toMatch(/\.nk-dev\s*\{[^}]*color-scheme: dark/);
  });

  it('paints the pointer sheen from the demo token, not the brand green', () => {
    expect(css).toMatch(/\.nk-lit\s*\{[^}]*var\(--gx, 50%\) var\(--gy, -300%\)/);
    expect(css).toMatch(/\.nk-lit\s*\{[^}]*var\(--nk-glow\)/);
    expect(shell).toMatch(/<CursorLit selector=".nk-lit"/);
  });

  it('stacks the CV cards under each other as the reviewer scrolls', () => {
    expect(css).toMatch(/\.nk-project\s*\{[^}]*position: sticky/);
    expect(css).toMatch(/top: calc\(4\.8rem \+ var\(--i, 0\) \* 1\.15rem\)/);
    // An overflow container would strand the sticky stack, so the root clips.
    expect(css).toMatch(/\.nk\s*\{[^}]*overflow-x: clip/);
  });
});

describe('namesake motion', () => {
  const gated = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference) {\n  .nk-ticker-track'));

  it('runs the ticker, sweeps and parallax only when motion is welcome', () => {
    for (const cls of [
      '.nk-ticker-track',
      '.nk-scan',
      '.nk-horizon-grid',
      '.nk-dot',
      '.nk-plate-scan',
      '.nk-plate {',
      '.nk-project {',
    ]) {
      expect(gated, cls).toContain(`  ${cls}`);
    }
  });

  it('defines every keyframe the block reaches for', () => {
    for (const name of ['nk-ticker', 'nk-scan', 'nk-horizon', 'nk-pulse', 'nk-rise', 'nk-sweep']) {
      expect(css, name).toContain(`@keyframes ${name}`);
    }
  });

  it('parks the sweeps instead of leaving a band across the plate', () => {
    expect(css).toMatch(
      /prefers-reduced-motion: reduce[\s\S]*?\.nk-scan,\s*\.nk-plate-scan \{ opacity: 0; \}/,
    );
  });
});
