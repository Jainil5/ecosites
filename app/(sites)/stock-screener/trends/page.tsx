import type { Metadata } from 'next';
import { sectionBy } from '@/components/sites/stock-screener/sections';
import { TrendsPage } from '@/components/sites/stock-screener/TrendsPage';

const section = sectionBy('trends');

export const metadata: Metadata = {
  title: `${section.title} — Market Pulse`,
  description: section.blurb,
};

export default function TrendsRoute() {
  return <TrendsPage />;
}
