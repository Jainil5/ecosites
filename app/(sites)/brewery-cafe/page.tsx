import type { Metadata } from 'next';
import { BreweryCafe } from '@/components/sites/brewery-cafe/BreweryCafe';

export const metadata: Metadata = {
  title: 'Brewery Cafe — Slow Coffee, the Whole Board, One Scroll',
  description:
    'A neighbourhood coffee bar and bagel bakery on a single page: the coffee up front, then the whole menu to order from, what the regulars say, the Instagram reel, the room and the door to walk through.',
};

export default function BreweryCafePage() {
  return <BreweryCafe />;
}
