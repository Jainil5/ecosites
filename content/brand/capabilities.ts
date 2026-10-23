export interface Capability {
  slug: string;
  name: string;
  blurb: string;
  /** What a project under this capability actually includes. */
  examples: string[];
  /** Which audience page this capability primarily routes to. */
  audience: 'local' | 'enterprise' | 'both';
}

export const capabilities: Capability[] = [
  {
    slug: 'websites',
    name: 'Websites & Digital Presence',
    blurb:
      'Professional, responsive websites and landing pages that explain what you offer and make it easy for customers to take action.',
    examples: [
      'Business websites',
      'Landing pages',
      'Digital catalogues and menus',
      'Booking and enquiry flows',
      'Website maintenance and improvements',
    ],
    audience: 'local',
  },
  {
    slug: 'digital-commerce',
    name: 'E-commerce & Digital Commerce',
    blurb:
      'Help customers browse products, enquire, place orders, and interact with your brand online.',
    examples: [
      'Online stores',
      'Product catalogues',
      'Order flows',
      'Payment and third-party integrations, where appropriate',
      'Customer and order workflows',
    ],
    audience: 'both',
  },
  {
    slug: 'business-software',
    name: 'Business Software',
    blurb:
      'Replace repetitive manual work and disconnected spreadsheets with software that fits your processes.',
    examples: [
      'Order and customer management',
      'Internal portals',
      'Operational dashboards',
      'Workflow tools',
      'Custom business applications',
    ],
    audience: 'both',
  },
  {
    slug: 'business-operations',
    name: 'Business Operations & Customer Experience',
    blurb:
      'The day-to-day running of the business, handled for you: orders taken, bills issued, customers heard from, and the numbers read back — for any counter, desk or studio, not only food.',
    examples: [
      'Order capture and billing at the counter, the desk or over the phone',
      'Tax-correct invoices, receipts and records an accountant can use',
      'Review collection and sentiment tracking, with replies that keep the customer',
      'Sales, stock and customer reporting served up weekly',
      'Catalogue, service list and rate updates you make yourself',
      'Staff tasks, follow-ups and reminders kept in one place',
    ],
    audience: 'both',
  },
  {
    slug: 'data-analytics',
    name: 'Data & Analytics',
    blurb:
      'Turn business data into useful reports, dashboards, and insights that help teams understand performance.',
    examples: [
      'Sales and performance dashboards',
      'Data integration and pipelines',
      'Reporting automation',
      'Data cleaning and transformation',
      'Business intelligence solutions',
    ],
    audience: 'enterprise',
  },
  {
    slug: 'ai-automation',
    name: 'AI & Automation',
    blurb: 'Use AI to assist people and automate appropriate, repeatable work.',
    examples: [
      'AI assistants and knowledge search',
      'Customer-support workflows',
      'Document and information extraction',
      'Internal productivity assistants',
      'RAG systems and custom model integrations',
    ],
    audience: 'both',
  },
  {
    slug: 'cloud-integrations',
    name: 'Cloud & Integrations',
    blurb:
      'Connect systems and deploy technology with an approach suited to the project’s scale, security needs, and operating requirements.',
    examples: [
      'API integrations',
      'Database-backed applications',
      'Cloud deployment',
      'System modernisation',
      'Monitoring and maintenance',
    ],
    audience: 'enterprise',
  },
];
