import type { Metadata } from 'next';
import { sectionBy } from '@/components/sites/stock-screener/sections';
import { AnalysisPage } from '@/components/sites/stock-screener/AnalysisPage';

const section = sectionBy('analysis');

export const metadata: Metadata = {
  title: `${section.title} — Market Pulse`,
  description: section.blurb,
};

export default function AnalysisRoute() {
  return <AnalysisPage />;
}
