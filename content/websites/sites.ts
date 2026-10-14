import type { SampleWebsite } from './types';

export const websites = [
  {
    slug: 'hair-adore',
    title: 'Hair Adore',
    business: 'Premium unisex salon',
    description:
      'A salon marketing site with a service menu, before/after gallery, stylists, reviews, and an online booking flow. Reimagined in a light editorial theme.',
    path: '/hair-adore',
    theme: 'Light editorial',
    accent: '#C1613C',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/hair-adore/preview.png',
  },
  {
    slug: 'stock-screener',
    title: 'Market Pulse',
    business: 'NSE stock screener · Live market data',
    description:
      'A stock screener streaming live NSE quotes through a Yahoo Finance proxy: market breadth stats, sortable screener with fundamentals, sparklines, 52-week ranges, and per-stock charts with SMA and RSI signals.',
    path: '/stock-screener',
    theme: 'Dark fintech terminal',
    accent: '#16C784',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Yahoo Finance API'],
    screenshot: '/showcase/stock-screener/preview.png',
  },
  {
    slug: 'savour',
    title: 'Savour',
    business: 'Restaurant and dish guide',
    description:
      'A dish-first guide to real restaurants: switch between Places and Items over one shared filter set, search menus by dish, and save individual items from different restaurants into named lists with notes. Backed by Supabase, with row-level security keeping each device\'s wishlist to itself.',
    path: '/savour',
    theme: 'Dark food guide',
    accent: '#E8A33D',
    techStack: ['Next.js', 'Supabase', 'Postgres RLS', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/savour/preview.png',
  },
] satisfies SampleWebsite[];

export function getWebsiteBySlug(slug: string): SampleWebsite | undefined {
  return websites.find((site) => site.slug === slug);
}
