'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChartPoint } from './types';

type QuoteMap = Record<string, ChartPoint>;

const CHUNK_SIZE = 8;
const CHUNK_STAGGER_MS = 250;
const REFRESH_MS = 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchChunks(symbols: string[], range: '1y' | '2d'): Promise<QuoteMap> {
  const out: QuoteMap = {};
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
    chunks.push(symbols.slice(i, i + CHUNK_SIZE));
  }
  await Promise.all(
    chunks.map(async (chunk, idx) => {
      await sleep(idx * CHUNK_STAGGER_MS);
      try {
        const res = await fetch(
          `/api/stocks/chart?symbols=${encodeURIComponent(chunk.join(','))}&range=${range}`,
        );
        if (!res.ok) return;
        const json = await res.json();
        for (const point of (json.results ?? []) as ChartPoint[]) {
          out[point.symbol] = point;
        }
      } catch {
        // chunk failed; its symbols stay absent from the map
      }
    }),
  );
  return out;
}

export function useStocks(symbols: string[]) {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const hasData = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!hasData.current) setLoading(true);
      const next = await fetchChunks(symbols, '1y');
      if (cancelled) return;
      const okCount = Object.values(next).filter((p) => p.ok).length;
      if (okCount > 0) {
        hasData.current = true;
        setUpdatedAt(Date.now());
        setFailed(false);
      } else if (!hasData.current) {
        setFailed(true);
      }
      setQuotes((prev) => ({ ...prev, ...next }));
      setLoading(false);
    };

    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, REFRESH_MS);
    const onVisible = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [symbols]);

  return { quotes, loading, failed, updatedAt };
}
