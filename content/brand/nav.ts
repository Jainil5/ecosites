import type { LucideIcon } from 'lucide-react';
import { Activity, ClipboardList, IdCard } from 'lucide-react';
import { capabilities } from './capabilities';
import { company } from './company';
import { products } from './products';
import type { ProductIcon } from './types';
import { websites } from '@/content/websites/sites';

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
] as const;

export interface NavRow {
  href: string;
  title: string;
  /** Registry copy, never written fresh for the menu. */
  description: string;
  Icon?: LucideIcon;
  /** A shipped site's own accent, painted as a flat square. */
  swatch?: string;
  /** Mono tag at the row's end — the theme or the page it lives on. */
  tag?: string;
}

/**
 * One dropdown per tab. `href` is the tab it hangs off, so the panels can
 * never drift from `navLinks` — an unknown href simply renders no chevron.
 */
export interface NavGroup {
  href: string;
  rows: NavRow[];
  footer: NavRow;
}

const productIcons = {
  register: ClipboardList,
  pulse: Activity,
  portfolio: IdCard,
} satisfies Record<ProductIcon, LucideIcon>;

export const navGroups: NavGroup[] = [
  {
    href: '/services',
    rows: capabilities.map((capability) => ({
      href: `/services#${capability.slug}`,
      title: capability.name,
      description: capability.blurb,
    })),
    footer: {
      href: '/store',
      title: 'Ready-made sites',
      description: 'Pick something you want for your business',
    },
  },
  {
    href: '/products',
    rows: products.map((product) => ({
      href: `/products#${product.slug}`,
      title: product.title,
      description: product.summary,
      Icon: productIcons[product.icon],
      tag: 'the app',
    })),
    footer: {
      href: '/demos',
      title: 'Every business below is live',
      description: 'Sites and apps already running for their owners',
    },
  },
  {
    href: '/demos',
    rows: websites.map((site) => ({
      href: site.path,
      title: site.title,
      description: site.business,
      swatch: site.accent,
      tag: site.theme,
    })),
    footer: {
      href: '/contact',
      title: 'Want one for your business?',
      description: 'Tell us the business and the problem, we will say what step one looks like',
    },
  },
];

/** Pages the tabs do not already surface as a group. */
const standalonePages: NavRow[] = [
  { href: '/', title: 'Home', description: company.pitch },
  { href: '/about', title: 'About', description: company.tagline },
  { href: '/contact', title: 'Contact', description: 'Tell us what hurts in your business' },
  { href: '/store', title: 'Store', description: 'Ready-made sites you can pick today' },
  { href: '/local-business', title: 'Local business', description: 'For one shop or a few outlets' },
  { href: '/enterprise', title: 'Enterprise', description: 'For teams with systems to connect' },
];

/** Everything quick search can reach: pages, group rows and their footers. */
const reachableRows: NavRow[] = [
  ...standalonePages,
  ...navGroups.flatMap((group) => [...group.rows, group.footer]),
];

export const searchIndex: NavRow[] = reachableRows.filter(
  (row, index) => reachableRows.findIndex((other) => other.href === row.href) === index,
);
