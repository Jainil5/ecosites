import type { Metadata } from 'next';
import { CafeMenuPage } from '@/components/sites/dream-cafe/CafeMenuPage';

export const metadata: Metadata = {
  title: 'Dream Cafe — the whole menu',
  description:
    'Coffee, food and cold pours on one board: tap any card for details, build a tray, and place the order.',
};

export default function CafeMenuRoute() {
  return <CafeMenuPage />;
}
