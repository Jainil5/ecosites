export interface ContactChannels {
  /** Exact business address, e.g. 'mail.jainil5@gmail.com'. */
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

export type ProductIcon = 'register' | 'pulse' | 'teams';

/** One named half of a product, so a two-part build reads as one purchase. */
export interface ProductModule {
  name: string;
  detail: string;
}

export interface Product {
  slug: string;
  title: string;
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
