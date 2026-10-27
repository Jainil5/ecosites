/**
 * Everything the Ember Larder pages assert about the business. The restaurant
 * is a studio build: contact lines stay on the reserved `.example` TLD, the
 * address names no real corner, and every price is sample data.
 */
export const larder = {
  name: 'Ember Larder',
  kicker: 'Live-fire kitchen & pantry',
  tagline: 'Everything on this menu has met a fire.',
  intro:
    'One long hearth, two burns of sal wood a day, and no gas line in the building. We cook the whole card over coals, then jar what we cannot serve and sell it from the shelf by the door.',
  story:
    'The room used to be a grain store, which is why the ceiling is high enough for smoke to behave itself. We rebuilt the hearth ourselves: three metres of firebrick, a hand-cranked rotisserie, and a grate low enough to sear and high enough to roast. Everything else followed from that — the bread comes off the coals, the biryani is sealed and buried in embers, and the chilli oil is made from the same byadgi we bloom on the grill.',
  email: 'hello@emberlarder.example',
  phone: '919876543210',
  address: 'Cooperage Lane, off 12th Main — the black door by the charcoal cart',
  hours: [
    { days: 'Tue–Thu', time: '18:00 – 23:00' },
    { days: 'Fri–Sat', time: '12:30 – 15:00 · 18:00 – 00:00' },
    { days: 'Sunday', time: '18:00 – 22:30' },
    { days: 'Monday', time: 'The hearth is cold' },
  ],
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'WhatsApp', href: '#' },
  ],
  notes: [
    'Twenty-six seats, eight of them at the hearth rail',
    'The pantry shelf restocks every Tuesday, usually by noon',
    'Whole-venue buyouts for the long table on Fridays',
  ],
  stats: [
    { value: 3, suffix: 'm', label: 'of firebrick hearth' },
    { value: 26, suffix: '', label: 'seats, eight at the rail' },
    { value: 14, suffix: 'hrs', label: 'for the lamb ribs' },
    { value: 0, suffix: '', label: 'gas lines in the building' },
  ],
} as const;

export type ProductGroup = 'fire' | 'pantry';

export interface ProductOption {
  id: string;
  label: string;
  /** Rupees added to (or taken off) the base price. */
  delta: number;
}

export interface ProductChoice {
  id: string;
  label: string;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  group: ProductGroup;
  /** One scannable line under the name. */
  note: string;
  /** Base price in rupees; the card prints it through `inr()`. */
  price: number;
  tags: string[];
  /** The one worth arriving early for. */
  signature?: boolean;
  image: string;
  /** Intrinsic size, so next/image never shifts the layout. */
  w: number;
  h: number;
  details: {
    ingredients: string[];
    allergens: string[];
    /** Per-plate kcal, or net weight for the pantry shelf. */
    metric: string;
  };
  choices?: ProductChoice[];
}

export const groups: { id: ProductGroup | 'all'; label: string; blurb: string }[] = [
  { id: 'all', label: 'Everything', blurb: 'The fire and the shelf together' },
  { id: 'fire', label: 'From the fire', blurb: 'Cooked over sal wood, served off the grate' },
  { id: 'pantry', label: 'The pantry', blurb: 'Jars and blends, packed on Tuesdays' },
];

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export const spiceChoice: ProductChoice = {
  id: 'heat',
  label: 'How much heat',
  options: [
    { id: 'medium', label: 'Medium', delta: 0 },
    { id: 'hot', label: 'Hot', delta: 0 },
    { id: 'fiery', label: 'Fiery', delta: 0 },
  ],
};

