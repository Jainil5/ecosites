import type { Metadata } from 'next';
import { DreamCafe } from '@/components/sites/dream-cafe/DreamCafe';

export const metadata: Metadata = {
  title: 'Dream Cafe — Bagels, Slow Coffee, and the Morning Sun',
  description:
    'A neighbourhood bagel bakery and coffee bar: dough proved overnight and rolled by hand, one espresso base through the day, and a pressed-lunch board. The whole menu on one page.',
};

export default function DreamCafePage() {
  return <DreamCafe />;
}
