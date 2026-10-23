import type { Product } from './types';

/**
 * The products are apps a business runs, not capabilities it buys — the
 * capabilities live in `capabilities.ts`. Each entry names its halves, because
 * both of these are sold as one screen for the counter and one for the
 * numbers behind it.
 */
export const products: Product[] = [
  {
    slug: 'order-book',
    title: 'OrderBook',
    summary:
      'A working demonstration of the ordering, billing and reporting system we build around your counter, desk or studio.',
    icon: 'register',
    bullets: [
      'Order, invoice and receipt flow on the phone or tablet you already run the desk on',
      'Tax-correct bill with the split worked out, sent to the customer in one tap',
      'Items, rates and offers you change yourself — no developer in the loop',
      'Everything on screen is sample data from a build like yours, not a live shop',
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
    demoPath: '/analytical-register',
  },
  {
    slug: 'market-pulse',
    title: 'Market Pulse',
    summary:
      'A demonstration of a screening tool we build to your rules, wired to live public market data.',
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
