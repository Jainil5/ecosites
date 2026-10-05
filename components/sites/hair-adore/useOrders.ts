'use client';

import { useCallback, useEffect, useState } from 'react';
import { csvToOrders, demoOrders, type Order } from './orders';

const STORAGE_KEY = 'hairadore.r...v1';

function load(): Order[] {
  if (typeof window === 'undefined') return demoOrders;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoOrders;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : demoOrders;
  } catch {
    return demoOrders;
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      /* storage full or unavailable — demo keeps in-memory state */
    }
  }, [orders]);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const importCsv = useCallback((text: string) => {
    const imported = csvToOrders(text);
    if (!imported.length) throw new Error('No valid order rows found');
    setOrders((prev) => {
      const byId = new Map(prev.map((o) => [o.id, o]));
      for (const o of imported) byId.set(o.id, o);
      return [...byId.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
    });
    return imported.length;
  }, []);

  const resetDemo = useCallback(() => setOrders(demoOrders), []);

  return { orders, addOrder, deleteOrder, importCsv, resetDemo };
}
