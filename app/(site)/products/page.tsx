import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { ProductsGrid } from '@/components/brand/ProductsGrid';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Two apps you can run yourself: Order Book with the Smart Analytical Register built in, and Market Pulse — a custom screener with live NSE quotes, charts and news.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <PageHeader index="04" label="products" title="Apps you can run tomorrow.">
        Not proposals on a slide — software that is already built, already used,
        and yours to run. Each one has a price you approve first and a live demo
        you can break yourself.
      </PageHeader>
      <ProductsGrid showHeading={false} />
    </div>
  );
}
