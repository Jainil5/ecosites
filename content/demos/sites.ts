import type { DemoSite } from './types';

export const sites = [
  {
    slug: 'portfolio-advisor',
    author: 'jainil-patel',
    title: 'AI Portfolio Advisor',
    description:
      'A Snowflake-backed market data platform and portfolio analytics product with a LangGraph multi-agent recommendation engine.',
    techStack: ['Snowflake', 'Apache Airflow', 'PySpark', 'LangGraph', 'AWS S3'],
    liveUrl: 'https://github.com/Jainil5/portfolio-advisor',
    repo: 'https://github.com/Jainil5/portfolio-advisor',
    period: '2025',
    category: 'Data Platform',
    highlights: [
      'Built a Snowflake data stack with dependency-managed Airflow pipelines onboarding 100+ stock feeds daily from AWS S3.',
      'Wrote PySpark transformations with pytest data-quality tests promoted to production through CI/CD.',
      'Designed a LangGraph multi-agent workflow (analysis, research, news agents) for Buy/Hold/Sell recommendations on an interactive dashboard.',
    ],
  },
  {
    slug: 'teamsync',
    author: 'jainil-patel',
    title: 'TeamSync',
    description:
      'An event-driven enterprise collaboration SaaS platform — a Slack-style product with real-time messaging and containerised services.',
    techStack: ['Java', 'Azure', 'Supabase', 'RabbitMQ', 'Docker', 'Kubernetes'],
    liveUrl: 'https://github.com/Jainil5/teamsync',
    repo: 'https://github.com/Jainil5/teamsync',
    period: '2025',
    category: 'SaaS',
    highlights: [
      'Engineered a Slack-like SaaS platform: Java on Azure, Supabase auth, RabbitMQ event-driven messaging.',
      'Containerised services with Docker and Kubernetes, released through CI/CD pipelines.',
    ],
  },
  {
    slug: 'enterprise-productivity-agents',
    author: 'jainil-patel',
    title: 'Enterprise Productivity Agents',
    description:
      'A suite of enterprise AI agents served as MCP tools and REST services for document intelligence and Text-to-SQL reporting.',
    techStack: ['Python', 'FastAPI', 'MCP', 'PostgreSQL', 'RAG', 'pytest'],
    liveUrl: 'https://github.com/Jainil5/enterprise-productivity-agents',
    repo: 'https://github.com/Jainil5/enterprise-productivity-agents',
    screenshot: '/demos/enterprise-productivity-agents/preview.png',
    period: '2025',
    category: 'AI Agents',
    highlights: [
      'Built five enterprise AI agents exposed as MCP tools and FastAPI services with pytest coverage.',
      'Served document intelligence and Text-to-SQL reporting over PostgreSQL and vector stores.',
    ],
  },
] satisfies DemoSite[];

export function getSitesByAuthor(authorSlug: string): DemoSite[] {
  return sites.filter((site) => site.author === authorSlug);
}

export function getSiteBySlug(slug: string): DemoSite | undefined {
  return sites.find((site) => site.slug === slug);
}
