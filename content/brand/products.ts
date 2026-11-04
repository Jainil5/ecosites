import type { Product, ProductGroup } from './types';

/**
 * The products are systems a business or a person runs, not capabilities they
 * buy — the capabilities live in `capabilities.ts`. Each entry names its two
 * halves, because every one of these is one purchase that does two jobs: the
 * counter and the numbers behind it, the list and the chart, the chat and the
 * answer, the name and the book that lives on it.
 *
 * Array order is editorial weight — the counter leads, because it is the build
 * most visitors arrive for. The shelf a product appears on comes from `group`,
 * and `productGroups` decides the order the catalogue is read in.
 */
export const productGroups: ProductGroup[] = [
  {
    id: 'agents',
    label: 'Agents',
    blurb:
      'Assistants that answer out of your own data — the documents, the datasets, the roster and the repository — and sit in the chat your team already works in.',
  },
  {
    id: 'software',
    label: 'Software',
    blurb:
      'Systems with a screen you open every day: the counter, the market desk, the workspace.',
  },
  {
    id: 'websites',
    label: 'Websites',
    blurb:
      'The page a customer finds you on, built around how your trade actually sells.',
  },
  {
    id: 'portfolios',
    label: 'Portfolios',
    blurb:
      'One name, one domain, one link that carries your work to whoever you are trying to reach.',
  },
];

