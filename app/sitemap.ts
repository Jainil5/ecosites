import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/brand/site';
import { products } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';
import { SECTION_PATHS } from '@/components/sites/stock-screener/sections';

/** The pages the brand navigation itself reaches. */
const NAV_PATHS = [
  '/',
  '/services',
  '/local-business',
  '/enterprise',
  '/about',
  '/products',
  '/demos',
  '/store',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  // A product's own page is not a delivered site in the gallery, so it would
  // otherwise never be listed: OrderBook's introduction sits above the three
  // counters that the gallery links to. Everything goes through one Set, since
  // the same path can arrive from the nav, a product and a site at once.
  const productPages = products
    .map((product) => product.demoPath)
    .filter((path): path is string => !!path);
  const paths = [
    ...new Set([...NAV_PATHS, ...productPages, ...websites.map((site) => site.path), ...SECTION_PATHS]),
  ];

  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
