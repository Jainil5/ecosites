import type { Metadata } from 'next';
import { HairAdore } from '@/components/sites/hair-adore/HairAdore';

export const metadata: Metadata = {
  title: 'Hair Adore — Salon (Demo)',
  description:
    'Demo website: a premium unisex salon marketing site with service menu, before/after gallery, stylists, reviews, and online booking. Light editorial theme.',
};

export default function HairAdoreDemoPage() {
  return <HairAdore />;
}
