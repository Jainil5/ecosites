import type { Metadata } from 'next';
import { CafeMenuPage } from '@/components/sites/coffee-cups/CafeMenuPage';

export const metadata: Metadata = {
  title: 'Coffee Cups — the whole menu',
  description:
    'Coffee, food and cold pours on one board: tap any card for details, build a tray, and place the order.',
};

export default function CafeMenuRoute() {
  return <CafeMenuPage />;
}
