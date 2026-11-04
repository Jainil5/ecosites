// components/sites/analytical-register/menu-data.ts
import { menuGroups } from '../brewery/menu';
import type { Brand, MenuItem } from './types';

// The register runs on the same menu the Brewery demo sells.
export const defaultBrand: Brand = {
  id: 'brewery',
  name: 'Brewery',
  tagline: 'Brews, plates and cold pours',
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
