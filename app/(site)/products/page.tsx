import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { ProductsGrid } from '@/components/brand/ProductsGrid';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Three apps you can run yourself: OrderBook with the Smart Analytical Register built in, Market Pulse — a live NSE screener, and TeamSync — an AI-powered team communication platform.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <PageHeader index="04" label="products" title="Apps you can run tomorrow.">
        Not proposals on a slide — software that is already built, already used,
        and yours to run. Each one has a price you approve first and a working
        build you can see before you buy.
      </PageHeader>
      <ProductsGrid showHeading={false} />
    </div>
  );
}
