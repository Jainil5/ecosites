export interface DemoSite {
  slug: string; // kebab-case, matches /portfolio/[author]/work/[slug]
  /** PortfolioAuthor.slug — the person who built this. */
  author: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string; // external hosted site
  screenshot?: string; // path under public/demos/<slug>/; omit to show a generated cover
  repo?: string; // source repository URL
  period?: string; // e.g. "2025"
  category?: string; // e.g. "Data Platform", "SaaS", "AI Agents"
  highlights?: string[]; // bullet accomplishments for the detail page
}
