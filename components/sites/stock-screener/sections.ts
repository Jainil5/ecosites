// Single source of truth for Market Pulse's section navigation. The tab bar,
// the sitemap and each page's metadata all read this, so a section cannot
// appear in one place and go missing in another.
export interface Section {
  key: 'markets' | 'news' | 'analysis' | 'trends';
  href: string;
  /** Tab label. */
  label: string;
  /** Page heading. */
  title: string;
  /** One line under the heading, in the site's own voice. */
  blurb: string;
  /** The home tab also owns /stock-screener, so it matches on the whole path. */
  exact?: boolean;
}

export const SECTIONS: Section[] = [
  {
    key: 'markets',
    href: '/stock-screener',
    label: 'Markets',
    title: 'Markets',
    blurb: 'Live NSE quotes, breadth and the full screener — streaming from Yahoo Finance.',
    exact: true,
  },
  {
    key: 'news',
    href: '/stock-screener/news',
    label: 'News',
    title: 'Market News',
    blurb: 'Every headline the wire carries on Indian markets, sorted by what moved today.',
  },
  {
    key: 'analysis',
    href: '/stock-screener/analysis',
    label: 'Analysis',
    title: 'Technical Analysis',
    blurb: 'Trend, momentum and range position for every tracked stock, read off the same live tape.',
  },
  {
    key: 'trends',
    href: '/stock-screener/trends',
    label: 'Trends',
    title: 'Trends & Movers',
    blurb: 'Who is leading, who is lagging, and which sectors the money is moving through.',
  },
];

/** Section paths that sit below the home route — used by the sitemap. */
export const SECTION_PATHS = SECTIONS.filter((s) => !s.exact).map((s) => s.href);

export function sectionBy(key: Section['key']): Section {
  const found = SECTIONS.find((s) => s.key === key);
  if (!found) throw new Error(`Unknown Market Pulse section: ${key}`);
  return found;
}
