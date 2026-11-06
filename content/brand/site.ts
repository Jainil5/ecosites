/**
 * Canonical origin for canonical tags, OpenGraph URLs, sitemap and robots.
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment to the real domain.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://websitein.com';

/**
 * The host a business name is put on the moment it is typed: `<name>.<host>`.
 * Read off the canonical origin rather than written out again, so a deploy on
 * a different domain cannot leave the hero advertising an address the studio
 * does not own.
 */
export const instantHost = new URL(siteUrl).hostname.replace(/^www\./, '');
