import type { Metadata } from 'next';
import { Brewery } from '@/components/sites/brewery/Brewery';

export const metadata: Metadata = {
  title: 'Brewery — Twelve Taps, a Late Kitchen, One Scroll',
  description:
    'A neighbourhood brewery-café on a single page: the tap wall up front, then the whole board to order from, what the regulars say, the Instagram feed, the room and the door to walk through.',
};

export default function BreweryPage() {
  return <Brewery />;
}
