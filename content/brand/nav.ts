/**
 * The primary navigation: four tabs plus the CTA. The audience pages
 * (/local-business, /enterprise) stay built and reachable from the footer,
 * but they are no longer top-level destinations. Every href here must be a
 * built route — the IA test validates it against the filesystem.
 */
export const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/demos', label: 'Work' },
  { href: '/about', label: 'About' },
] as const;

export const ctaLink = { href: '/contact', label: 'Get Started' } as const;

/** The footer can afford the full list, including the older index pages. */
export const footerLinks = [
  { href: '/services', label: 'Services' },
  { href: '/local-business', label: 'Local Business' },
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/products', label: 'Products' },
  { href: '/demos', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/portfolio', label: 'Portfolio' },
] as const;
