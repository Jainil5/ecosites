/**
 * The two books Namesake is built around. Every name, brand, number and credit
 * below was written for the product — the point of the page is the shape of a
 * portfolio built around a real person's own name, which theirs would replace.
 */

export const product = {
  name: 'Namesake',
  pitch: 'One domain with your name on it, built the way your industry reads it.',
  note: 'Built for the product — two people we wrote, work we made, no client attached.',
};

export type ModeKey = 'model' | 'dev';

/** The two books the same product serves. Flipping the switch re-skins the page. */
export const modes: { key: ModeKey; label: string; section: string; cta: string }[] = [
  { key: 'model', label: 'Modelling', section: 'modelling', cta: 'Book the book' },
  { key: 'dev', label: 'Developer', section: 'developer', cta: 'Hire the builder' },
];

export const model = {
  person: { name: 'Rhea Verma', domain: 'rheaverma.com', cities: 'Mumbai · Dubai', since: 'working since 2019' },
  role: 'Editorial & commercial model',
  status: 'Open for bookings · two weeks notice',
  credits: ['Sutra Studio', 'Marigold Lane', 'Vasa', 'Anar Fine Jewels', 'Nau Studio', 'Meher Bridal'],
  campaigns: [
    {
      brand: 'Sutra Studio',
      title: 'Monsoon Edit',
      kind: 'Editorial lookbook',
      year: '2026',
      plate: 'clay',
      caption: 'Six looks, one walk-up flat, shot on film between showers.',
    },
    {
      brand: 'Anar Fine Jewels',
      title: 'The Bridal Chapter',
      kind: 'Campaign stills',
      year: '2025',
      plate: 'gold',
      caption: 'Close work with the stone setter; the hands carry the frame.',
    },
    {
      brand: 'Marigold Lane',
      title: 'Everyday Luxe',
      kind: 'Commercial film',
      year: '2025',
      plate: 'rose',
      caption: 'Two days of shooting, eighteen cuts delivered, one hero film.',
    },
    {
      brand: 'Nau Studio',
      title: 'Street Fall',
      kind: 'Runway + backstage',
      year: '2024',
      plate: 'ink',
      caption: 'Show slot plus the fitting book that came with it.',
    },
  ],
  book: [
    { label: 'Height', value: '5′ 9″' },
    { label: 'Bust · waist · hips', value: '32 · 24 · 35' },
    { label: 'Eyes', value: 'Dark brown' },
    { label: 'Hair', value: 'Black, waist length' },
    { label: 'Works in', value: 'Hindi · English · Marathi' },
    { label: 'Travel', value: 'Passport ready, India + GCC' },
  ],
  available: [
    'Editorial',
    'Commercial film',
    'Runway',
    'Lookbook',
    'Jewellery and hands',
    'Brand events',
  ],
  stats: [
    { value: 42, label: 'campaigns shot' },
    { value: 9, label: 'designers shown' },
    { value: 3, label: 'national covers' },
    { value: 7, label: 'years working' },
  ],
};

export const dev = {
  person: { name: 'Kabir Nanda', domain: 'kabirnanda.com', cities: 'Bengaluru · remote', since: 'building since 2020' },
  role: 'Full-stack engineer',
  status: 'Available for contract · 20 h / week',
  stack: ['TypeScript', 'Next.js', 'React', 'Node', 'Postgres', 'Supabase', 'Tailwind', 'Vitest'],
  projects: [
    {
      name: 'Ledger',
      kind: 'Invoicing service',
      year: '2026',
      summary:
        'Recurring invoices, tax splits and a PDF pipeline that survives a leap year. Idempotent job queue, replay-safe.',
      stack: ['Next.js', 'Postgres', 'Cron'],
      metric: '4.1k invoices, zero duplicates',
    },
    {
      name: 'Relay',
      kind: 'Webhook gateway',
      year: '2025',
      summary:
        'One endpoint in, twelve systems out. Signed delivery with retries, and a dead-letter view an operator can read.',
      stack: ['Node', 'Redis', 'TypeScript'],
      metric: '99.98% delivery over 90 days',
    },
    {
      name: 'Atlas',
      kind: 'Route planner',
      year: '2025',
      summary:
        'Field-team routing with offline edits. Conflict resolution written as a pure function so it could be tested properly.',
      stack: ['React', 'IndexedDB', 'Maps'],
      metric: '38% fewer re-routes',
    },
    {
      name: 'Pulse',
      kind: 'Ops dashboard',
      year: '2024',
      summary:
        'One screen for on-call: what is slow, what is red, what shipped in the last deploy. Streaming, no refresh button.',
      stack: ['Next.js', 'SSE', 'D3'],
      metric: 'Time to detect: 14 min → 3',
    },
  ],
  log: [
    { when: 'this week', what: 'Ledger — proforma invoices shipped' },
    { when: 'last week', what: 'Relay — per-tenant rate ceilings' },
    { when: '2 weeks ago', what: 'Atlas — offline queue rewritten, 61 tests' },
    { when: 'last month', what: 'Pulse — deploy markers on every chart' },
  ],
  stats: [
    { value: 63, label: 'repos shipped' },
    { value: 12, label: 'systems in production' },
    { value: 480, label: 'reviews left' },
    { value: 6, label: 'years building' },
  ],
  links: ['GitHub', 'Read.cv', 'LinkedIn'],
};
