export interface DemoSite {
  slug: string; // kebab-case, matches /demos/[slug]
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string; // external hosted demo
  screenshot: string; // path under public/demos/<slug>/
  repo?: string; // source repository URL
  period?: string; // e.g. "2025"
  category?: string; // e.g. "Data Platform", "SaaS", "AI Agents"
  highlights?: string[]; // bullet accomplishments for the detail page
}
