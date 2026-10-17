'use client';

import { MarketShell } from '@/components/sites/stock-screener/MarketShell';

export default function MarketPulseLayout({ children }: { children: React.ReactNode }) {
  return <MarketShell>{children}</MarketShell>;
}
