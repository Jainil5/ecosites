// components/sites/analytical-register/menu-data.ts
import { menuGroups } from '../coffee-cups/menu';
import type { Brand, MenuItem } from './types';

// The register runs on the same menu Coffee Cups sells, item for item.
export const defaultBrand: Brand = {
  id: 'coffee-cups',
  name: 'Coffee Cups',
  tagline: 'Coffee, food and cold pours',
  accent: '#B5651D',
  gstNumber: '27ABCDE1234F1Z5',
  phone: '919876543210',
  currency: '₹',
  gstRate: 0.05,
};

export const defaultMenu: MenuItem[] = menuGroups.flatMap((g) =>
  g.items.map((i) => ({
    id: i.id,
    name: i.name,
    category: g.title,
    price: i.amount,
    note: i.note,
    src: i.src,
    active: true,
  })),
);
