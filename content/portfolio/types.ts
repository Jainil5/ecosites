export interface PortfolioLink {
  label: string;
  href: string;
}

export interface PortfolioAuthor {
  /** kebab-case; becomes /portfolio/<slug> */
  slug: string;
  name: string;
  /** What they do, one line, e.g. 'Software Engineer'. */
  title: string;
  location: string;
  /** 2-3 sentences shown under the author's name. */
  bio: string;
  /** Chips for the stack marquee, most relevant first. */
  stack: string[];
  /** External profiles only (GitHub, LinkedIn, …). */
  links: PortfolioLink[];
}
