'use client';

import { useEffect, useState } from 'react';
import type { NewsPayload } from './types';

function useNewsFeed(url: string | null) {
  const [data, setData] = useState<NewsPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: NewsPayload) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, failed };
}

export function useMarketNews() {
  return useNewsFeed('/api/stocks/news');
}

export function useStockNews(symbol: string, name: string) {
  const url = `/api/stocks/news?symbol=${encodeURIComponent(symbol)}&name=${encodeURIComponent(name)}`;
  return useNewsFeed(url);
}
