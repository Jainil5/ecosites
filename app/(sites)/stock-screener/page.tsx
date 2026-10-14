import type { Metadata } from 'next';
import { StockScreener } from '@/components/sites/stock-screener/StockScreener';

export const metadata: Metadata = {
  title: 'Market Pulse — NSE Stock Screener',
  description:
    'A live NSE stock screener with real-time prices from Yahoo Finance, trends, sparklines, 52-week ranges, fundamentals, and technical indicators.',
};

export default function StockScreenerDemoPage() {
  return <StockScreener />;
}
