import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { QUERY, mapOverpassToPlace, type OverpassElement } from '../components/sites/savour/osm';
import type { PlaceRow } from '../components/sites/savour/types';

const ENDPOINT = 'https://overpass-api.de/api/interpreter';
const CITY = process.argv[2] ?? 'Pune';
const OUT_DIR = path.join(import.meta.dirname, 'out');

/** Prefer venues with identity: hours, phone and website beat a bare name. */
function richness(p: PlaceRow): number {
  return (
    (p.hours ? 4 : 0) + (p.phone ? 2 : 0) + (p.website ? 2 : 0) + (p.cuisines.length ? 2 : 0) + (p.address ? 1 : 0)
  );
}

async function main() {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Without this header Overpass answers HTTP 406. Measured 2026-10-04.
      Accept: 'application/json',
      'User-Agent': 'savour-portfolio-demo/1.0',
    },
    body: new URLSearchParams({ data: QUERY(CITY) }).toString(),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { elements: OverpassElement[] };

  const seen = new Map<string, PlaceRow>();
  for (const el of json.elements) {
    const p = mapOverpassToPlace(el);
    if (p && !seen.has(p.slug)) seen.set(p.slug, p);
  }

  const rows = [...seen.values()].sort(
    (a, b) => richness(b) - richness(a) || a.name.localeCompare(b.name),
  );
  await mkdir(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `${CITY.toLowerCase()}-places.json`);
  await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  console.log(`${rows.length} venues -> ${file}`);
  console.log(
    `with hours: ${rows.filter((r) => r.hours).length}, with cuisine: ${rows.filter((r) => r.cuisines.length).length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
