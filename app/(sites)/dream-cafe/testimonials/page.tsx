import type { Metadata } from 'next';
import { Testimonials } from '@/components/sites/dream-cafe/Testimonials';

export const metadata: Metadata = {
  title: 'Dream Cafe — what the regulars say',
  description:
    'Demo testimonials from the room, each tagged to the drink or plate that earned it.',
};

export default function CafeTestimonialsRoute() {
  return <Testimonials />;
}
