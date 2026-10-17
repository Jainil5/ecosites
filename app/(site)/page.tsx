import type { Metadata } from 'next';
import { ClientMarquee } from '@/components/brand/ClientMarquee';
import { ContactCta } from '@/components/brand/ContactCta';
import { GrowBand } from '@/components/brand/GrowBand';
import { Hero } from '@/components/brand/Hero';
import { ProductsGrid } from '@/components/brand/ProductsGrid';
import { ProofBand } from '@/components/brand/ProofBand';
import { ServicesJourney } from '@/components/brand/ServicesJourney';
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
    <div className="space-y-28 sm:space-y-36">
      <div className="space-y-10 sm:space-y-14">
        <Hero />
        <ProofBand />
        <ClientMarquee />
      </div>

      <GrowBand />
      <ServicesJourney />
      <ProductsGrid />
      <WorkStrip />

      <section className="gs-reveal -mx-6 gs-plane-b relative overflow-hidden py-16 sm:py-20">
        <span aria-hidden className="gs-grid opacity-20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="gs-label text-lime">
              <span className="text-canvas">06</span> <span aria-hidden>/</span> next step
            </p>
            <h2 className="gs-display gs-h2 mt-3 text-canvas">
              Send one message. We reply the same day.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-canvas/75">
              One WhatsApp message is enough. Tell us the business, we will tell
              you exactly what step one looks like — and when it can be live.
            </p>
          </div>
          <ContactCta />
        </div>
      </section>
    </div>
  );
}
