import type { Metadata } from 'next';
import { OfferBand } from '@/components/brand/OfferBand';
import { PageHeader } from '@/components/brand/PageHeader';
import { ProductsGrid } from '@/components/brand/ProductsGrid';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'The systems we build and then run with you, on a monthly plan, across four shelves: agents that answer from your own documents and data, an order register with business analytics built in, a market screener wired to live NSE quotes, a team workspace, the site a customer lands on, and a portfolio that lives on your own name.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-10 pt-12 sm:pt-16">
      <PageHeader index="04" label="products" title="See what we build, running.">
        These are the systems we build, running — agents, counters, screens, sites and portfolios.
        Open one, see it working, then tell us the scope for yours. What you get is the same shape
        with your items, your taxes and your branding, on a plan that runs monthly: the build is
        where the work starts, and the months after it are where it gets better.
      </PageHeader>
      <ProductsGrid showHeading={false} />
      <OfferBand index="04" />
    </div>
  );
}
