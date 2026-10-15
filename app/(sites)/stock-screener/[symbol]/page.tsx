import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { STOCKS, stockBySlug, symbolToSlug } from '@/components/sites/stock-screener/data';
import { StockPage } from '@/components/sites/stock-screener/StockPage';

export function generateStaticParams() {
  return STOCKS.map((s) => ({ symbol: symbolToSlug(s.symbol) }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const meta = stockBySlug(symbol);
  if (!meta) return { title: 'Stock not found — Market Pulse' };
  return {
    title: `${meta.name} — Market Pulse`,
    description: `Live ${meta.name} (${meta.symbol.replace('.NS', '')}) price, chart, fundamentals, news and sector peers on the Market Pulse NSE screener.`,
  };
}

export default async function StockRoute({ params }: Props) {
  const { symbol } = await params;
  const meta = stockBySlug(symbol);
  if (!meta) notFound();
  return <StockPage meta={meta} />;
}
