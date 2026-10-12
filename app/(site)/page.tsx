import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { Hero } from '@/components/brand/Hero';
import { ProductsGrid } from '@/components/brand/ProductsGrid';
import { WorkStrip } from '@/components/brand/WorkStrip';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  // No title: the root default from app/layout.tsx is already
  // "Website IN — <tagline>", and setting one here would push it through the
  // "%s | Website IN" template and print the brand name twice.
  description: company.pitch,
};

export default function HomePage() {
  return (
    <div className="space-y-24">
      <Hero />
      <ProductsGrid />
      <WorkStrip />
      <section className="space-y-6">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          Send one message. We reply the same day.
        </h2>
        <ContactCta />
      </section>
    </div>
  );
}
