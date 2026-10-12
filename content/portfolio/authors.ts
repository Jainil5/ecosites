import type { PortfolioAuthor } from './types';

export const authors: PortfolioAuthor[] = [
  {
    slug: 'jainil-patel',
    name: 'Jainil Patel',
    title: 'Software Engineer',
    location: 'Pune, India',
    bio: 'I design and ship production software — from APIs and interfaces to Snowflake-backed data pipelines, ETL automation and cloud infrastructure on AWS, with AI-agent systems on top. Most of what is below started as a question nobody would answer for free, so I built the thing that answers it.',
    stack: [
      'Snowflake',
      'Apache Airflow',
      'PySpark',
      'AWS',
      'Python',
      'SQL',
      'LangGraph',
      'MCP',
      'FastAPI',
      'Docker',
      'Kubernetes',
      'PostgreSQL',
      'RabbitMQ',
      'RAG',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/Jainil5' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/Jainil5' },
      { label: 'LeetCode', href: 'https://leetcode.com/u/jainil5/' },
    ],
  },
];

export function getAllAuthorSlugs(): string[] {
  return authors.map((author) => author.slug);
}

export function getAuthorBySlug(slug: string): PortfolioAuthor | undefined {
  return authors.find((author) => author.slug === slug);
}
