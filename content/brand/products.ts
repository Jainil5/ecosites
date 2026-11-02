import type { Product } from './types';

/**
 * The products are systems a business or a person runs, not capabilities they
 * buy — the capabilities live in `capabilities.ts`. Each entry names its two
 * halves, because every one of these is one purchase that does two jobs: the
 * counter and the numbers behind it, the list and the chart, the chat and the
 * answer, the name and the book that lives on it.
 */
export const products: Product[] = [
  {
    slug: 'order-book',
    title: 'OrderBook',
    summary:
      'The order management system we build around a counter — cafés, salons and kitchens all run on it, and all three are here to drive.',
    icon: 'register',
    bullets: [
      'Three counters to open — a café till, a salon book and a kitchen with a pantry shelf, each with its own catalogue and tax',
      'Order, invoice and receipt flow on the phone or tablet you already run the desk on',
      'Tax-correct bill with the split worked out, sent to the customer in one tap',
      'The businesses shown are our own builds — put your menu, your rates and your taxes in and it is your shop running',
    ],
    modules: [
      {
        name: 'The register',
        detail:
          'Items, quantities, taxes and the running total, with the finished bill one tap away — and rates and offers you change yourself, no developer in the loop.',
      },
      {
        name: 'Smart Analytical Register',
        detail:
          'The dashboard that reads the day back to you: best sellers, slow items, and the trend since you started keeping records.',
      },
    ],
    demoPath: '/orderbook',
  },
  {
    slug: 'market-pulse',
    title: 'Market Pulse',
    summary:
      'A screening tool we build to your rules, wired to live public market data.',
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
  {
    slug: 'digital-portfolio',
    title: 'Digital Portfolio',
    summary:
      'A portfolio built around your own name and domain, styled the way your industry reads it.',
    icon: 'portfolio',
    bullets: [
      'Your name as the address — we register the domain, put SSL on it, and hand you the login',
      'Two reads of one build: a modelling book of print plates and measurements, or an engineering CV that reads like a changelog',
      'The client, the agency and the recruiter each land on the half they care about, from one link',
      'Every name in the book is one we invented for the build — yours carries your photos and your history',
    ],
    modules: [
      {
        name: 'The name',
        detail:
          'The domain, the mail behind it, and one link that goes in a bio, an agency roster or a recruiter inbox.',
      },
      {
        name: 'The book',
        detail:
          'The page itself, themed for your trade: plates, comp card and availability for a model; shipped systems, a log and a stack register for an engineer.',
      },
    ],
    demoPath: '/namesake',
  },
  {
    slug: 'teamsync',
    title: 'TeamSync',
    summary:
      'Team chat, meetings and company knowledge in one workspace, with an AI assistant that answers from your own documents.',
    icon: 'teams',
    bullets: [
      'Channels, direct messages and file sharing in one place',
      'Meeting transcripts with summaries, decisions and action items pulled out automatically',
      'An HR bot and semantic file search grounded in your own documents',
      'Private, isolated data with encrypted communication',
    ],
    modules: [
      {
        name: 'The workspace',
        detail:
          'Chat, channels, file sharing and meeting notes stay together, so a decision keeps the conversation and the document that produced it.',
      },
      {
        name: 'The AI layer',
        detail:
          'An HR assistant, semantic file search, sales analysis and automated review replies, all reading from company data rather than the open web.',
      },
    ],
    repoUrl: 'https://github.com/Jainil5/teamsync',
  },
];
