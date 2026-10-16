import type { MetadataRoute } from 'next';
import { siteUrl } from '@/content/brand/site';
import { authors } from '@/content/portfolio/authors';
import { sites } from '@/content/demos/sites';
import { websites } from '@/content/websites/sites';

export default function sitemap(): MetadataRoute.Sitemap {
  const portfolio = authors.map((author) => ({ url: `${siteUrl}/portfolio/${author.slug}` }));
  const caseStudies = sites.map((site) => ({
    url: `${siteUrl}/portfolio/${site.author}/work/${site.slug}`,
  }));
  const demos = websites.map((site) => ({ url: `${siteUrl}${site.path}` }));

  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/services` },
    { url: `${siteUrl}/products` },
    { url: `${siteUrl}/demos` },
    { url: `${siteUrl}/store` },
    { url: `${siteUrl}/contact` },
    { url: `${siteUrl}/portfolio` },
    ...demos,
    ...portfolio,
    ...caseStudies,
  ];
}
