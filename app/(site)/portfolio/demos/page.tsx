import type { Metadata } from 'next';
import { DemoCard } from '@/components/DemoCard';
import { SectionHeading } from '@/components/SectionHeading';
import { sites } from '@/content/demos/sites';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A gallery of demo websites and data/AI projects I have built.',
};

export default function DemosPage() {
  return (
    <section className="space-y-10">
      <SectionHeading eyebrow="Portfolio" title="Projects & Demos">
        Data platforms, SaaS, and AI-agent systems I have designed and built. Click any card for
        details, tech stack, and source.
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site, i) => (
          <div key={site.slug} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <DemoCard site={site} />
          </div>
        ))}
      </div>
    </section>
  );
}