export const products: Product[] = [
  {
    id: 'smoked-lamb-ribs',
    name: 'Smoked Lamb Ribs',
    group: 'fire',
    note: 'Six hours over sal wood, lacquered in chilli and jaggery',
    price: 690,
    tags: ['Spicy', 'Share plate'],
    signature: true,
    image: '/ember-larder/products/smoked-lamb-ribs.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Lamb rib, marinated overnight', 'Byadgi chilli and jaggery lacquer', 'Toasted sesame', 'Burnt-lime salt'],
      allergens: ['sesame'],
      metric: '640 kcal · feeds two',
    },
    choices: [
      {
        id: 'cut',
        label: 'How much lamb',
        options: [
          { id: 'half', label: 'Half rack', delta: -250 },
          { id: 'full', label: 'Full rack', delta: 0 },
        ],
      },
      spiceChoice,
    ],
  },
  {
    id: 'charred-kadai-paneer',
    name: 'Charred Kadai Paneer',
    group: 'fire',
    note: 'Cubes blistered on the grate, dropped into a smoky tomato kadai',
    price: 520,
    tags: ['Vegetarian', 'House-made'],
    signature: true,
    image: '/ember-larder/products/charred-kadai-paneer.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Set paneer, charred over coals', 'Fire-blistered tomato and capsicum', 'Kashmiri chilli, coriander stem'],
      allergens: ['dairy'],
      metric: '510 kcal',
    },
    choices: [spiceChoice],
  },
  {
    id: 'saffron-handi-biryani',
    name: 'Saffron Handi Biryani',
    group: 'fire',
    note: 'Sealed in a clay handi and buried in the embers for forty minutes',
    price: 560,
    tags: ['Slow', 'For two'],
    image: '/ember-larder/products/saffron-handi-biryani.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Aged basmati, saffron and warm milk', 'Fried onion, mint, spear of ginger', 'Cooked in the residual coals'],
      allergens: ['dairy'],
      metric: '720 kcal · feeds two',
    },
    choices: [
      {
        id: 'pot',
        label: 'The handi',
        options: [
          { id: 'veg', label: 'Vegetable', delta: -40 },
          { id: 'chicken', label: 'Chicken', delta: 0 },
          { id: 'lamb', label: 'Lamb', delta: 120 },
        ],
      },
    ],
  },
  {
    id: 'blistered-corn',
    name: 'Blistered Corn, Burnt Lime',
    group: 'fire',
    note: 'Husk on, straight onto the coals, rolled in smoked butter',
    price: 340,
    tags: ['Vegetarian', 'Starter'],
    image: '/ember-larder/products/blistered-corn.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Sweet corn, charred in the husk', 'Burnt lime, chilli salt, coriander'],
      allergens: ['dairy'],
      metric: '280 kcal',
    },
    choices: [
      {
        id: 'basket',
        label: 'Basket',
        options: [
          { id: 'two', label: 'Two cobs', delta: 0 },
          { id: 'four', label: 'Four cobs', delta: 150 },
        ],
      },
    ],
  },
  {
    id: 'charred-garlic-naan',
    name: 'Charred Garlic Naan',
    group: 'fire',
    note: 'Slapped onto the firebrick, pulled off when the blisters go black',
    price: 160,
    tags: ['Vegetarian', 'Two a basket'],
    image: '/ember-larder/products/charred-garlic-naan.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Wild-yeast dough, rested overnight', 'Cultured butter, confit garlic'],
      allergens: ['gluten', 'dairy'],
      metric: '330 kcal',
    },
    choices: [
      {
        id: 'bread',
        label: 'Make it',
        options: [
          { id: 'plain', label: 'Plain butter', delta: 0 },
          { id: 'garlic', label: 'Confit garlic', delta: 40 },
          { id: 'cheese', label: 'Aged cheddar', delta: 90 },
        ],
      },
    ],
  },
  {
    id: 'smoked-chilli-oil',
    name: 'Smoked Chilli Oil',
    group: 'pantry',
    note: 'Byadgi chillies bloomed in the same coals that cook the card',
    price: 380,
    tags: ['Vegan', '200ml'],
    image: '/ember-larder/products/smoked-chilli-oil.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Cold-pressed groundnut oil', 'Charred byadgi chilli', 'Cured salt, a little garlic'],
      allergens: ['groundnut'],
      metric: '200ml · about 30 spoons',
    },
    choices: [
      {
        id: 'size',
        label: 'Bottle',
        options: [
          { id: '200', label: '200ml', delta: 0 },
          { id: '400', label: '400ml', delta: 260 },
        ],
      },
    ],
  },
  {
    id: 'ember-garam-masala',
    name: 'Ember Garam Masala',
    group: 'pantry',
    note: 'Whole spices dry-roasted on the grate, ground coarse the same day',
    price: 290,
    tags: ['Vegan', '80g'],
    signature: true,
    image: '/ember-larder/products/ember-garam-masala.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Black cardamom, cassia, clove', 'Star anise, tellicherry pepper, mace'],
      allergens: [],
      metric: '80g · grind within six weeks',
    },
    choices: [
      {
        id: 'size',
        label: 'Tin',
        options: [
          { id: '80', label: '80g', delta: 0 },
          { id: '160', label: '160g', delta: 210 },
        ],
      },
    ],
  },
  {
    id: 'the-cellar-hamper',
    name: 'The Cellar Hamper',
    group: 'pantry',
    note: 'Both jars, the masala, and the vinegar we keep for the pass',
    price: 1850,
    tags: ['Gift', 'Ships in a crate'],
    image: '/ember-larder/products/the-cellar-hamper.jpg',
    w: 900,
    h: 900,
    details: {
      ingredients: ['Smoked chilli oil 200ml', 'Ember garam masala 80g', 'Fire-blacked vinegar, linen-wrapped'],
      allergens: ['groundnut'],
      metric: 'Three jars in a returnable crate',
    },
  },
];

