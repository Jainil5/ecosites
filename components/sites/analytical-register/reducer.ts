// components/sites/analytical-register/reducer.ts
import { defaultBrand, defaultMenu } from './menu-data';
import { computeTotals } from './pricing';
import { seedOrders } from './seed';
import type { Brand, Customer, MenuItem, Order, OrderLine } from './types';

export interface StoreState {
  brand: Brand;
  menu: MenuItem[];
  customers: Customer[];
  orders: Order[];
  ticket: OrderLine[];
  ticketCustomer?: Customer;
  ticketNote?: string;
}

export type Action =
  | { type: 'hydrate'; state: StoreState }
  | { type: 'add-line'; item: MenuItem }
  | { type: 'set-qty'; menuItemId: string; qty: number }
  | { type: 'remove-line'; menuItemId: string }
  | { type: 'clear-ticket' }
  | { type: 'set-ticket-customer'; customer?: Customer }
  | { type: 'set-ticket-note'; note: string }
  | { type: 'create-order'; id: string; now: string }
  | { type: 'upsert-item'; item: MenuItem }
  | { type: 'archive-item'; id: string }
  | { type: 'update-brand'; patch: Partial<Brand> }
  | { type: 'reset' };

const nextBill = (orders: Order[]) =>
  orders.reduce((max, o) => Math.max(max, o.billNumber), 0) + 1;

export function initState(orders?: Order[]): StoreState {
  const brand = defaultBrand;
  return {
    brand,
    menu: defaultMenu,
    customers: [],
    orders: orders ?? seedOrders(defaultMenu, brand),
    ticket: [],
  };
}

export function orderbookReducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'add-line': {
      const existing = state.ticket.find((l) => l.menuItemId === action.item.id);
      const ticket = existing
        ? state.ticket.map((l) => (l.menuItemId === action.item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...state.ticket, { menuItemId: action.item.id, name: action.item.name, qty: 1, unitPrice: action.item.price }];
      return { ...state, ticket };
    }
    case 'set-qty': {
      if (action.qty <= 0) return { ...state, ticket: state.ticket.filter((l) => l.menuItemId !== action.menuItemId) };
      return { ...state, ticket: state.ticket.map((l) => (l.menuItemId === action.menuItemId ? { ...l, qty: action.qty } : l)) };
    }
    case 'remove-line':
      return { ...state, ticket: state.ticket.filter((l) => l.menuItemId !== action.menuItemId) };
    case 'clear-ticket':
      return { ...state, ticket: [], ticketCustomer: undefined, ticketNote: undefined };
    case 'set-ticket-customer':
      return { ...state, ticketCustomer: action.customer };
    case 'set-ticket-note':
      return { ...state, ticketNote: action.note };
    case 'create-order': {
      if (state.ticket.length === 0) return state;
      const totals = computeTotals(state.ticket, state.brand.gstRate);
      const order: Order = {
        id: action.id,
        billNumber: nextBill(state.orders),
        createdAt: action.now,
        lines: state.ticket,
        ...totals,
        customer: state.ticketCustomer,
        note: state.ticketNote,
        status: 'paid',
        brandName: state.brand.name,
        gstRate: state.brand.gstRate,
        currency: state.brand.currency,
      };
      const customers = state.ticketCustomer
        ? [
            ...state.customers.filter((c) => c.phone !== state.ticketCustomer!.phone),
            state.ticketCustomer,
          ]
        : state.customers;
      return {
        ...state,
        orders: [...state.orders, order],
        customers,
        ticket: [],
        ticketCustomer: undefined,
        ticketNote: undefined,
      };
    }
    case 'upsert-item': {
      const exists = state.menu.some((m) => m.id === action.item.id);
      return {
        ...state,
        menu: exists
          ? state.menu.map((m) => (m.id === action.item.id ? action.item : m))
          : [...state.menu, action.item],
      };
    }
    case 'archive-item':
      return { ...state, menu: state.menu.map((m) => (m.id === action.id ? { ...m, active: false } : m)) };
    case 'update-brand':
      return { ...state, brand: { ...state.brand, ...action.patch } };
    case 'reset':
      return initState();
    default:
      return state;
  }
}