export const products: Product[] = [
  {
    slug: 'order-book',
    title: 'OrderBook',
    group: 'software',
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
    group: 'software',
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
    slug: 'teamsync',
    title: 'TeamSync',
    group: 'software',
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
  {
    slug: 'business-website',
    title: 'Business Website',
    group: 'websites',
    summary:
      'The site a customer finds you on: what you do, who you do it for, and a way to get in touch that ends in a real enquiry.',
    icon: 'website',
    bullets: [
      'Built for the phone most of your customers are reading it on, and for the desktop that follows',
      'Catalogue, gallery, booking or enquiry flow laid around how your trade actually sells',
      'Domain, mail and certificates registered and configured, with the login handed to you',
      'Every site listed is one we built and run ourselves — put your photographs and your prices in and it is your business on it',
    ],
    modules: [
      {
        name: 'The page',
        detail:
          'What you offer, who it is for and how to reach you, written for the customer deciding rather than for a search engine crawling.',
      },
      {
        name: 'The running',
        detail:
          'Hosted, secured and measured, with the words, the pictures and the stock list changed by you afterwards — the site keeps working past launch day.',
      },
    ],
    demoPath: '/demos',
  },
  {
    slug: 'digital-portfolio',
    title: 'Digital Portfolio',
    group: 'portfolios',
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

  /* ------------------------------------------------------------------
     The agents. Written from the two builds they came out of — the
     enterprise workspace agents and the document-intelligence desk —
     so a claim on a card is a claim a repository already backs.
     ------------------------------------------------------------------ */
  {
    slug: 'personal-agent',
    title: 'Personal Agent',
    group: 'agents',
    summary:
      'The assistant your staff message the way they message a colleague: leave balance, attendance, today’s meetings, and a note sent to the team from one thread.',
    icon: 'personal',
    bullets: [
      'Answers a leave balance or a roster question without anyone opening a portal',
      'Takes attendance and follows up on what it promised to chase',
      'Sends a named team a message on your behalf, so the instruction and the record stay together',
      'Works inside the chat or workspace application the organization already uses',
    ],
    modules: [
      {
        name: 'The ask',
        detail:
          'One line in plain language — how many casual leaves are left, who is on shift today, tell the backend team the release is out.',
      },
      {
        name: 'The doing',
        detail:
          'The agent resolves it against your own records — attendance, roster, calendar, directory — and answers in the same thread, with the numbers behind it.',
      },
    ],
    repoUrl: 'https://github.com/Jainil5/enterprise-productivity-agents',
  },
  {
    slug: 'knowledge-agent',
    title: 'Knowledge Agent',
    group: 'agents',
    summary:
      'Company knowledge that answers a question instead of hiding in a drive: hybrid search and retrieval over your own documents, with the source kept beside the answer.',
    icon: 'knowledge',
    bullets: [
      'Ask how the deployment process runs, what the leave policy says, or summarize the onboarding guide',
      'Keyword search and meaning search together, so a document found by phrasing still ranks with the one found by name',
      'Answers built from your files, with the passage it actually read',
      'New documents join the library without re-indexing the whole company',
    ],
    modules: [
      {
        name: 'The search',
        detail:
          'Policies, process notes and decks are indexed both ways at once — the exact term and the idea behind it — so a question reaches the right page.',
      },
      {
        name: 'The answer',
        detail:
          'A short reply in sentences, with the document and the passage it came from, so anyone can check it rather than take it on trust.',
      },
    ],
    repoUrl: 'https://github.com/Jainil5/enterprise-productivity-agents',
  },
  {
    slug: 'smart-files',
    title: 'Smart Files',
    group: 'agents',
    summary:
      'The document desk: feed it a folder, a drive link or a bucket, and it answers from what is inside — the passage, the explanation, or the number out of the table.',
    icon: 'documents',
    bullets: [
      'Ingests from a local machine, cloud storage or a shared link, and leaves the originals where they are',
      'One question, three answers — find the passage, explain it, or query the structured data behind it',
      'Turns plain English into the query, so a sales table answers for itself without anyone writing it',
      'Every run is logged and versioned: which document answered, how it scored, how long it took',
    ],
    modules: [
      {
        name: 'The library',
        detail:
          'Files are chunked, embedded and stored against a versioned record, with the metadata kept so a document can be traced back to where it came from.',
      },
      {
        name: 'The reader',
        detail:
          'Semantic search for the passage, grounded answers for the explanation, generated SQL for the numbers — the agent picks which one the question needs and says so.',
      },
    ],
    repoUrl: 'https://github.com/Jainil5/smart_files',
  },
  {
    slug: 'codebase-agent',
    title: 'Codebase Agent',
    group: 'agents',
    summary:
      'A repository-aware assistant for the team that inherited the code: where the entrypoint is, how authentication really works, which store keeps what.',
    icon: 'codebase',
    bullets: [
      'Searches the whole repository rather than the file currently open',
      'Answers architecture questions with the paths and the call chain behind them',
      'Shortens the time a new developer needs before they touch something real',
      'Keeps its reading of the project current as the code moves',
    ],
    modules: [
      {
        name: 'The map',
        detail:
          'Files, symbols and dependencies indexed together, so a question lands on the module that answers it rather than a list of keyword hits.',
      },
      {
        name: 'The read',
        detail:
          'Where the API entrypoint is, how a request is authenticated, where conversations are stored — answered with the code beside it.',
      },
    ],
    repoUrl: 'https://github.com/Jainil5/enterprise-productivity-agents',
  },
  {
    slug: 'engineering-agent',
    title: 'Engineering Agent',
    group: 'agents',
    summary:
      'The one that watches the running system: unusual log lines marked as they appear, and latency and error patterns read back before anyone asks what broke.',
    icon: 'engineering',
    bullets: [
      'Flags unusual logs across services instead of waiting on a rule somebody wrote first',
      'Answers which endpoints are slowest and where the errors are clustering',
      'Follows an incident through the services, their models and their latencies',
      'Sits in the same channel as the team, so the investigation stays a conversation',
    ],
    modules: [
      {
        name: 'The watch',
        detail:
          'Runtime logs, model behaviour and request latency read continuously, with the odd ones marked rather than averaged away.',
      },
      {
        name: 'The dig',
        detail:
          'What is slow, what is failing, whether a given agent is healthy — each answer comes with the log lines that show it.',
      },
    ],
    repoUrl: 'https://github.com/Jainil5/enterprise-productivity-agents',
  },
];
