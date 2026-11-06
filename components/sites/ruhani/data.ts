/**
 * Ruhani — a home-made jewellery maker, and the whole webapp built around her
 * bench.
 *
 * The maker is a studio build, so the details stay untraceable on purpose: the
 * mail address is on the reserved `.example` TLD, the lane names no real
 * corner, and every rupee figure is a working price for the ticket, not a
 * quote from a shop a reader could walk into.
 *
 * Prices are inclusive of the 3% GST that Indian jewellery is sold on, and the
 * basket shows what that 3% actually is rather than adding it at the end —
 * which is the difference between a till a customer trusts and one they close.
 */
export const maker = {
  name: 'Ruhani',
  kicker: 'Handmade jewellery, one piece at a time',
  line: 'Drawn at the bench, finished by hand, sent in a box you can keep.',
  intro:
    'Ruhani is a single workbench in a Jaipur apartment: one saw, one file, a magnifier and about nine hundred hours a year. Everything on this page was made there, in small numbers, and the website is the shop front she could not build herself.',
  story:
    'She learned to set stones from her father-in-law, who ran a karigar counter in Johari Bazaar for thirty-one years, and started selling to friends in 2019 with a notebook of orders on her phone. By 2022 the notebook had four hundred names in it and no way to show anyone what was ready today. Nothing about the work changed when the site arrived: the same silver, the same hammer, the same 5–7 days. What changed is that the orders, the sizes and the reminders stopped living in her head.',
  email: 'hello@ruhani.example',
  // The house sample mobile — dial-shaped, and nobody's.
  whatsapp: '919876543210',
  whatsappDisplay: '+91 98765 43210',
  studio: 'A second-floor flat off the old gem market — the blue door with the marigold pot',
  hallmarkNote:
    'Solid gold pieces are BIS hallmarked at 585 before they leave the bench. Silver is stamped 925.',
  instagram: '#',
} as const;

export type Category = 'everyday' | 'occasion' | 'heirloom';
export type Metal = 'silver' | 'vermeil' | 'gold';
export type Form =
  | 'stud'
  | 'hoop'
  | 'drop'
  | 'ring'
  | 'pendant'
  | 'bangle'
  | 'tikka'
  | 'jhumka'
  | 'chain'
  | 'cuff';

export interface Piece {
  slug: string;
  name: string;
  category: Category;
  /** What it is worn as, in the buyer's words. */
  type: string;
  metal: Metal;
  finish: string;
  stone: string | null;
  /** The drawing the card is built from. */
  form: Form;
  /** Rupees, inclusive of 3% GST. */
  price: number;
  /** Business days from order to dispatch. */
  lead: [number, number];
  /** The number a buyer needs before ordering: a size, a length or a weight. */
  measure: { label: string; options: string[] };
  note: string;
  care: string;
  /** Gold pieces carry the hallmark stamp; silver carries the 925. */
  stamp: string;
}

