import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { ProductsGrid } from '@/components/brand/ProductsGrid';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Websites, motion design, automation and AI assistants — concrete deliverables, scoped quotes, no surprise invoices.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-10">
      <PageHeader index="03" label="products" title="Packages, end to end.">
        Every package is a starting point, not a cage. Tell us the scope — page
        count, languages, booking complexity — and you approve the quote before
        any work starts. No surprise invoices.
      </PageHeader>
      <ProductsGrid showHeading={false} />
    </div>
  );
}
