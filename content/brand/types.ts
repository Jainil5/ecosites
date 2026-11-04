export interface ContactChannels {
  /** Exact business address, e.g. 'hello@business.example'. */
  email: string;
  /** National significant digits only: no '+91', no spaces, no dashes. */
  phone: string;
  /** What visitors read on screen. */
  phoneDisplay: string;
  /** Prefilled first message for the WhatsApp tap. */
  whatsappMessage: string;
}

export interface Company {
  name: string;
  tagline: string;
  pitch: string;
  /** Short pill above the hero headline. */
  badge: string;
  contact: ContactChannels;
}

export type ProductIcon =
  | 'register'
  | 'pulse'
  | 'teams'
  | 'portfolio'
  | 'website'
  | 'personal'
  | 'knowledge'
  | 'documents'
  | 'codebase'
  | 'engineering';

/** Which shelf a product sits on, and the anchor its shelf is reached at. */
export type ProductGroupId = 'agents' | 'software' | 'websites' | 'portfolios';

/**
 * A shelf in the catalogue. The grid renders one band per group, in this
 * declared order — the registry's own order is editorial weight, so the
 * flagship counter stays first in the array while agents read first.
 */
export interface ProductGroup {
  id: ProductGroupId;
  /** The band heading. */
  label: string;
  /** One line under the heading, in the reader's words. */
  blurb: string;
}

/** One named half of a product, so a two-part build reads as one purchase. */
export interface ProductModule {
  name: string;
  detail: string;
}

export interface Product {
  slug: string;
  title: string;
  group: ProductGroupId;
  /** One sentence, written for a business owner, not an engineer. */
  summary: string;
  /** 3-4 concrete deliverables. */
  bullets: string[];
  icon: ProductIcon;
  modules: ProductModule[];
  /**
   * Route of the live app, and only when that route exists on this branch.
   * `test/brand-registries.test.ts` resolves it, so a product can never ship
   * a button to a page that is not built yet.
   */
  demoPath?: string;
  /** Public build when the product is hosted outside this app. */
  repoUrl?: string;
}
