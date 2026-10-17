import type { Metadata } from 'next';
import { sectionBy } from '@/components/sites/stock-screener/sections';
import { NewsPage } from '@/components/sites/stock-screener/NewsPage';

const section = sectionBy('news');

export const metadata: Metadata = {
  title: `${section.title} — Market Pulse`,
  description: section.blurb,
};

export default function NewsRoute() {
  return <NewsPage />;
}
