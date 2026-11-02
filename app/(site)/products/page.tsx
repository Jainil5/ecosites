import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { ProductsGrid } from '@/components/brand/ProductsGrid';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'The systems we build to order: an order register with business analytics built in, a market screener wired to live NSE quotes, a team workspace with an AI assistant, and a portfolio that lives on your own name.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <PageHeader index="04" label="products" title="See what we build, running.">
        These are the systems we build, running — explore the register, see it working,
        and then tell us the scope for yours. What you get is the same shape with your
        items, your taxes and your branding.
      </PageHeader>
      <ProductsGrid showHeading={false} />
    </div>
  );
}
