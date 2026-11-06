import type { LucideIcon } from 'lucide-react';
import { PRODUCT_ICONS } from '@/components/brand/product-icons';
import { capabilities } from './capabilities';
import { company } from './company';
import { productGroups, products } from './products';
import type { Product } from './types';
import { websites } from '@/content/websites/sites';

/**
 * The primary navigation: three tabs plus the CTA. Work is not one of them —
 * the /demos index stays built and stays reachable from the footer, the hero
 * and the Products panel, but the bar carries what we sell rather than what we
 * have already shipped. The audience pages (/local-business, /enterprise) live
 * in the footer only. Every href here must be a built route — the IA test
 * validates it against the filesystem.
 */
export const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
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

/** A labelled block inside a panel. `label` is null for a flat group. */
export interface NavSection {
  label: string | null;
  rows: NavRow[];
}

/**
 * One dropdown per tab. `href` is the tab it hangs off, so the panels can
 * never drift from `navLinks` — an unknown href simply renders no chevron.
 * `rows` is the flat list the panel and the search index read; `sections` is
 * the same list with headings, for a panel that needs to say what kind of
 * thing each row is.
 */
export interface NavGroup {
  href: string;
  rows: NavRow[];
  sections?: NavSection[];
  footer: NavRow;
}

/** The one shape a panel has to draw: sections, with or without headings. */
export const navSections = (group: NavGroup): NavSection[] =>
  group.sections ?? [{ label: null, rows: group.rows }];

const productRow = (product: Product): NavRow => ({
  href: `/products#${product.slug}`,
  title: product.title,
  description: product.summary,
  Icon: PRODUCT_ICONS[product.icon],
});

/**
 * The Products panel is the catalogue read by shelf, not a ten-row list
 * someone has to squint at. The headings come from `productGroups` and the
 * rows from `products`, so adding a system means one registry entry — it
 * appears under its shelf automatically, and a shelf that ships empty simply
 * draws no heading.
 */
const productSections: NavSection[] = productGroups
  .map((group) => ({
    label: group.label,
    rows: products.filter((product) => product.group === group.id).map(productRow),
  }))
  .filter((section) => section.rows.length > 0);

/**
 * The delivered sites, still reachable by search now that Work is off the
 * bar. Someone typing a counter's name should land on that counter, not on a
 * page that merely mentions it.
 */
export const workRows: NavRow[] = websites.map((site) => ({
  href: site.path,
  title: site.title,
  description: site.business,
  swatch: site.accent,
  tag: site.theme,
}));

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
    sections: productSections,
    rows: productSections.flatMap((section) => section.rows),
    footer: {
      // With no Work tab, this row is the bar's only way into /demos.
      href: '/demos',
      title: 'See the systems running',
      description: 'Sites and apps we built and run ourselves, end to end',
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
  ...workRows,
];

export const searchIndex: NavRow[] = reachableRows.filter(
  (row, index) => reachableRows.findIndex((other) => other.href === row.href) === index,
);
