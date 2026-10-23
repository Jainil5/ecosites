import type { Metadata } from 'next';
import { CoffeeCups } from '@/components/sites/coffee-cups/CoffeeCups';

export const metadata: Metadata = {
  title: 'Coffee Cups — Bagels, Slow Coffee, and the Morning Sun',
  description:
    'A neighbourhood bagel bakery and coffee bar: dough proved overnight and rolled by hand, one espresso base through the day, and a pressed-lunch board. The whole menu on one page.',
};

export default function CoffeeCupsPage() {
  return <CoffeeCups />;
}
