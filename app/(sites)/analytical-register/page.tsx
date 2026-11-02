// app/(sites)/analytical-register/page.tsx
import type { Metadata } from 'next';
import { OrderBook } from '@/components/sites/analytical-register/OrderBook';

export const metadata: Metadata = {
  title: 'OrderBook — Order Management for Cafés and Restaurants',
  description:
    'The ordering, billing, kitchen and reporting system we build around a counter, introduced end to end — then a working register to try: take orders, build GST bills, send them on WhatsApp, and watch revenue, top items and trends update live on sample data.',
};

export default function OrderBookPage() {
  return <OrderBook />;
}
