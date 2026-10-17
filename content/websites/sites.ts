import type { SampleWebsite } from './types';

export const websites = [
  {
    slug: 'hair-adore',
    author: 'jainil-patel',
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
    author: 'jainil-patel',
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
    slug: 'dream-cafe',
    author: 'jainil-patel',
    title: 'Dream Cafe',
    business: 'Bagel and coffee bar',
    description:
      'A neighbourhood bagel bakery built around morning light: hand-rolled dough proved overnight, a single espresso base through the day, and a pressed-lunch board. Sunrise editorial theme with a scrolling ticker, full menu in one pass, and a rotated photo mosaic.',
    path: '/dream-cafe',
    theme: 'Sunrise editorial',
    accent: '#E4572E',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/dream-cafe/preview.png',
  },
  {
    slug: 'savour',
    author: 'jainil-patel',
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
  {
    slug: 'analytical-register',
    author: 'jainil-patel',
    title: 'OrderBook',
    business: 'Order register & business analytics',
    description:
      'A point-of-sale register for any café or shop: tap menu items to build a ticket, capture the customer, generate a GST cash memo, and send the bill on WhatsApp in one tap. Every logged order feeds a live dashboard of revenue, average order value, top items, category mix and weekday-versus-weekend trends.',
    path: '/analytical-register',
    theme: 'Light operator POS',
    accent: '#B5651D',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/analytical-register/preview.png',
  },
] satisfies SampleWebsite[];

export function getWebsiteBySlug(slug: string): SampleWebsite | undefined {
  return websites.find((site) => site.slug === slug);
}

/** Sites shipped by one builder, in registry order — the work page lists these. */
export function getWebsitesByAuthor(authorSlug: string): SampleWebsite[] {
  return websites.filter((site) => site.author === authorSlug);
}
