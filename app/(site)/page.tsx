import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { Hero } from '@/components/brand/Hero';
import { ProductsGrid } from '@/components/brand/ProductsGrid';
import { SectionHeading } from '@/components/SectionHeading';
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
    <div className="space-y-24 sm:space-y-28">
      <Hero />
      <ProductsGrid />
      <WorkStrip />
      <section className="reveal">
        <SectionHeading eyebrow="Next step" title="Send one message. We reply the same day." />
        <ContactCta />
      </section>
    </div>
  );
}
