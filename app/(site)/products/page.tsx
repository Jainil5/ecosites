import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { ProductsGrid } from '@/components/brand/ProductsGrid';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Working demonstrations of the systems we build to order: an order register with business analytics built in, a market screener wired to live NSE quotes, a team workspace with an AI assistant, and a portfolio that lives on your own name.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <PageHeader index="04" label="products" title="See what we build, running.">
        These are demonstrations: systems we built, running on sample data, so you
        can click through the flow before we build the one for your business. What
        you get is the same shape with your items, your taxes and your branding.
      </PageHeader>
      <ProductsGrid showHeading={false} />
    </div>
  );
}
