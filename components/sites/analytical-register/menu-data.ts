// components/sites/analytical-register/menu-data.ts
import type { Brand, MenuItem } from './types';

export const defaultBrand: Brand = {
  id: 'ob-cafe',
  name: 'Bean & Brunch',
  tagline: 'Coffee, bakes and all-day plates',
  accent: '#B5651D',
  gstNumber: '27ABCDE1234F1Z5',
  phone: '919876543210',
  currency: '₹',
  gstRate: 0.05,
};

// Realistic cafe catalogue. Prices in whole rupees.
const raw: Array<[string, string, string, number, string?]> = [
  ['c-appu', 'Cappuccino', 'Coffee', 180],
  ['c-latte', 'Café Latte', 'Coffee', 200],
  ['c-espr', 'Espresso', 'Coffee', 130],
  ['c-cold', 'Cold Brew', 'Coffee', 220, '12-hour steeped'],
  ['c-mocha', 'Mocha', 'Coffee', 230],
  ['t-masala', 'Masala Chai', 'Tea', 90],
  ['t-green', 'Green Tea', 'Tea', 80],
  ['t-lemon', 'Lemon Honey Tea', 'Tea', 110],
  ['b-bagel', 'Butter Bagel', 'Bakes', 120],
  ['b-crois', 'Almond Croissant', 'Bakes', 190],
  ['b-banana', 'Banana Bread', 'Bakes', 150],
  ['b-cookie', 'Choco Cookie', 'Bakes', 80],
  ['f-sandw', 'Grilled Veg Sandwich', 'Food', 240],
  ['f-pasta', 'Arrabiata Pasta', 'Food', 320],
  ['f-panini', 'Paneer Panini', 'Food', 280],
  ['f-caesar', 'Caesar Salad', 'Food', 300, 'add chicken +60'],
  ['d-brownie', 'Walnut Brownie', 'Desserts', 170],
  ['d-cheese', 'Basque Cheesecake', 'Desserts', 260],
];

export const defaultMenu: MenuItem[] = raw.map(([id, name, category, price, note]) => ({
  id, name, category, price, note, active: true,
}));
