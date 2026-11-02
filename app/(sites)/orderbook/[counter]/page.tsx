// app/(sites)/orderbook/[counter]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrderBook } from '@/components/sites/analytical-register/OrderBook';
import { editionByCounter, editions } from '@/components/sites/analytical-register/editions';

interface CounterPageProps {
  params: Promise<{ counter: string }>;
}

/**
 * Every counter OrderBook runs has its own address — `/orderbook/hair-adore-demo`
 * — so one can be handed to a salon owner, a café or a kitchen without sending
 * them through somebody else's page first.
 */
export function generateStaticParams() {
  return editions.map((e) => ({ counter: e.counter }));
}

function counterDescription(edition: (typeof editions)[number]) {
  const items = edition.menu.filter((m) => m.active).length;
  return `${edition.line} Open on ${edition.brand.name}’s own book: ${items} items on the counter, ${Math.round(
    edition.brand.gstRate * 100,
  )}% GST split on every bill, from ${String(edition.profile.openHour).padStart(2, '0')}:00 — the same register, order history, menu and analytics OrderBook runs everywhere.`;
}

export async function generateMetadata({ params }: CounterPageProps): Promise<Metadata> {
  const edition = editionByCounter((await params).counter);
  if (!edition) return { title: 'OrderBook — counter not found' };
  return {
    title: `${edition.label} — ${edition.brand.name}’s till`,
    description: counterDescription(edition),
  };
}

export default async function CounterPage({ params }: CounterPageProps) {
  const edition = editionByCounter((await params).counter);
  if (!edition) notFound();
  // The address is the counter, so it opens on the till rather than on the
  // introduction — the reader chose this business before they arrived.
  return <OrderBook edition={edition.id} initialView="register" />;
}
