import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(process.cwd(), 'app');

/** Route groups like `(site)` are erased from the URL, so drop those segments. */
function visibleSegments(dirs: string[]): string[] {
  return dirs.filter((d) => !(d.startsWith('(') && d.endsWith(')')));
}

const routes = new Set<string>();

function walk(dirs: string[]): void {
  const abs = path.join(APP_DIR, ...dirs);
  if (!existsSync(abs)) return;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const next = [...dirs, entry.name];
    if (existsSync(path.join(APP_DIR, ...next, 'page.tsx'))) {
      routes.add(`/${visibleSegments(next).join('/')}`);
    }
    walk(next);
  }
}

walk([]);

/** Returns the normalized route, or null when no page.tsx serves it. */
export function resolveRoute(route: string): string | null {
  const normalized = route === '/' ? '/' : route.replace(/\/+$/, '');
  return routes.has(normalized) ? normalized : null;
}
