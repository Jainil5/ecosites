import type { Proof } from './proof';

export interface Industry {
  slug: string;
  name: string;
  /** One sentence on the card. */
  blurb: string;
  /** What a project for this vertical includes, plainly. */
  deliverables: string[];
  /** A delivered build that proves we can talk about this vertical. */
  proof: Proof | null;
}

export const industries: Industry[] = [
  {
    slug: 'restaurants',
    name: 'Cafés & Restaurants',
    blurb: 'Make it easier for customers to discover, browse, and order.',
    deliverables: [
      'Restaurant or café website',
      'Digital menu',
      'Opening hours, location and contact',
      'Table and event enquiry forms',
    ],
    proof: { kind: 'site', path: '/coffee-cups' },
  },
  {
    slug: 'salons-and-spas',
    name: 'Salons, Spas & Beauty',
    blurb: 'Turn discovery into appointments.',
    deliverables: [
      'Service and price lists',
      'Staff and location information',
      'Appointment requests and booking integrations',
      'WhatsApp enquiries and offer pages',
    ],
    proof: { kind: 'site', path: '/hair-adore' },
  },
  {
    slug: 'retail-and-boutiques',
    name: 'Retail & Boutiques',
    blurb: 'Bring your products online.',
    deliverables: [
      'Product catalogue',
      'Brand and collection pages',
      'Product enquiries',
      'Order and sales workflows',
    ],
    proof: { kind: 'product', path: '/analytical-register' },
  },
  {
    slug: 'clinics-and-healthcare',
    name: 'Clinics & Healthcare',
    blurb: 'Help patients find the information they need.',
    deliverables: [
      'Clinic and practitioner profiles',
      'Services and timings',
      'Appointment requests',
      'Location and contact information',
    ],
    proof: null,
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    blurb: 'Present properties clearly and capture better enquiries.',
    deliverables: [
      'Property listings',
      'Project pages',
      'Enquiry and lead forms',
      'Location and amenity details',
    ],
    proof: null,
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    blurb: 'Build trust before the first conversation.',
    deliverables: [
      'Professional website',
      'Service pages',
      'Lead-generation landing pages',
      'Appointment requests',
    ],
    proof: { kind: 'product', path: '/stock-screener' },
  },
  {
    slug: 'home-services',
    name: 'Home & Local Services',
    blurb: 'Help nearby customers find and contact you.',
    deliverables: [
      'Service-area pages',
      'Quote-request forms',
      'Click-to-call and WhatsApp',
      'Work galleries',
    ],
    proof: null,
  },
  {
    slug: 'b2b',
    name: 'Manufacturers, Distributors & Wholesalers',
    blurb: 'Make your catalogue and order process easier to manage.',
    deliverables: [
      'Product and specification catalogues',
      'Business enquiry forms',
      'Customer and distributor portals',
      'Order workflows and reporting',
    ],
    proof: null,
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