export const pieces: Piece[] = [
  {
    slug: 'chandni-studs',
    name: 'Chandni Studs',
    category: 'everyday',
    type: 'Stud earrings, the pair you never take off',
    metal: 'silver',
    finish: 'Polished 925 sterling silver',
    stone: 'White zirconia, 4mm round',
    form: 'stud',
    price: 1800,
    lead: [5, 7],
    measure: { label: 'Post', options: ['Standard 9mm', 'Long 12mm'] },
    note: 'Tiny moonlit discs, made to be slept in and forgotten about.',
    care: 'Hypoallergenic silver. Store in the pouch, keep perfume off the face side.',
    stamp: '925',
  },
  {
    slug: 'gulab-hoops',
    name: 'Gulab Hoops',
    category: 'everyday',
    type: 'Hoop earrings, 20mm',
    metal: 'vermeil',
    finish: '18K gold vermeil over 925 silver',
    stone: null,
    form: 'hoop',
    price: 3200,
    lead: [5, 7],
    measure: { label: 'Diameter', options: ['16mm', '20mm', '26mm'] },
    note: 'Rose-tinted hoops, drawn from the pink city more than from any garden.',
    care: 'The vermeil layer is 2.5 microns. Off before swimming, polish with the cloth.',
    stamp: '925',
  },
  {
    slug: 'neelam-drop',
    name: 'Neelam Drop',
    category: 'occasion',
    type: 'Drop earrings',
    metal: 'silver',
    finish: 'Oxidised 925 sterling silver',
    stone: 'Lab-grown blue sapphire, teardrop',
    form: 'drop',
    price: 4500,
    lead: [6, 8],
    measure: { label: 'Drop', options: ['32mm', '40mm'] },
    note: 'One sapphire tear on a hand-forged wire, hammered until it swings.',
    care: 'The oxidised finish darkens with wear — that is the finish, not a fault.',
    stamp: '925',
  },
  {
    slug: 'sitara-ring',
    name: 'Sitara Ring',
    category: 'everyday',
    type: 'Stackable band',
    metal: 'silver',
    finish: 'Hand-hammered 925 sterling silver',
    stone: null,
    form: 'ring',
    price: 2400,
    lead: [5, 7],
    measure: { label: 'Size', options: ['5', '6', '7', '8', '9'] },
    note: 'A hammered band that catches light like scattered stars. No two are alike.',
    care: 'The texture is the point. Resizable by any local jeweller.',
    stamp: '925',
  },
  {
    slug: 'panna-pendant',
    name: 'Panna Pendant',
    category: 'occasion',
    type: 'Pendant and chain',
    metal: 'vermeil',
    finish: '18K gold vermeil over 925 silver',
    stone: 'Green onyx, oval cabochon',
    form: 'pendant',
    price: 5800,
    lead: [7, 9],
    measure: { label: 'Chain', options: ['16in', '18in'] },
    note: 'An emerald-green stone in a minimal bezel, set low enough to wear with a collar.',
    care: 'Hold the chain away from hairspray. The bezel is snug, not glued.',
    stamp: '925',
  },
  {
    slug: 'kiran-bangle',
    name: 'Kiran Bangle',
    category: 'everyday',
    type: 'Rigid bangle',
    metal: 'silver',
    finish: 'Polished 925 sterling silver',
    stone: null,
    form: 'bangle',
    price: 3600,
    lead: [6, 8],
    measure: { label: 'Inner diameter', options: ['58mm', '62mm', '66mm'] },
    note: 'A slim circle with a hand-engraved sunburst, cut to be worn in stacks of three.',
    care: 'Store flat so it does not bend out of true.',
    stamp: '925',
  },
  {
    slug: 'aarohi-tikka',
    name: 'Aarohi Tikka',
    category: 'occasion',
    type: 'Maang tikka',
    metal: 'vermeil',
    finish: '18K gold vermeil over 925 silver',
    stone: 'White zirconia cluster',
    form: 'tikka',
    price: 6200,
    lead: [8, 10],
    measure: { label: 'Chain', options: ['7in', '8in'] },
    note: 'A forehead ornament light enough to survive a whole wedding day.',
    care: 'Handle it by the chain, never by the cluster. Hook closure.',
    stamp: '925',
  },
  {
    slug: 'noor-jhumka',
    name: 'Noor Jhumka',
    category: 'occasion',
    type: 'Bell earrings',
    metal: 'silver',
    finish: 'Gold-plated 925 sterling silver',
    stone: null,
    form: 'jhumka',
    price: 4800,
    lead: [7, 9],
    measure: { label: 'Weight per pair', options: ['6g', '8g'] },
    note: 'The classic bell, rebuilt lighter — six grams, so the earlobe never tires.',
    care: 'Re-plating at the bench for ₹400, any time the shine thins.',
    stamp: '925',
  },
  {
    slug: 'tara-chain',
    name: 'Tara Chain',
    category: 'everyday',
    type: 'Layered necklace, two chains',
    metal: 'silver',
    finish: 'Polished 925 sterling silver',
    stone: null,
    form: 'chain',
    price: 2900,
    lead: [5, 7],
    measure: { label: 'Lengths', options: ['14in + 16in', '16in + 18in'] },
    note: 'Two fine chains that sit apart instead of tangling into one.',
    care: 'Lobster clasps. Off before sleeping and the chains last years.',
    stamp: '925',
  },
  {
    slug: 'heer-ring',
    name: 'Heer Ring',
    category: 'heirloom',
    type: 'Solid gold band',
    metal: 'gold',
    finish: '14K solid gold, BIS hallmark 585',
    stone: null,
    form: 'ring',
    price: 18000,
    lead: [10, 14],
    measure: { label: 'Size', options: ['10', '12', '14', '16', '18'] },
    note: 'Made to order, hand-finished, and sized again at the bench for the rest of its life.',
    care: 'Lifetime resizing at the studio. It ships in its own box, hallmarked.',
    stamp: '585',
  },
  {
    slug: 'moti-studs',
    name: 'Moti Studs',
    category: 'everyday',
    type: 'Pearl studs, 7mm',
    metal: 'silver',
    finish: 'Polished 925 sterling silver',
    stone: 'Freshwater pearl',
    form: 'stud',
    price: 2200,
    lead: [5, 7],
    measure: { label: 'Pearl', options: ['6mm', '7mm', '8mm'] },
    note: 'A soft pearl in a minimal silver cup, thrown on with a cotton dress.',
    care: 'Pearls are organic: no water, no chemicals, a damp cloth only.',
    stamp: '925',
  },
  {
    slug: 'surya-cuff',
    name: 'Surya Cuff',
    category: 'heirloom',
    type: 'Wide cuff bracelet',
    metal: 'silver',
    finish: 'Hand-brushed 925 sterling silver',
    stone: null,
    form: 'cuff',
    price: 5400,
    lead: [8, 10],
    measure: { label: 'Inner width', options: ['50mm', '55mm', '60mm'] },
    note: 'A wide cuff with a brushed face and a curve taken from the wrist it was made for.',
    care: 'Bend it gently. Silver is malleable, which is why it fits you and not the average.',
    stamp: '925',
  },
];

