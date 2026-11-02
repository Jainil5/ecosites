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
    slug: 'coffee-cups',
    author: 'jainil-patel',
    title: 'Coffee Cups',
    business: 'Coffee bar and bagel bakery',
    description:
      'A neighbourhood coffee bar built around the first shot of the day: one espresso base through the hours, hand-rolled dough proved overnight, and a pressed-lunch board. Sunrise editorial theme on a single scroll — the coffee, then the whole menu to order from, then the regulars, the Instagram reel, the room and the door.',
    path: '/coffee-cups',
    theme: 'Sunrise editorial',
    accent: '#E4572E',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/coffee-cups/preview.png',
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
    business: 'Order management system for cafés, salons and shops',
    description:
      'The ordering, billing, kitchen and reporting system we build around a counter. It opens on the full product scope — tables and QR ordering, kitchen printing, menu and modifiers, customers and loyalty, your own online store beside the aggregator inbox, inventory and recipe costing, staff roles and shift close, many outlets, and the reports that read the day back to you — and then hands you three working counters to drive: a café till, a salon book and a live-fire kitchen with a pantry shelf, each with its own catalogue, tax split and analytics that move as orders are billed. Tap items onto a ticket, capture the guest, generate a tax-correct bill and send it on WhatsApp in one tap.',
    path: '/analytical-register',
    theme: 'Light operator POS',
    accent: '#B5651D',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/analytical-register/preview.png',
  },
  {
    slug: 'namesake',
    author: 'jainil-patel',
    title: 'Namesake',
    business: 'Digital portfolio on your own domain',
    description:
      'The portfolio we build around a person\'s own name and domain, styled two ways on one page: an editorial modelling book of print plates, a comp card and availability, and a professional engineering CV with sticky-stacked systems, a shipping log and a stack register. Switching the book re-skins the hero, the name checker and the enquiry block. Everyone in the book is ours — put your name, your work and your domain in and it is your portfolio running.',
    path: '/namesake',
    theme: 'Editorial light, engineering dark',
    accent: '#2DD4BF',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/namesake/preview.png',
  },
  {
    slug: 'ember-larder',
    author: 'jainil-patel',
    title: 'Ember Larder',
    business: 'Live-fire restaurant and pantry shelf',
    description:
      'A restaurant and a retail shelf on the same page, because they share a door: eight lines cooked over sal wood, jars of the same chilli oil and garam masala to take home, and one basket that carries a plate and a jar onto a single GST ticket. Order the card, choose a cut and a heat, hold a table by the rail.',
    path: '/ember-larder',
    theme: 'Charcoal and ember',
    accent: '#FF6A3D',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/ember-larder/preview.png',
  },
] satisfies SampleWebsite[];

export function getWebsiteBySlug(slug: string): SampleWebsite | undefined {
  return websites.find((site) => site.slug === slug);
}

/** Sites shipped by one builder, in registry order — the work page lists these. */
export function getWebsitesByAuthor(authorSlug: string): SampleWebsite[] {
  return websites.filter((site) => site.author === authorSlug);
}
