// components/sites/analytical-register/types.ts

/**
 * The screens of the workspace. The introduction points at these by id, so a
 * capability can only claim a screen that actually exists — `test/
 * analytical-register-overview.test.ts` resolves every one of them against the
 * navigation in OrderBook.tsx.
 */
export type ObView = 'overview' | 'register' | 'orders' | 'analytics' | 'menu' | 'settings';

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  accent: string; // hex, e.g. '#B5651D'
  gstNumber: string;
  phone: string; // digits for the wa.me sender (may include country code)
  currency: string; // '₹'
  gstRate: number; // 0.05
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  note?: string;
  /** Cafe photo path, shared with the Brewery Cafe menu. */
  src?: string;
  active: boolean;
}

export interface Customer {
  phone: string; // natural key, digits only
  name: string;
  label?: string;
}

export interface OrderLine {
  menuItemId: string;
  name: string; // snapshot at bill time
  qty: number;
  unitPrice: number; // snapshot at bill time
}

export type OrderStatus = 'paid' | 'held';

export interface Order {
  id: string;
  billNumber: number; // sequential per brand
  createdAt: string; // ISO
  lines: OrderLine[];
  subtotal: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  total: number;
  customer?: Customer;
  note?: string;
  status: OrderStatus;
  brandName: string; // snapshot
  gstRate: number; // snapshot
  currency: string; // snapshot
}

export interface Totals {
  subtotal: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  total: number;
}
