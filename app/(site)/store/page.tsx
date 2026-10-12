import type { Metadata } from 'next';
import { WebsiteCard } from '@/components/WebsiteCard';
import { SectionHeading } from '@/components/SectionHeading';
import { websites } from '@/content/websites/sites';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Demo store',
  description: `Working demos built by ${company.name} — a salon site, a live data tool and a food guide. Open any one of them, then ask for the same thing with your own content.`,
};

export default function StorePage() {
  return (
    <div className="space-y-12">
      <SectionHeading eyebrow="Demo store" title="Pick something you want for your business">
        These are demos: real, working sites built to show what {company.name} can do. Open them,
        click around, then tell us which shape fits your business and we rebuild it with your
        content, colours and name.
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {websites.map((site, i) => (
          <div
            key={site.slug}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <WebsiteCard site={site} priority={i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
