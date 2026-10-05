import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export interface NewsItem {
  title: string;
  source: string;
  link: string;
  publishedAt: string; // ISO
  category: string;
  important: boolean;
}

const RSS_BASE = 'https://news.google.com/rss/search';
const TTL_MS = 30 * 60 * 1000;
const MAX_AGE_DAYS = 7;
const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

interface CacheEntry {
  at: number;
  payload: { mode: 'keyword' | 'llm'; brief: string | null; items: NewsItem[] };
}
const cache = new Map<string, CacheEntry>();

const parser = new XMLParser({ ignoreAttributes: false });

const KEYWORD_RULES: [RegExp, string][] = [
  [/result|q\d|earnings|profit|loss|margin/i, 'Results'],
  [/dividend|ex-?date|bonus/i, 'Dividend'],
  [/buyback/i, 'Buyback'],
  [/board meeting|record date/i, 'Board'],
  [/\border|contract|win[s]? |bag(?:ged|s)? /i, 'Orders'],
  [/rating|upgrade|downgrade|target price|broker|analyst/i, 'Analyst'],
  [/acqui|merger|stake|deal\b|ipo/i, 'M&A'],
  [/expansion|invest|capex|plant|factor/i, 'Expansion'],
];

function classifyKeyword(title: string): string {
  for (const [re, cat] of KEYWORD_RULES) if (re.test(title)) return cat;
  return 'News';
}

interface RawItem {
  title: string;
  link: string;
  publishedAt: string;
  source: string;
}

function parseRss(xml: string, maxAgeDays = MAX_AGE_DAYS): RawItem[] {
  const doc = parser.parse(xml);
  const raw = doc?.rss?.channel?.item;
  const list: unknown[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const out: RawItem[] = [];
  for (const entry of list) {
    const it = entry as Record<string, unknown>;
    const title = typeof it.title === 'string' ? it.title : '';
    const link = typeof it.link === 'string' ? it.link : '';
    const pubDate = typeof it.pubDate === 'string' ? it.pubDate : '';
    const source = typeof it.source === 'string' ? it.source : '';
    const ts = Date.parse(pubDate);
    if (!title || !link || Number.isNaN(ts)) continue;
    if (Date.now() - ts > maxAgeDays * 86400_000) continue;
    // Google prefixes titles with " - Source"; prefer that over <source> when present.
    const dashIdx = title.lastIndexOf(' - ');
    const cleanTitle = dashIdx > 20 ? title.slice(0, dashIdx).trim() : title.trim();
    const cleanSource = dashIdx > 20 ? title.slice(dashIdx + 3).trim() : source || safeHost(link);
    out.push({ title: cleanTitle, link, publishedAt: new Date(ts).toISOString(), source: cleanSource });
  }
  return out;
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'News';
  }
}

async function fetchRss(query: string, maxAgeDays = MAX_AGE_DAYS): Promise<RawItem[]> {
  const url = `${RSS_BASE}?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/rss+xml, application/xml' },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return [];
  return parseRss(await res.text(), maxAgeDays);
}

function dedupe(items: RawItem[]): RawItem[] {
  const seen = new Set<string>();
  const out: RawItem[] = [];
  for (const it of items) {
    const key = it.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

// NVIDIA NIM (OpenAI-compatible). Adds a market brief + sharper categories.
// Any failure returns null so the caller falls back to keyword mode.
async function nimEnrich(
  context: string,
  items: RawItem[],
): Promise<{ brief: string; categories: { category: string; important: boolean }[] } | null> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key || items.length === 0) return null;
  try {
    const res = await fetch(NIM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: process.env.NIM_MODEL || 'meta/llama-3.3-70b-instruct',
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content:
              'You are an Indian equity markets analyst. You only describe what the given headlines say; you never invent facts. Respond with STRICT JSON only.',
          },
          {
            role: 'user',
            content:
              `Stock/market context: ${context}\n` +
              'Headlines (JSON array with index, title, source, time):\n' +
              JSON.stringify(items.map((it, i) => ({ i, t: it.title, s: it.source, d: it.publishedAt }))) +
              '\n\nReturn JSON: {"brief": "2-3 sentence summary of the most important developments for this stock/market right now", ' +
              '"categories": [{"i": index, "category": one of Results|Dividend|Buyback|Orders|Analyst|M&A|Expansion|Regulatory|News, "important": true if materially relevant to the stock}]}.',
          },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.brief !== 'string') return null;
    const cats = new Map<number, { category: string; important: boolean }>();
    for (const c of parsed.categories ?? []) {
      if (Number.isInteger(c?.i)) cats.set(c.i, { category: String(c.category || 'News'), important: !!c.important });
    }
    return { brief: parsed.brief, categories: items.map((_, i) => cats.get(i) ?? { category: 'News', important: false }) };
  } catch {
    return null;
  }
}

function buildPayload(
  context: string,
  raw: RawItem[],
  cap: number,
  nim: Awaited<ReturnType<typeof nimEnrich>>,
): CacheEntry['payload'] & { items: NewsItem[] } {
  const items: NewsItem[] = raw.slice(0, cap).map((it, i) => ({
    title: it.title,
    source: it.source,
    link: it.link,
    publishedAt: it.publishedAt,
    category: nim ? nim.categories[i]?.category ?? 'News' : classifyKeyword(it.title),
    important: nim ? nim.categories[i]?.important ?? false : true,
  }));
  return { mode: nim ? 'llm' : 'keyword', brief: nim ? nim.brief : null, items };
}

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const symbol = (params.get('symbol') ?? '').trim().toUpperCase();
  const name = (params.get('name') ?? '').trim();

  if (symbol && !/^[A-Z0-9.&-]{1,16}$/.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol.' }, { status: 400 });
  }

  const cacheKey = symbol || 'market';
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.payload, { headers: { 'Cache-Control': 'public, s-maxage=1800' } });
  }

  const ticker = symbol.replace('.NS', '');
  const context = symbol ? `${name || ticker} (${ticker} NSE)` : 'Indian stock market (Nifty/Sensex)';
  const query = symbol
    ? `"${name || ticker}" ${ticker} share stock India NSE`
    : 'Nifty OR Sensex OR "Indian stocks" share market';

  let raw = dedupe(await fetchRss(query));
  // Quiet stocks can have nothing inside 7 days; retry a broader query over 14.
  if (raw.length === 0) {
    const fallback = symbol
      ? `"${name || ticker}" ${ticker} share stock India NSE when:14d`
      : 'Nifty OR Sensex OR "Indian stocks" share market when:14d';
    raw = dedupe(await fetchRss(fallback, 14));
  }
  const nim = await nimEnrich(context, raw);
  const payload = buildPayload(context, raw, symbol ? 8 : 30, nim);

  cache.set(cacheKey, { at: Date.now(), payload });
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, s-maxage=1800' } });
}
