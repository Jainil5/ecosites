// components/sites/analytical-register/editions.ts
import { defaultBrand, defaultMenu } from './menu-data';
import type { Brand, MenuItem } from './types';
import type { SeedProfile } from './seed';
import { services } from '../hair-adore/data';
import { products as larder } from '../ember-larder/data';

/**
 * OrderBook is one system wearing three counters. Each edition is the same
 * register, order book and analytics — what changes is the catalogue, the tax
 * split and the shape of the trading day, because a café, a salon and a
 * live-fire kitchen do not sell the same way.
 *
 * The catalogues are the ones already built in this app: the Coffee Cups menu,
 * the Hair Adore service list and the Ember Larder fire-and-pantry shelf. That
 * keeps every edition's numbers real to its own business instead of invented.
 */

export type EditionId = 'cafe' | 'salon' | 'larder';

export interface Edition {
  id: EditionId;
  /** How the owner refers to it on the introduction. */
  label: string;
  /** The trade this counter is bent for. */
  kicker: string;
  /** One line: what this edition does that the others do not need. */
  line: string;
  bullets: string[];
  brand: Brand;
  menu: MenuItem[];
  /** How this business actually trades — bill volume and opening hours. */
  profile: SeedProfile;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const salonSections: { key: keyof typeof services; category: string }[] = [
  { key: 'women', category: 'For Her' },
  { key: 'unisex', category: 'For Everyone' },
  { key: 'men', category: 'For Him' },
];

const salonMenu: MenuItem[] = salonSections.flatMap(({ key, category }) =>
  services[key].map((s) => ({
    id: slug(s.name),
    name: s.name,
    category,
    price: s.amount,
    note: s.note,
    active: true,
  })),
);

const larderMenu: MenuItem[] = larder.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.group === 'fire' ? 'From the fire' : 'The pantry',
  price: p.price,
  note: p.note,
  src: p.image,
  active: true,
}));

export const editions: Edition[] = [
  {
    id: 'cafe',
    label: 'OrderBook for cafés',
    kicker: 'Coffee, food and cold pours',
    line: 'A counter that never stops: tap a pour onto the ticket, bill it, and the regular is already in the book.',
    bullets: [
      'Small bills, many of them, morning to early evening',
      'Photos on every tile so the till reads like the board above the bar',
      '5% GST split on the bill, rounded once on the total',
    ],
    brand: defaultBrand,
    menu: defaultMenu,
    profile: {
      weekday: 9,
      weekend: 14,
      openHour: 8,
      span: 12,
      maxLines: 3,
      weights: { Coffee: 3, Food: 2, Beverages: 1 },
      customerRate: 0.55,
    },
  },
  {
    id: 'salon',
    label: 'OrderBook for salons and studios',
    kicker: 'Cuts, colour and grooming',
    line: 'A service counter: big tickets, artist-led, where the bill follows the chair and the tax is on the service.',
    bullets: [
      'Services instead of dishes — colour, spa, bridal, grooming',
      'Fewer bills at a much higher average value',
      '18% GST on services, split CGST and SGST on every bill',
    ],
    brand: {
      id: 'hair-adore',
      name: 'Hair Adore',
      tagline: 'Cuts, colour and grooming',
      accent: '#C1613C',
      gstNumber: '27ABCDE1234F1Z5',
      phone: '919876543210',
      currency: '₹',
      gstRate: 0.18,
    },
    menu: salonMenu,
    profile: {
      weekday: 4,
      weekend: 7,
      openHour: 10,
      span: 10,
      maxLines: 2,
      weights: { 'For Her': 3, 'For Everyone': 2, 'For Him': 2 },
      customerRate: 0.85,
    },
  },
  {
    id: 'larder',
    label: 'OrderBook for kitchens and shelves',
    kicker: 'Live fire and a pantry shelf',
    line: 'One ticket for a plate cooked over the fire and a jar taken off the shelf — dining room and retail, billed together.',
    bullets: [
      'Plates and jars on the same bill, each in its own category',
      'Evening-weighted trade with a real weekend peak',
      'Sold-out marking at the pass before the next table asks',
    ],
    brand: {
      id: 'ember-larder',
      name: 'Ember Larder',
      tagline: 'Live fire and a pantry shelf',
      accent: '#FF6A3D',
      gstNumber: '27ABCDE1234F1Z5',
      phone: '919876543210',
      currency: '₹',
      gstRate: 0.05,
    },
    menu: larderMenu,
    profile: {
      weekday: 7,
      weekend: 13,
      openHour: 12,
      span: 11,
      maxLines: 3,
      weights: { 'From the fire': 3, 'The pantry': 1 },
      customerRate: 0.6,
    },
  },
];

export const defaultEdition: EditionId = 'cafe';

export function editionById(id: EditionId | undefined): Edition {
  return editions.find((e) => e.id === id) ?? editions[0];
}

/** Only the café counter shares a bridge with the Coffee Cups ordering page. */
export const bridgesToCafe = (id: EditionId) => id === 'cafe';
