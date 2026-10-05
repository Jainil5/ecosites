'use client';

import { useEffect, useState } from 'react';
import type { OhlcPayload } from './types';

export function useOhlc(symbol: string, tf: string, refreshKey?: number) {
  const [data, setData] = useState<OhlcPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/stocks/ohlc?symbol=${encodeURIComponent(symbol)}&tf=${tf}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: OhlcPayload) => {
        if (cancelled) return;
        setData(json);
        setFailed(!json.ok);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, tf, refreshKey]);

  return { data, loading, failed };
}
