import type { Metadata } from 'next';
import { ContactCta } from '@/components/brand/ContactCta';
import { PageHeader } from '@/components/brand/PageHeader';
import { ServicesJourney } from '@/components/brand/ServicesJourney';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'The get-online journey in four steps: get found, get known, get running, get smart — websites, motion design, automation and AI.',
};

export default function ServicesPage() {
  return (
    <div className="space-y-20">
      <div>
        <PageHeader index="02" label="services" title="Get online. Then get ahead.">
          Most businesses stop at having a website. The ones that grow treat going
          online as a sequence — each step making the next one worth more. Here is
          the whole path, in order.
        </PageHeader>
        <ServicesJourney detailed />
      </div>

      <section className="reveal">
        <PageHeader index="05" label="next step" title="Send one message. We reply the same day." />
        <ContactCta />
      </section>
    </div>
  );
}
