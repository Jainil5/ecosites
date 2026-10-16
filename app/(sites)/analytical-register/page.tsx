// app/(sites)/analytical-register/page.tsx
import type { Metadata } from 'next';
import { OrderBook } from '@/components/sites/analytical-register/OrderBook';

export const metadata: Metadata = {
  title: 'OrderBook — Order Register & Business Analytics',
  description:
    'A point-of-sale register for any café or shop: take orders, build GST bills, send them on WhatsApp, and watch your revenue, top items and trends update live.',
};

export default function OrderBookPage() {
  return <OrderBook />;
}
