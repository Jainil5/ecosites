import type { Metadata } from 'next';
import { Testimonials } from '@/components/sites/coffee-cups/Testimonials';

export const metadata: Metadata = {
  title: 'Coffee Cups — what the regulars say',
  description:
    'Demo testimonials from the room, each tagged to the drink or plate that earned it.',
};

export default function CafeTestimonialsRoute() {
  return <Testimonials />;
}
