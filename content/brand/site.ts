/**
 * Canonical origin for canonical tags, OpenGraph URLs, sitemap and robots.
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment to the real domain.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://websitein.com';