export const categories = [
  { id: 'everyday', label: 'Everyday', line: 'Light enough to sleep in' },
  { id: 'occasion', label: 'Occasion', line: 'For the wedding, the festival' },
  { id: 'heirloom', label: 'Heirloom', line: 'Made to order, kept for decades' },
] as const satisfies { id: Category; label: string; line: string }[];

export const metals = [
  { id: 'silver', label: '925 silver' },
  { id: 'vermeil', label: 'Gold vermeil' },
  { id: 'gold', label: '14K solid gold' },
] as const satisfies { id: Metal; label: string }[];

/** Percentage of the inclusive price that is GST, at the counter rate of 3%. */
export const GST_RATE = 3;

/** Rupees of GST already inside an inclusive price. */
export function gstInclusive(amount: number): number {
  return Math.round(amount - amount / (1 + GST_RATE / 100));
}

/** Free above this; a courier from Jaipur is not nothing below it. */
export const FREE_SHIPPING_OVER = 4000;
export const SHIPPING_FLAT = 120;

export const quotes = [
  {
    text: 'The Chandni studs are so light I forget I am wearing them. Six months, every day, and they still look new.',
    who: 'Priya M.',
    city: 'Mumbai',
    bought: 'Chandni Studs',
  },
  {
    text: 'I ordered the Heer ring for my mother\u2019s sixtieth. The box was beautiful and the handwritten note made it feel like it came from family.',
    who: 'Arjun K.',
    city: 'Bengaluru',
    bought: 'Heer Ring',
  },
  {
    text: 'I was nervous buying jewellery over the internet. The detail drawings and the WhatsApp replies made it easy — the jhumkas are better in person.',
    who: 'Fatima S.',
    city: 'Hyderabad',
    bought: 'Noor Jhumka',
  },
] as const;

export const faqs = [
  {
    q: 'How long until it arrives?',
    a: 'Most pieces leave the bench in 5–7 working days; solid gold is made to order and takes 10–14. You get the tracking on WhatsApp the day it is boxed, and a photograph of your piece before the lid closes.',
  },
  {
    q: 'What if the size is wrong?',
    a: 'Rings are resized once, free, within thirty days — send it back and it comes back true. A printable sizer is on every ring page, and if you are between two sizes, take the larger one.',
  },
  {
    q: 'Can I return it?',
    a: 'Standard pieces, yes: seven days from delivery, unworn, full refund less the courier. Made-to-order and personalised pieces cannot be returned, because they were not made for anyone else.',
  },
  {
    q: 'How do I keep silver from going dull?',
    a: 'The pouch it arrives in is anti-tarnish — use it. Take pieces off before the pool, the shower and the perfume, and the cloth in the box will bring the shine back in about a minute.',
  },
  {
    q: 'Is the gold really 14K?',
    a: 'Every solid gold piece is BIS hallmarked 585 before it leaves, and the stamp is photographed with your order. Vermeil is 2.5 microns of 18K over silver, and re-plating at the bench is ₹400 whenever it thins.',
  },
] as const;

export const gifting = {
  title: 'It arrives in a box worth keeping.',
  line: 'Tissue, a cotton ribbon, a note written by hand on the bench, and the polishing cloth folded under the lid.',
  points: [
    'A handwritten card in the box — say what it should read when you order',
    'Gift wrap at no cost, and the price never printed inside',
    'Occasion tags: birthday, anniversary, festival, just because',
    'Direct to the recipient, with your note instead of an invoice',
  ],
} as const;
