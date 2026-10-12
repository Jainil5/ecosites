import type { Metadata } from 'next';
import { WebsiteCard } from '@/components/WebsiteCard';
import { SectionHeading } from '@/components/SectionHeading';
import { websites } from '@/content/websites/sites';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Websites and tools Website IN has built and shipped for local businesses — each one live, each with its own look.',
};

export default function StorePage() {
  return (
    <div className="space-y-12">
      <SectionHeading eyebrow="Delivered work" title="What we have shipped">
        {websites.length} businesses live, each with its own theme and stack. Open any one of
        them — they are real working sites, not mockups.
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {websites.map((site, i) => (
          <div
            key={site.slug}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <WebsiteCard site={site} />
          </div>
        ))}
      </div>
    </div>
  );
}
