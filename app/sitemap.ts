import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/brand/site';
import { products } from '@/content/brand/products';
import { websites } from '@/content/websites/sites';
import { SECTION_PATHS } from '@/components/sites/stock-screener/sections';

export default function sitemap(): MetadataRoute.Sitemap {
  // A product's own page is not a delivered site in the gallery, so it would
  // otherwise never be listed: OrderBook's introduction sits above the three
  // counters that the gallery links to.
  const productPages = products.map((product) => product.demoPath).filter((p): p is string => !!p);
  const paths = [...new Set([...productPages, ...websites.map((site) => site.path), ...SECTION_PATHS])];

  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/services` },
    { url: `${siteUrl}/local-business` },
    { url: `${siteUrl}/enterprise` },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/products` },
    { url: `${siteUrl}/demos` },
    { url: `${siteUrl}/store` },
    { url: `${siteUrl}/contact` },
    ...paths.map((path) => ({ url: `${siteUrl}${path}` })),
  ];
}
