import type { Proof } from './proof';

export interface Solution {
  slug: string;
  name: string;
  blurb: string;
  /** What is actually constructed, plainly. */
  builds: string[];
  /** Required at this tier: no enterprise claim ships without an artifact. */
  proof: Proof;
}

export const solutions: Solution[] = [
  {
    slug: 'custom-software',
    name: 'Custom Software Engineering',
    blurb:
      'Web applications, internal portals, customer platforms, and tailored business systems.',
    builds: [
      'Web and internal applications',
      'Customer-facing platforms',
      'Event-driven services with authentication, messaging and deployment',
    ],
    proof: { kind: 'case', path: '/portfolio/jainil-patel/work/teamsync' },
  },
  {
    slug: 'data-and-bi',
    name: 'Data Engineering & Business Intelligence',
    blurb:
      'Data ingestion, transformation, pipelines, dashboards, reporting, and analytics workflows.',
    builds: [
      'Pipeline ingestion and dependency-managed schedules',
      'Transformation with data-quality checks',
      'Dashboards and reporting for decision-makers',
    ],
    proof: { kind: 'case', path: '/portfolio/jainil-patel/work/portfolio-advisor' },
  },
  {
    slug: 'ai-and-automation',
    name: 'AI Systems & Automation',
    blurb:
      'AI assistants, knowledge retrieval, document workflows, support automation, and integrations with existing systems.',
    builds: [
      'RAG knowledge search and AI assistants',
      'Document intelligence workflows',
      'Agents served as tools and APIs over your own data',
    ],
    proof: {
      kind: 'case',
      path: '/portfolio/jainil-patel/work/enterprise-productivity-agents',
    },
  },
  {
    slug: 'apis-and-integrations',
    name: 'APIs & System Integrations',
    blurb:
      'Connect platforms and data sources through maintainable integrations and well-defined interfaces.',
    builds: [
      'Service APIs with documented interfaces',
      'Platform and data-source integrations',
      'Messaging between systems that already run your operations',
    ],
    proof: { kind: 'case', path: '/portfolio/jainil-patel/work/teamsync' },
  },
  {
    slug: 'cloud-and-modernisation',
    name: 'Cloud & Application Modernisation',
    blurb:
      'Deployment architecture, performance improvements, operational tooling, and modernisation plans appropriate to the project’s needs.',
    builds: [
      'Containerised deployment',
      'Performance and operational tooling',
      'Modernisation plans for existing systems',
    ],
    proof: { kind: 'product', path: '/stock-screener' },
  },
];

export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions.find((solution) => solution.slug === slug);
}

/** How an enterprise engagement runs, in order. */
export const engagement: string[] = [
  'Discovery and requirements',
  'Scope, architecture, and delivery plan',
  'Prototype or implementation',
  'Testing, launch, and handover',
  'Optional ongoing support and development',
];
