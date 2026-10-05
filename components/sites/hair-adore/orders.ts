import { services, stylists, type ServiceCategory } from './data';

export const teamNames: string[] = stylists.map((s) => s.name);

export const categoryLabels: Record<ServiceCategory, string> = {
  women: 'For Her',
  unisex: 'For Everyone',
  men: 'For Him',
};

export interface CatalogItem {
  key: string;
  name: string;
  amount: number;
  category: ServiceCategory;
}

export const catalog: CatalogItem[] = (Object.keys(services) as ServiceCategory[]).flatMap(
  (category) => services[category].map((s) => ({ key: `${category}::${s.name}`, name: s.name, amount: s.amount, category })),
);

const catalogMap = new Map(catalog.map((c) => [c.key, c]));

export type Gender = 'Male' | 'Female' | 'Other';

export interface OrderPerson {
  name: string;
  gender: Gender;
  services: string[]; // catalog keys
}

export interface Order {
  id: string;
  date: string; // ISO yyyy-mm-dd
  customer: { name: string; phone: string; email: string };
  people: OrderPerson[];
  team?: string[]; // stylist names who worked on this order
  total: number;
}

export function orderTotal(serviceKeys: string[]): number {
  return serviceKeys.reduce((sum, k) => sum + (catalogMap.get(k)?.amount ?? 0), 0);
}

export function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function newOrderId(): string {
  return 'HA' + Date.now().toString(36).toUpperCase();
}

// ---------- CSV ----------

const CSV_HEADER = ['order_id', 'date', 'customer_name', 'phone', 'email', 'person_name', 'person_gender', 'service', 'category', 'price', 'team'];

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

