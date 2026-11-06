import type { Metadata } from 'next';
import { Ruhani } from '@/components/sites/ruhani/Ruhani';
import { GST_RATE, pieces } from '@/components/sites/ruhani/data';

export const metadata: Metadata = {
  title: 'Ruhani — handmade jewellery, made after you ask',
  description:
    `A single workbench with a shop front it could not build itself: ${pieces.length} hand-drawn pieces, a size chosen on the sheet, prices written inclusive of ${GST_RATE}% GST with the tax shown as its own line, a courier rule, and an order that goes to WhatsApp for a date instead of a checkout.`,
};

export default function RuhaniPage() {
  return <Ruhani />;
}
