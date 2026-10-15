'use client';

import { useEffect, useRef, useState } from 'react';

export interface LiveTick {
  price: number;
  /** Direction versus the previous poll, for the ping dot. */
  dir: 'up' | 'down' | 'flat';
}

const TICK_MS = 10_000;

// NSE regular session: Mon–Fri 09:15–15:30 IST.
export function isNSEOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  if (get('weekday') === 'Sat' || get('weekday') === 'Sun') return false;
  const mins = Number(get('hour')) * 60 + Number(get('minute'));
  return mins >= 9 * 60 + 15 && mins < 15 * 60 + 30;
}

export function useLiveTicks(symbols: string[]) {
  const [ticks, setTicks] = useState<Record<string, LiveTick>>({});
  const [live, setLive] = useState(false);
  const [lastTickAt, setLastTickAt] = useState<number | null>(null);
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const poll = async () => {
      const open = isNSEOpen();
      setLive(open);
      if (!open || document.hidden || inFlight) return;
      inFlight = true;
      try {
        const res = await fetch(`/api/stocks/tick?symbols=${encodeURIComponent(symbols.join(','))}`);
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const next: Record<string, LiveTick> = {};
        for (const p of (json.results ?? []) as { symbol: string; price: number }[]) {
          const before = prevPrices.current[p.symbol];
          next[p.symbol] = {
            price: p.price,
            dir: before == null || p.price === before ? 'flat' : p.price > before ? 'up' : 'down',
          };
          prevPrices.current[p.symbol] = p.price;
        }
        if (Object.keys(next).length) {
          setTicks(next);
          setLastTickAt(Date.now());
        }
      } catch {
        // next tick retries
      } finally {
        inFlight = false;
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), TICK_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [symbols]);

  return { ticks, live, lastTickAt };
}
