export interface SampleWebsite {
  slug: string; // kebab-case, matches /<slug>-demo routes
  title: string;
  business: string; // what kind of site it is
  description: string;
  path: string; // in-app route to the live demo
  theme: string; // short style descriptor, e.g. "Light editorial"
  accent: string; // hex used for the gallery swatch
  techStack: string[];
  screenshot: string; // path under public/showcase/<slug>/
}