export function ordersToCsv(orders: Order[]): string {
  const lines = [CSV_HEADER.join(',')];
  for (const o of orders) {
    for (const p of o.people) {
      for (const key of p.services) {
        const item = catalogMap.get(key);
        if (!item) continue;
        lines.push(
          [
            o.id, o.date, o.customer.name, o.customer.phone, o.customer.email,
            p.name, p.gender, item.name, categoryLabels[item.category], String(item.amount),
            (o.team ?? []).join('; '),
          ].map(csvEscape).join(','),
        );
      }
    }
  }
  return lines.join('\n');
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

export function csvToOrders(text: string): Order[] {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const required = ['order_id', 'date', 'customer_name', 'person_name', 'service'];
  if (required.some((r) => idx(r) === -1)) throw new Error('Missing required CSV columns');

  const byId = new Map<string, Order>();
  const keyByName = new Map(catalog.map((c) => [c.name, c.key]));

  for (const row of rows.slice(1)) {
    const id = row[idx('order_id')]?.trim();
    if (!id) continue;
    const personName = row[idx('person_name')]?.trim() ?? '';
    const serviceName = row[idx('service')]?.trim() ?? '';
    const serviceKey = keyByName.get(serviceName);
    if (!serviceKey) continue;

    let order = byId.get(id);
    if (!order) {
      order = {
        id,
        date: row[idx('date')]?.trim() ?? '',
        customer: {
          name: row[idx('customer_name')]?.trim() ?? '',
          phone: row[idx('phone')]?.trim() ?? '',
          email: row[idx('email')]?.trim() ?? '',
        },
        people: [],
        total: 0,
      };
      byId.set(id, order);
    }
    const gender = (['Male', 'Female', 'Other'] as const).find((g) => g === row[idx('person_gender')]?.trim()) ?? 'Other';
    let person = order.people.find((p) => p.name === personName && p.gender === gender);
    if (!person) {
      person = { name: personName, gender, services: [] };
      order.people.push(person);
    }
    if (!person.services.includes(serviceKey)) person.services.push(serviceKey);

    const teamIdx = idx('team');
    if (teamIdx !== -1) {
      const names = (row[teamIdx] ?? '').split(';').map((n) => n.trim()).filter(Boolean);
      order.team = [...new Set([...(order.team ?? []), ...names])];
    }
  }

  const orders = [...byId.values()];
  for (const o of orders) o.total = orderTotal(o.people.flatMap((p) => p.services));
  return orders.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---------- WhatsApp / Email ----------

export function orderSummaryText(order: Order): string {
  const lines = [
    `Hair Adore — Order ${order.id}`,
    `Date: ${order.date}`,
    `Customer: ${order.customer.name}`,
    '',
  ];
  for (const p of order.people) {
    lines.push(`${p.name || 'Walk-in'} (${p.gender}):`);
    for (const key of p.services) {
      const item = catalogMap.get(key);
      if (item) lines.push(`  • ${item.name} — ${formatINR(item.amount)}`);
    }
    lines.push('');
  }
  lines.push(`TOTAL: ${formatINR(order.total)}`);
  if (order.team?.length) lines.push(`Styled by: ${order.team.join(', ')}`);
  lines.push('Thank you for choosing Hair Adore!');
  return lines.join('\n');
}

export function buildWhatsAppUrl(order: Order): string {
  const digits = order.customer.phone.replace(/\D/g, '').replace(/^0+/, '');
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(orderSummaryText(order))}`;
}

export function buildMailtoUrl(order: Order): string {
  const subject = encodeURIComponent(`Hair Adore — Your order ${order.id}`);
  const body = encodeURIComponent(orderSummaryText(order));
  return `mailto:${encodeURIComponent(order.customer.email)}?subject=${subject}&body=${body}`;
}

export function downloadCsv(orders: Order[]) {
  const blob = new Blob(['\ufeff' + ordersToCsv(orders)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hair-adore-orders.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Demo data ----------

const k = (c: ServiceCategory, n: string) => `${c}::${n}`;

const pad2 = (n: number) => String(n).padStart(2, '0');
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const demoSeed: Order[] = [
  {
    id: 'HADEMO01', date: daysAgo(0),
    customer: { name: 'Sneha Kulkarni', phone: '9822011223', email: 'sneha.k@example.com' },
    people: [
      { name: 'Sneha Kulkarni', gender: 'Female', services: [k('women', 'French Balayage'), k('unisex', 'Hair Spa (L’Oréal/Schwarzkopf)')] },
      { name: 'Rohit Kulkarni', gender: 'Male', services: [k('men', 'Precision Haircut'), k('men', 'Beard Grooming & Spa')] },
    ],
    team: ['Priya Sharma', 'Vikram Desai'],
    total: 0,
  },
  {
    id: 'HADEMO02', date: daysAgo(0),
    customer: { name: 'Ananya Deshpande', phone: '9970045521', email: 'ananya.d@example.com' },
    people: [
      { name: 'Ananya Deshpande', gender: 'Female', services: [k('women', 'Global Hair Colour'), k('unisex', 'Glass Hair Treatment')] },
    ],
    team: ['Priya Sharma'],
    total: 0,
  },
  {
    id: 'HADEMO03', date: daysAgo(1),
    customer: { name: 'Farhan Shaikh', phone: '9890556677', email: 'farhan.s@example.com' },
    people: [
      { name: 'Farhan Shaikh', gender: 'Male', services: [k('men', 'Skin Fade & Taper'), k('men', "Men's Facial")] },
      { name: 'Ayesha Shaikh', gender: 'Female', services: [k('women', 'Advanced Haircut'), k('unisex', 'Manicure & Pedicure')] },
    ],
    team: ['Vikram Desai', 'Aarav Mehta'],
    total: 0,
  },
  {
    id: 'HADEMO04', date: daysAgo(2),
    customer: { name: 'Meera Iyer', phone: '9765443321', email: 'meera.iyer@example.com' },
    people: [
      { name: 'Meera Iyer', gender: 'Female', services: [k('women', 'Bridal Makeup Package'), k('women', 'Keratin / Smoothing')] },
    ],
    team: ['Priya Sharma'],
    total: 0,
  },
  {
    id: 'HADEMO05', date: daysAgo(3),
    customer: { name: 'Kunal Bhosale', phone: '9923008811', email: 'kunal.b@example.com' },
    people: [
      { name: 'Kunal Bhosale', gender: 'Male', services: [k('men', 'Precision Haircut'), k('men', 'Anti-Dandruff Treatment')] },
    ],
    team: ['Aarav Mehta'],
    total: 0,
  },
  {
    id: 'HADEMO06', date: daysAgo(4),
    customer: { name: 'Ishita Rane', phone: '9822674455', email: 'ishita.r@example.com' },
    people: [
      { name: 'Ishita Rane', gender: 'Female', services: [k('women', 'VibGYOR Fashion Colours'), k('unisex', 'Hyaluronic Glossing')] },
      { name: 'Tanvi Rane', gender: 'Female', services: [k('unisex', 'Hair Spa (L’Oréal/Schwarzkopf)'), k('unisex', 'Body Detan Pack')] },
    ],
    team: ['Priya Sharma', 'Aarav Mehta'],
    total: 0,
  },
  {
    id: 'HADEMO07', date: daysAgo(6),
    customer: { name: 'Aditya Joshi', phone: '9011223344', email: 'aditya.j@example.com' },
    people: [
      { name: 'Aditya Joshi', gender: 'Male', services: [k('men', "Men's Global Colour"), k('men', 'Head Massage & Oil Therapy')] },
    ],
    team: ['Vikram Desai'],
    total: 0,
  },
  {
    id: 'HADEMO08', date: daysAgo(8),
    customer: { name: 'Pooja Nair', phone: '9898765432', email: 'pooja.nair@example.com' },
    people: [
      { name: 'Pooja Nair', gender: 'Female', services: [k('women', 'Hair Extensions'), k('unisex', 'Party & Editorial Styling')] },
    ],
    team: ['Aarav Mehta'],
    total: 0,
  },
  {
    id: 'HADEMO09', date: daysAgo(11),
    customer: { name: 'Rehan Patan', phone: '9876501234', email: 'rehan.p@example.com' },
    people: [
      { name: 'Rehan Patan', gender: 'Male', services: [k('men', 'Beard Grooming & Spa')] },
      { name: 'Sana Patan', gender: 'Female', services: [k('women', 'French Blending / Highlights'), k('unisex', 'Dia Light Gloss / Toning')] },
    ],
    team: ['Vikram Desai', 'Priya Sharma'],
    total: 0,
  },
  {
    id: 'HADEMO10', date: daysAgo(15),
    customer: { name: 'Vedant Kulkarni', phone: '9970012345', email: 'vedant.k@example.com' },
    people: [
      { name: 'Vedant Kulkarni', gender: 'Male', services: [k('men', 'Skin Fade & Taper'), k('unisex', 'Manicure & Pedicure')] },
    ],
    team: ['Vikram Desai'],
    total: 0,
  },
];

export const demoOrders: Order[] = demoSeed.map((o) => ({
  ...o,
  total: orderTotal(o.people.flatMap((p) => p.services)),
}));
