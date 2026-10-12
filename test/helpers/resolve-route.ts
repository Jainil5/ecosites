import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(process.cwd(), 'app');

/** Route groups like `(site)` are erased from the URL, so drop those segments. */
function visibleSegments(dirs: string[]): string[] {
  return dirs.filter((d) => !(d.startsWith('(') && d.endsWith(')')));
}

/** A `[slug]` folder serves any value in that position, so it matches as a wildcard. */
function toPattern(dirs: string[]): (string | null)[] {
  return visibleSegments(dirs).map((dir) =>
    dir.startsWith('[') && dir.endsWith(']') ? null : dir,
  );
}

const patterns: (string | null)[][] = [];

function walk(dirs: string[]): void {
  const abs = path.join(APP_DIR, ...dirs);
  if (!existsSync(abs)) return;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const next = [...dirs, entry.name];
    if (existsSync(path.join(APP_DIR, ...next, 'page.tsx'))) {
      patterns.push(toPattern(next));
    }
    walk(next);
  }
}

walk([]);

function matches(pattern: (string | null)[], segments: string[]): boolean {
  return (
    pattern.length === segments.length &&
    pattern.every((segment, i) => segment === null || segment === segments[i])
  );
}

/** Returns the normalized route, or null when no page.tsx serves it. */
export function resolveRoute(route: string): string | null {
  const normalized = route === '/' ? '/' : route.replace(/\/+$/, '');
  const segments = normalized === '/' ? [] : normalized.slice(1).split('/');
  return patterns.some((pattern) => matches(pattern, segments)) ? normalized : null;
}
