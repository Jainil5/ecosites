import type { Metadata } from 'next';
import { CoffeeCups } from '@/components/sites/coffee-cups/CoffeeCups';

export const metadata: Metadata = {
  title: 'Coffee Cups — Slow Coffee, the Whole Board, One Scroll',
  description:
    'A neighbourhood coffee bar and bagel bakery on a single page: the coffee up front, then the whole menu to order from, what the regulars say, the Instagram reel, the room and the door to walk through.',
};

export default function CoffeeCupsPage() {
  return <CoffeeCups />;
}
