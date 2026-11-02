// components/sites/analytical-register/overview-data.ts
import type { ObView } from './types';

/**
 * What OrderBook is, written the way an owner reads it: the job each part takes
 * off them, not the technical name for it. This is the product's full scope, so
 * it is deliberately wider than the tabs behind it — `live` marks the
 * capabilities this build actually runs, and `SCOPE` says plainly which parts
 * are the work done around a business rather than on this page.
 */

export interface DayStep {
  /** Counter clock, not a timestamp — the reader is picturing a trading day. */
  clock: string;
  title: string;
  detail: string;
}

export interface Capability {
  name: string;
  /** One line: what stops being a problem once this is running. */
  line: string;
  items: string[];
  /** The screen in this build that proves it, when there is one. */
  live?: ObView;
}

export interface Audience {
  name: string;
  detail: string;
}

export interface ScopeColumn {
  heading: string;
  note: string;
  items: string[];
}

/** The workspace tabs, in the order a first-time visitor should meet them. The
 * header navigates on this list and the introduction links into it by id, so a
 * claim can only point at a screen that is really there. */
export const TABS: { id: ObView; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'register', label: 'Register' },
  { id: 'orders', label: 'Orders' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'menu', label: 'Menu' },
  { id: 'settings', label: 'Settings' },
];

export const HERO = {
  eyebrow: 'Order management for cafés, salons and kitchens',
  headline: 'One system runs the whole day — order to bill, kitchen to close, numbers to decision.',
  body: 'OrderBook is the ordering, billing, kitchen and reporting system we build around your counter. The tab your staff takes orders on, the bill that lands on the guest’s WhatsApp, the screen the kitchen reads, and the numbers you look at on the way home — one system, one menu, one set of figures. Below, three counters built on it: a café till, a salon book and a live-fire kitchen with a pantry shelf. Open one and it is yours to drive.',
  honesty: 'Nothing here is a picture of a product. This is the working system on a full trading book of its own — tap it, bill an order, and the numbers move. No sign-up, no card, nothing installed.',
};

/**
 * The counters a visitor can actually take over. Each one is the same register
 * on a different trade, so the difference between them is the catalogue, the
 * tax split and the shape of the day — not the software.
 */
export const COUNTERS = {
  kicker: 'Pick the counter you run',
  title: 'Three businesses, one system behind them',
  lead: 'Same register, same order book, same analytics. What changes is what is being sold, what tax it carries and when the trade happens. Open one — bill an order, add an item, read the numbers back.',
};

/** A trading day, start to finish, in the order the owner actually meets it. */
export const DAY: DayStep[] = [
  {
    clock: '07:40',
    title: 'The day opens',
    detail:
      'Yesterday closes before today starts: cash float entered, staff signed in, and the menu that is live today — including what the market did not deliver.',
  },
  {
    clock: '09:15',
    title: 'Guests are seated',
    detail:
      'Tables and sections on your floor plan, a booking list you can see filling up, and a QR menu on every table that opens the same catalogue the counter sees.',
  },
  {
    clock: '10:30',
    title: 'The order reaches the kitchen',
    detail:
      'The KOT prints at the pass and shows on the kitchen screen with courses, modifiers and prep time. Mark an item out and it leaves the tab before the next guest asks for it.',
  },
  {
    clock: '13:00',
    title: 'The bill',
    detail:
      'Split by person or by item, offer applied, service charge and round-off settled, CGST and SGST worked out. The receipt goes to WhatsApp before the guest stands up.',
  },
  {
    clock: '16:00',
    title: 'The quiet hour',
    detail:
      'Orders from your own online store and the aggregator apps land in the same queue, fire from the same kitchen, and draw from the same stock count.',
  },
  {
    clock: '22:30',
    title: 'Closing the shift',
    detail:
      'Cash against UPI against card, tips, discounts given, voids with a reason, and what each server billed — one Z-report, no tally at the kitchen table.',
  },
  {
    clock: 'Next morning',
    title: 'Reading the day back',
    detail:
      'Revenue, average bill, top and slow items, category mix, weekday against weekend, and the two hours you were one pair of hands short.',
  },
];

