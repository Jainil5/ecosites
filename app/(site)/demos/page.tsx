import type { Metadata } from 'next';
import { PageHeader } from '@/components/brand/PageHeader';
import { WebsiteCard } from '@/components/WebsiteCard';
import { websites } from '@/content/websites/sites';
import { company } from '@/content/brand/company';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Live sites built by Website & Intelligence: a salon marketing site with booking, an NSE stock screener with live market data, a restaurant dish guide, and a bagel bakery with a full digital menu.',
};

export default function WorkPage() {
  return (
    <div className="pt-12 sm:pt-16">
      <PageHeader index="05" label="work" title="Every business below is live.">
        {company.name} ships whole builds — the front end, the content model and the
        integrations the business actually runs on. Open any card, click around, and
        judge the craft yourself.
      </PageHeader>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {websites.map((site, i) => (
          <WebsiteCard key={site.slug} site={site} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
