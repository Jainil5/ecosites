'use client';

import { useEffect, useState } from 'react';
import type { Scorecard } from './analytics';

export interface MarketPayload {
  ok: boolean;
  asOf: number;
  cards: Scorecard[];
}

const REFRESH_MS = 60_000;

/** The derived market read used by Trends and Analysis: one cached sweep a minute. */
export function useMarket() {
  const [data, setData] = useState<MarketPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/stocks/market');
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as MarketPayload;
        if (cancelled) return;
        setData(json);
        setFailed(!json.ok);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
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
  }, []);

  return { data, loading, failed };
}