/** The product in twelve groups — what PetPooja-style owners compare you against. */
export const CAPABILITIES: Capability[] = [
  {
    name: 'Ordering and billing',
    line: 'The screen your staff learns in ten minutes and never needs a manual for.',
    items: [
      'Tap-through menu with categories, photos, modifiers and add-ons',
      'Hold a table, add a course, merge two bills, split by person',
      'Discounts, complimentary lines, service charge and round-off',
      'Tax-correct bill on every sale — printed, or sent on WhatsApp',
    ],
    live: 'register',
  },
  {
    name: 'Tables, floor and QR menu',
    line: 'Your floor plan the way the room actually sits.',
    items: [
      'Layout editor for tables, sections and seating capacity',
      'QR menu per table — the guest orders from their own phone',
      'Bookings with a no-show you can see before you cook for it',
      'Live order count and running total per table',
    ],
  },
  {
    name: 'Kitchen — KOT and display',
    line: 'The kitchen gets the order the second it is taken, not when someone walks over.',
    items: [
      'KOT printing per station — grill, tandoor, bar, cold',
      'Kitchen display with firing sequence and prep timers',
      'Course-wise release, and item-out in one tap',
      'Void and re-fire with a reason kept on record',
    ],
  },
  {
    name: 'Menu and pricing',
    line: 'Change a rate, hide an item, run a special — yourself, with no developer in the loop.',
    items: [
      'Items, categories, variants, modifiers and add-ons',
      'Scheduled pricing: happy hour, weekday set menu, festival combo',
      'Mark an item sold out across every outlet at once',
      'Every change time-stamped, so a price argument has an answer',
    ],
    live: 'menu',
  },
  {
    name: 'Customers and loyalty',
    line: 'Every bill quietly builds the list you can sell to again.',
    items: [
      'Customer created from the bill, with their full order history',
      'Points, tiers and a prepaid wallet they will come back for',
      'Revisit and gone-quiet lists you can act on this week',
      'Receipts, offers and birthday messages on WhatsApp',
    ],
    live: 'orders',
  },
  {
    name: 'Your own store and the aggregator inbox',
    line: 'Your link and the apps, on one order screen.',
    items: [
      'Ordering page on your own domain, with no commission on it',
      'Swiggy, Zomato and the rest in a single order queue',
      'One menu and one stock count serving every channel',
      'Pickup, delivery and order status tracked in the same place',
    ],
  },
  {
    name: 'Payments',
    line: 'Money in, without the argument at close.',
    items: [
      'Cash, UPI, card and wallet split across one bill',
      'Payment terminal and static QR settled against the bill',
      'Tips and service charge accounted per shift',
      'Settlement report matched to the bank credit',
    ],
  },
  {
    name: 'Inventory and recipe costing',
    line: 'What a plate actually costs you, not what you hope it costs.',
    items: [
      'Recipe and portion cost for every item on the menu',
      'Stock drawn as the KOT fires, not counted by hand at night',
      'Purchases, inwarding and vendor bills in the same books',
      'Wastage logged at the station and food cost % by day',
    ],
  },
  {
    name: 'Staff, roles and shifts',
    line: 'Who did what, who was here, and who is allowed to see the cost price.',
    items: [
      'Role-based access — a cashier’s screen is not a manager’s',
      'Clock-in, breaks and attendance beside the sales they made',
      'Per-server discounts given, voids and bills held',
      'Shift close with cash declaration and a printed Z-report',
    ],
  },
  {
    name: 'Reports and analytics',
    line: 'The day read back to you, instead of a PDF you mean to open later.',
    items: [
      'Revenue, average bill, items sold and bills per day',
      'Top items, slow movers, category mix, weekday against weekend',
      'Hourly heatmap that tells you when to roster an extra pair',
      'Accountant-ready tax export for the quarter',
    ],
    live: 'analytics',
  },
  {
    name: 'Many outlets and franchise',
    line: 'One owner, ten counters, no spreadsheet reconciliation.',
    items: [
      'Central menu with a per-outlet price override',
      'Central kitchen, stock transfers and inter-branch orders',
      'Branch-wise comparison and consolidated profit and loss',
      'Franchise logins that still leave the data yours',
    ],
  },
  {
    name: 'Hardware, offline and your data',
    line: 'It keeps billing when the internet does not.',
    items: [
      'Android and Windows terminals, thermal printers, scanner, drawer',
      'Offline queue — the bill prints now and syncs when the line returns',
      'Every business on its own isolated, encrypted account',
      'Your figures exported whenever you ask for them',
    ],
  },
];

/** Who the build is bent to fit. Same engine, different counter. */
export const AUDIENCES: Audience[] = [
  { name: 'Café and coffee bar', detail: 'Quick bills, regulars on first-name terms, a counter that never stops.' },
  { name: 'Independent restaurant', detail: 'Tables, courses and a kitchen that runs without anyone shouting.' },
  { name: 'Cloud kitchen', detail: 'Aggregator inbox, prep timers and stock counts without a front of house.' },
  { name: 'QSR and chain', detail: 'The same menu and the same rules on every till, every day.' },
  { name: 'Bakery and sweet shop', detail: 'Weighted items, boxes, festival advance orders and counter billing.' },
  { name: 'Bar and lounge', detail: 'Per-pour stock, happy-hour pricing and a tab that closes clean.' },
  { name: 'Salon, studio or shop', detail: 'A service menu or a shelf — the same register, re-skinned to your trade.' },
];

/**
 * The honest split. Everything claimed above is what the system we build does;
 * this build runs a deliberate slice of it, on a trading book of its own.
 */
export const SCOPE: ScopeColumn[] = [
  {
    heading: 'Running here, on this build',
    note: 'Click any of it. It is the real logic, not a picture of it.',
    items: [
      'Three counters to drive — café till, salon book, kitchen and pantry shelf, each with its own catalogue and tax split',
      'The register: tap items onto a ticket, change quantities, add the guest',
      'Tax split, round-off and the finished bill, sent on WhatsApp',
      'Menu manager: add an item, reprice it, archive it — instantly',
      'The order book: every bill, searchable by guest, item or bill number',
      'Analytics: revenue, average bill, top items, category mix, weekday against weekend, hourly heatmap — hover a day, click an hour, filter to a category and export what you see',
      'Rebranding: your business name, accent colour and sender number, applied live',
      'Everything you change is saved on the device you are using',
    ],
  },
  {
    heading: 'In the build, not on this page',
    note: 'These are the parts we wire up around your business.',
    items: [
      'Kitchen printing and the display screen at the pass',
      'Floor plan, table management, bookings and QR self-ordering',
      'Your own online store and the aggregator order inbox',
      'Inventory, recipe costing, purchases and wastage',
      'Staff roles, attendance, shift close and Z-report',
      'Loyalty, wallet and WhatsApp campaigns to your customer list',
      'Multi-outlet consolidation and franchise reporting',
      'Payment terminals, offline queue and per-account encryption',
    ],
  },
];
