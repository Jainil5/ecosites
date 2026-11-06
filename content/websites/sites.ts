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
    slug: 'brewery-cafe',
    author: 'jainil-patel',
    title: 'Brewery Cafe',
    business: 'Coffee bar and bagel bakery',
    description:
      'A neighbourhood coffee bar built around the first shot of the day: one espresso base through the hours, hand-rolled dough proved overnight, and a pressed-lunch board. Sunrise editorial theme on a single scroll — the coffee, then the whole menu to order from, then the regulars, the Instagram reel, the room and the door.',
    path: '/brewery-cafe',
    theme: 'Sunrise editorial',
    accent: '#E4572E',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    screenshot: '/showcase/brewery-cafe/preview.png',
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
    slug: 'orderbook-cafes',
    author: 'jainil-patel',
    title: 'OrderBook for cafés',
    business: 'Order management for a coffee bar',
    description:
      'The counter at a coffee bar: a pour tapped onto a ticket, a tax-correct bill, the regular already in the book. Small bills all morning on a 31-item menu at 5% GST, with the order history, the menu itself and a report of revenue, top items, category mix and busy hours behind the same screen.',
    path: '/orderbook/brewery-cafe-demo',
    theme: 'Light operator POS',
    accent: '#B5651D',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'SVG charts'],
    screenshot: '/showcase/orderbook-cafes/preview.png',
  },
  {
    slug: 'orderbook-salons',
    author: 'jainil-patel',
    title: 'OrderBook for salons and studios',
    business: 'Order management for a salon',
    description:
      'The same system bent to a chair instead of a counter: services rather than dishes, few tickets at a much higher value, 18% GST split on every bill. Colour, spa, bridal and grooming go on one ticket as the work finishes, and the report reads the week back by artist, service and hour.',
    path: '/orderbook/hair-adore-demo',
    theme: 'Light operator POS, terracotta',
    accent: '#C1613C',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'SVG charts'],
    screenshot: '/showcase/orderbook-salons/preview.png',
  },
  {
    slug: 'orderbook-kitchens',
    author: 'jainil-patel',
    title: 'OrderBook for kitchens and shelves',
    business: 'Order management for a live-fire kitchen',
    description:
      'One ticket for a plate cooked over the fire and a jar taken off the shelf, each in its own category and billed together. Evening-weighted trade with a real weekend peak, sold-out marking at the pass before the next table asks, and the same analytics reading the room back to the owner.',
    path: '/orderbook/ember-larder-demo',
    theme: 'Light operator POS, ember',
    accent: '#FF6A3D',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'SVG charts'],
    screenshot: '/showcase/orderbook-kitchens/preview.png',
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
  {
    slug: 'ruhani',
    author: 'jainil-patel',
    title: 'Ruhani',
    business: 'Handmade jewellery, made after you order',
    description:
      'A single workbench with the shop front it could not build itself: twelve pieces drawn at the bench on a paper shelf that filters by wear and by metal, a size chosen before the metal is cut, prices written inclusive of 3% GST with the tax kept as its own line, a courier that turns free above ₹4,000, and a box that sends the finished ticket to WhatsApp for a date rather than a checkout.',
    path: '/ruhani',
    theme: 'Warm paper and hairlines',
    accent: '#C9A96E',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'SVG line drawings'],
    screenshot: '/showcase/ruhani/preview.png',
  },
] satisfies SampleWebsite[];

export function getWebsiteBySlug(slug: string): SampleWebsite | undefined {
  return websites.find((site) => site.slug === slug);
}

/** Sites shipped by one builder, in registry order — the work page lists these. */
export function getWebsitesByAuthor(authorSlug: string): SampleWebsite[] {
  return websites.filter((site) => site.author === authorSlug);
}