export const isRecommended = (p: Product): boolean => Boolean(p.signature);

/** The set dinner: one price, five courses, cooked as the fire dies down. */
export const setMenu = {
  name: 'The Long Hearth',
  price: inr(2400),
  per: 'a head, six to fourteen people',
  blurb:
    'Five courses, all of them off the same burn. We tell the kitchen how many are coming and the fire is built around it.',
  courses: [
    { label: 'First', text: 'Blistered corn, burnt lime, a spoon of the chilli oil' },
    { label: 'Second', text: 'Ash-roasted beets, whipped goat cheese, black pepper' },
    { label: 'Third', text: 'Lamb ribs, half rack, the heat you asked for' },
    { label: 'Fourth', text: 'Handi biryani, sealed and buried, cracked at the table' },
    { label: 'Last', text: 'Burnt-sugar custard, cardamom, the last of the coals' },
  ],
} as const;

export const reviews = [
  {
    quote:
      'The ribs arrive still ticking from the grate. Nothing else on the table tastes like it has been outside.',
    by: 'Anaya R.',
    from: 'ate here on a Friday',
  },
  {
    quote:
      'We came for the biryani and left with two jars. The masala smells like the room does at eight at night.',
    by: 'Faheem M.',
    from: 'buys the pantry shelf monthly',
  },
  {
    quote:
      'Eight seats at the hearth rail and you watch the whole thing happen. Book the rail, not the table.',
    by: 'Devika S.',
    from: 'fourth visit this year',
  },
  {
    quote:
      'They talked us out of ordering too much and then brought the bread anyway. Correct call, both times.',
    by: 'Karan P.',
    from: 'booked the long table for ten',
  },
  {
    quote:
      'No gas, no shortcuts, and a menu short enough that they actually cook every line well.',
    by: 'Meera J.',
    from: 'came on a Sunday',
  },
] as const;

export const ticker = [
  'Sal wood, two burns a day',
  'No gas line in the building',
  'Bread off the firebrick',
  'Jars packed on Tuesdays',
  'Eight seats at the hearth rail',
  'The menu is short on purpose',
] as const;
