import type { Product } from './types';

/**
 * The products are apps a business runs, not capabilities it buys — the
 * capabilities live in `services.ts`. Each entry names its halves, because
 * both of these are sold as one screen for the counter and one for the
 * numbers behind it.
 */
export const products: Product[] = [
  {
    slug: 'order-book',
    title: 'Order Book',
    summary:
      'Take the order at the counter and read the numbers back at closing, in one app.',
    icon: 'register',
    bullets: [
      'Bill screen built for the phone or tablet already on the counter',
      'GST cash memo with the split worked out, sent on WhatsApp in one tap',
      'Menu, taxes and offers you edit yourself — no developer in the loop',
      'Runs in the browser you have open, so nothing new to install',
    ],
    modules: [
      {
        name: 'The register',
        detail:
          'Items, quantities, taxes and the running total, with the finished bill one tap away.',
      },
      {
        name: 'Smart Analytical Register',
        detail:
          'The dashboard that reads the day back to you: best sellers, slow items, and the trend since you started keeping records.',
      },
    ],
  },
  {
    slug: 'market-pulse',
    title: 'Market Pulse',
    summary:
      'A screener you set yourself, with live NSE quotes, charts and the news behind the move.',
    icon: 'pulse',
    bullets: [
      'Sort and filter the list on the numbers that matter to you',
      'Live quotes streamed from public market endpoints, no broker login',
      'Per-stock charts with moving averages and momentum signals drawn in the browser',
      'A news desk that keeps the reason for a move beside the price',
    ],
    modules: [
      {
        name: 'The screener',
        detail:
          'Price, range, earnings and dividend in one sortable table, with a watchlist you control.',
      },
      {
        name: 'Charts and news',
        detail:
          'The stock on its own chart with average bands, and the headlines that moved it.',
      },
    ],
    demoPath: '/stock-screener',
  },
];
