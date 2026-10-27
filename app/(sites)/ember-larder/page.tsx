import type { Metadata } from 'next';
import { EmberLarder } from '@/components/sites/ember-larder/EmberLarder';

export const metadata: Metadata = {
  title: 'Ember Larder — Live-fire kitchen & pantry',
  description:
    'A restaurant and a retail shelf on one page: eight lines cooked over sal wood, jars of the same chilli oil and garam masala to take home, a basket that carries both onto a single ticket, and a hearth built from three metres of firebrick.',
};

export default function EmberLarderPage() {
  return <EmberLarder />;
}
