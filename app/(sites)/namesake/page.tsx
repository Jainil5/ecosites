import type { Metadata } from 'next';
import { Namesake } from '@/components/sites/namesake/Namesake';

export const metadata: Metadata = {
  title: 'Namesake — Digital Portfolio on Your Own Domain',
  description:
    'The portfolio we build around your name, running end to end: one domain, one page, styled the way your industry reads it — a modelling book with print plates and a comp card, or an engineering CV that reads like a changelog.',
};

export default function NamesakePage() {
  return <Namesake />;
}
