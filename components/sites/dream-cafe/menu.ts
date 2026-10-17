export type MenuTag = 'Vegan' | 'Vegetarian' | 'Gluten-free' | 'House-made' | 'Seasonal' | 'Iced';

export interface MenuItem {
  name: string;
  /** One scannable line under the item name. */
  note: string;
  /** Display price, kept in step with `amount` by the test suite. */
  price: string;
  amount: number;
  tags: MenuTag[];
  /** Optional ribbon for the items worth pushing. */
  badge?: string;
}

export interface MenuGroup {
  id: 'breakfast' | 'coffee' | 'lunch';
  title: string;
  /** Small line above the heading — usually when this group is available. */
  kicker: string;
  blurb: string;
  items: MenuItem[];
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const item = (
  name: string,
  note: string,
  amount: number,
  tags: MenuTag[],
  badge?: string,
): MenuItem => ({ name, note, amount, price: inr(amount), tags, badge });

/** The shortlist we would put in front of a first-timer, priced as on the board. */
export interface PickItem {
  id: string;
  name: string;
  note: string;
  price: string;
  src: string;
  /** Why this one made the shortlist rather than living only in the board. */
  reason: string;
}

export interface PickerTab {
  id: 'coffee' | 'food';
  label: string;
  items: PickItem[];
}

export const pickerTabs: PickerTab[] = [
  {
    id: 'coffee',
    label: 'Coffee',
    items: [
      {
        id: 'cold-brew',
        name: 'Cold Brew',
        note: 'Steeped twelve hours, poured over one big rock',
        price: '₹260',
        src: '/dream-cafe/signatures/cold-brew.jpg',
        reason: 'Weekend favourite',
      },
      {
        id: 'masala-mocha',
        name: 'Masala Mocha',
        note: 'Dark cocoa, cardamom, black pepper',
        price: '₹270',
        src: '/dream-cafe/signatures/masala-mocha.jpg',
        reason: 'House-made',
      },
      {
        id: 'filter-coffee',
        name: 'Filter Coffee',
        note: 'Chicory blend, frothed milk, poured tall',
        price: '₹120',
        src: '/dream-cafe/signatures/filter-coffee.jpg',
        reason: 'House habit',
      },
      {
        id: 'iced-latte',
        name: 'Iced Latte',
        note: 'Double shot, cold milk, no fuss',
        price: '₹250',
        src: '/dream-cafe/signatures/iced-latte.jpg',
        reason: 'Always cold',
      },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    items: [
      {
        id: 'avocado-egg-bagel',
        name: 'Avocado & Egg Bagel',
        note: 'Smashed avocado, soft-boiled egg, lemon zest, chilli',
        price: '₹380',
        src: '/dream-cafe/signatures/avocado-egg-bagel.jpg',
        reason: 'Most ordered',
      },
      {
        id: 'everything-bagel',
        name: 'Everything Bagel',
        note: 'Sesame, poppy, garlic and caraway on a glossy crust',
        price: '₹220',
        src: '/dream-cafe/signatures/everything-bagel.jpg',
        reason: 'Rolled daily',
      },
      {
        id: 'pressed-toastie',
        name: 'Pressed Toastie',
        note: 'Smoked cheddar, caramelised onion, spinach',
        price: '₹340',
        src: '/dream-cafe/signatures/pressed-toastie.jpg',
        reason: 'Off the press',
      },
      {
        id: 'smoked-paneer-bagel',
        name: 'Smoked Paneer Bagel',
        note: 'House-smoked paneer, mint labneh, pickled onion',
        price: '₹360',
        src: '/dream-cafe/signatures/smoked-paneer-bagel.jpg',
        reason: 'House-smoked',
      },
    ],
  },
];

export const menuGroups: MenuGroup[] = [
  {
    id: 'breakfast',
    title: 'Breakfast & Bagels',
    kicker: 'Till 11:30, or till the trays empty',
    blurb:
      'Dough proved overnight, rolled by hand each morning, boiled before it bakes. Split and toasted with soft butter unless you say otherwise.',
    items: [
      item('Everything Bagel', 'Sesame, poppy, garlic and caraway on a glossy crust', 220, ['Vegetarian', 'House-made'], 'Rolled daily'),
      item('Avocado & Egg Bagel', 'Smashed avocado, soft-boiled egg, lemon zest, chilli', 380, ['Vegetarian'], 'Most ordered'),
      item('Scramble Bagel', 'Slow egg, spring onion, cracked pepper, chilli crisp', 320, ['Vegetarian']),
      item('Smoked Paneer Bagel', 'House-smoked paneer, mint labneh, pickled onion', 360, ['Vegetarian', 'House-made']),
      item('Salted Sesame Bagel', 'Plain crumb, thick butter, flaky sea salt', 240, ['Vegetarian']),
      item('Almond Croissant', 'Twice-baked, filled with frangipane, sugar dusted', 280, ['Vegetarian']),
      item('Blueberry Streusel Muffin', 'Burst berries under a crunchy sugar top', 220, ['Vegetarian']),
      item('Coconut Chia Bowl', 'Overnight chia, mango, toasted coconut, lime', 300, ['Vegan', 'Gluten-free', 'House-made']),
    ],
  },
  {
    id: 'coffee',
    title: 'Coffee',
    kicker: 'Single origin, roasted nearby',
    blurb:
      'One espresso base through the day, pulled short and sweet. Milk from the fridge across the road; oat and almond always on hand at no extra.',
    items: [
      item('Filter Coffee', 'Chicory blend, frothed milk, poured tall', 120, ['Vegetarian'], 'House habit'),
      item('Espresso', 'A short, syrupy double', 150, ['Vegan', 'Gluten-free']),
      item('Flat White', 'Six ounces, silk texture, leaf on top', 220, ['Vegetarian']),
      item('Cortado', 'Equal parts, warm not hot', 200, ['Vegetarian']),
      item('Masala Mocha', 'Dark cocoa, cardamom, black pepper', 270, ['Vegetarian', 'House-made']),
      item('Cold Brew', 'Steeped twelve hours, poured over one big rock', 260, ['Vegan', 'Iced'], 'Weekend favourite'),
      item('Iced Latte', 'Double shot, cold milk, no fuss', 250, ['Vegetarian', 'Iced']),
      item('Hot Chocolate', '70 per cent, melted to order', 230, ['Vegetarian']),
      item('Pot Tea', 'Loose leaf, milk, ginger, jaggery', 150, ['Vegetarian', 'Seasonal']),
    ],
  },
  {
    id: 'lunch',
    title: 'Lunch',
    kicker: 'From 12:00',
    blurb:
      'Pressed, pooled and plated on the same boards the bagels rest on. Everything is sized to share badly and eat alone happily.',
    items: [
      item('Pressed Toastie', 'Smoked cheddar, caramelised onion, spinach', 340, ['Vegetarian']),
      item('Roasted Tomato Soup', 'Cream swirl, basil oil, bread for dunking', 280, ['Vegetarian', 'Gluten-free'], 'Rotates daily'),
      item('Citrus & Arugula Salad', 'Grapefruit, fennel, toasted pumpkin seeds', 320, ['Vegan', 'Gluten-free', 'Seasonal']),
      item('Grilled Chicken Press', 'Charred breast, yoghurt chilli, shelf herbs', 420, ['Gluten-free']),
      item('Mushroom Hash Bowl', 'Brown butter mushrooms, soft egg, grain base', 380, ['Vegetarian']),
      item('Bagel & Lox Plate', 'Cured trout, capers, red onion, cucumber', 460, ['Gluten-free'], 'Weekends'),
      item('Salt & Vinegar Fries', 'Double-fried, malt vinegar, paper cone', 190, ['Vegan', 'Gluten-free']),
    ],
  },
];
