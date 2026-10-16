import type { Product } from './types';

/** Ordered as the journey: get found, get known, get running, get smart. */
export const products: Product[] = [
  {
    slug: 'websites',
    title: 'Websites',
    summary: 'A fast site that sells for you — services, photos, prices and bookings.',
    icon: 'globe',
    step: 'Get Found',
    bullets: [
      'Business site with your services, gallery and prices',
      'Booking or enquiry button that lands on your phone',
      'Update menus and offers yourself, no developer needed',
      'Built mobile-first, because that is where customers are',
    ],
  },
  {
    slug: 'motion-design',
    title: 'Motion design',
    summary: 'A design pass that makes the site move — and makes the business look established.',
    icon: 'clapperboard',
    step: 'Get Known',
    bullets: [
      '3D hero moment and animated logo built into your site',
      'Scroll reveals and micro-interactions across every page',
      'Lightweight CSS motion — fast on cheap phones',
      'Works on a new site or as an upgrade to the one you have',
    ],
  },
  {
    slug: 'automation',
    title: 'Automation',
    summary: 'The repetitive back-office work runs itself: orders, lists and reminders.',
    icon: 'workflow',
    step: 'Get Running',
    bullets: [
      'Orders and enquiries into one inbox or sheet',
      'Follow-up messages on a schedule, not from memory',
      'Month-end summary without rebuilding a spreadsheet',
    ],
  },
  {
    slug: 'ai-services',
    title: 'AI assistant',
    summary: 'An assistant that answers customers in your voice, at any hour.',
    icon: 'sparkles',
    step: 'Get Smart',
    bullets: [
      'Website assistant for timings, stock and pricing questions',
      'Drafts for offers, posts and menus from your own details',
      'Reports that read your numbers so you do not have to',
    ],
  },
];
