/**
 * The primary navigation split by audience: the two paths come first, then
 * the shared pages. Every href here must be a built route — the IA test
 * validates it against the filesystem.
 */
export const navLinks = [
  { href: '/local-business', label: 'Local Business' },
  { href: '/enterprise', label: 'Enterprise' },
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
