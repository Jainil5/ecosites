import type { Metadata } from 'next';
import { WebsiteCard } from '@/components/WebsiteCard';
import { SectionHeading } from '@/components/SectionHeading';
import { websites } from '@/content/websites/sites';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Work',
  description: `Websites built by ${company.name} — a salon, a live market tool and a restaurant guide. Open any one of them, then ask for the same thing with your own content.`,
};

export default function StorePage() {
  return (
    <div className="space-y-12">
      <SectionHeading eyebrow="Client work" title="Pick something you want for your business">
        Every site below is a full build: the front end, the content model, and the integrations the
        business actually needs. Open them, click around, then tell us which shape fits your
        business and we rebuild it with your content, colours and name.
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
