import type { Product } from './types';

export const products: Product[] = [
  {
    slug: 'websites',
    title: 'Websites',
    summary: 'A fast site that sells for you — services, photos, prices and bookings.',
    icon: 'globe',
    bullets: [
      'Business site with your services, gallery and prices',
      'Booking or enquiry button that lands on your phone',
      'Update menus and offers yourself, no developer needed',
      'Built mobile-first, because that is where customers are',
    ],
  },
  {
    slug: 'ai-services',
    title: 'AI services',
    summary: 'An assistant that answers customers in your voice, at any hour.',
    icon: 'sparkles',
    bullets: [
      'Website assistant for timings, stock and pricing questions',
      'Drafts for offers, posts and menus from your own details',
      'Reports that read your numbers so you do not have to',
    ],
  },
  {
    slug: 'automation',
    title: 'Automation',
    summary: 'The repetitive back-office work runs itself: orders, lists and reminders.',
    icon: 'workflow',
    bullets: [
      'Orders and enquiries into one inbox or sheet',
      'Follow-up messages on a schedule, not from memory',
      'Month-end summary without rebuilding a spreadsheet',
    ],
  },
];
