import type { Metadata } from 'next';
import { Savour } from '@/components/sites/savour/Savour';
import { getCatalogue } from '@/components/sites/savour/server';

export const metadata: Metadata = {
  title: 'Savour — Food Guide & Dish Wishlist',
  description:
    'Browse real restaurants and cafes, save the dishes you want to try into private lists, and keep notes on who to bring.',
};

export const revalidate = 3600;

export default async function SavourHome() {
  const catalogue = await getCatalogue();
  return <Savour catalogue={catalogue} />;
}
