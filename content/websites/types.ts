export interface SampleWebsite {
  slug: string; // kebab-case, matches the /<slug> route
  title: string;
  business: string; // what kind of site it is
  description: string;
  path: string; // in-app route to the site
  theme: string; // short style descriptor, e.g. "Light editorial"
  accent: string; // hex used for the gallery swatch
  techStack: string[];
  screenshot: string; // path under public/showcase/<slug>/
  /** Public production URL, when the client has their own domain. */
  liveUrl?: string;
  /** Year it shipped. */
  year?: number;
}
