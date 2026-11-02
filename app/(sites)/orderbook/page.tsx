// app/(sites)/orderbook/page.tsx
import type { Metadata } from 'next';
import { OrderBook } from '@/components/sites/analytical-register/OrderBook';

export const metadata: Metadata = {
  title: 'OrderBook — Order Management for Cafés, Salons and Kitchens',
  description:
    'The ordering, billing and reporting system we build around a counter, running here on three of them: a café till, a salon book and a live-fire kitchen with a pantry shelf. Take an order, build the GST bill, send it on WhatsApp — and watch revenue, top items and trends move with it.',
};

export default function OrderBookPage() {
  return <OrderBook />;
}
