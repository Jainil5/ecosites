import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/brand/site';
import { websites } from '@/content/websites/sites';
import { SECTION_PATHS } from '@/components/sites/stock-screener/sections';

export default function sitemap(): MetadataRoute.Sitemap {
  const demos = websites.map((site) => ({ url: `${siteUrl}${site.path}` }));
  const marketPulse = SECTION_PATHS.map((path) => ({ url: `${siteUrl}${path}` }));

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
    ...demos,
    ...marketPulse,
  ];
}
