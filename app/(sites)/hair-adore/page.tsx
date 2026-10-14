import type { Metadata } from 'next';
import { HairAdore } from '@/components/sites/hair-adore/HairAdore';

export const metadata: Metadata = {
  title: 'Hair Adore — Premium Unisex Salon',
  description:
    'A premium unisex salon marketing site with a service menu, before/after gallery, stylists, reviews, and online booking. Light editorial theme.',
};

export default function HairAdoreDemoPage() {
  return <HairAdore />;
}
