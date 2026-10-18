export type MenuTag = 'Vegan' | 'Vegetarian' | 'Gluten-free' | 'House-made' | 'Seasonal' | 'Iced';

export interface ItemDetails {
  ingredients: string[];
  /** Major allergens in lowercase; an empty array means none worth flagging. */
  allergens: string[];
  kcal: number;
}

export interface MenuItem {
  id: string;
  name: string;
  /** One scannable line under the item name. */
  note: string;
  /** Display price, kept in step with `amount` by the test suite. */
  price: string;
  amount: number;
  tags: MenuTag[];
  /** Optional ribbon for the items worth pushing. */
  badge?: string;
  /** The one we pre-pick for a first-timer in this category. */
  featured?: boolean;
  /** Back of the card: what's in it and what it costs the body. */
  details: ItemDetails;
  /** Photo path, derived from the id; the test suite enforces both. */
  src: string;
}

export interface MenuGroup {
  id: 'breakfast' | 'coffee' | 'lunch';
  title: string;
  /** Small line above the heading — usually when this group is available. */
  kicker: string;
  /** The invitation the Gen Z landing shows when the category opens. */
  prompt: string;
  blurb: string;
  items: MenuItem[];
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const item = (
  id: string,
  name: string,
  note: string,
  amount: number,
  tags: MenuTag[],
  details: ItemDetails,
  badge?: string,
): MenuItem => ({
  id,
  name,
  note,
  amount,
  price: inr(amount),
  tags,
  badge,
  details,
  src: `/dream-cafe/menu/${id}.jpg`,
});

const pick = (i: MenuItem): MenuItem => ({ ...i, featured: true });

/** Worth pushing on the board: carries a badge or is the category's featured pick. */
export const isRecommended = (item: MenuItem): boolean => Boolean(item.badge) || Boolean(item.featured);

export const menuGroups: MenuGroup[] = [
  {
    id: 'breakfast',
    title: 'Breakfast & Bagels',
    kicker: 'Till 11:30, or till the trays empty',
    prompt: 'Select your bagel',
    blurb:
      'Dough proved overnight, rolled by hand each morning, boiled before it bakes. Split and toasted with soft butter unless you say otherwise.',
    items: [
      item('everything-bagel', 'Everything Bagel', 'Sesame, poppy, garlic and caraway on a glossy crust', 220, ['Vegetarian', 'House-made'], { ingredients: ['Wheat flour', 'Sesame and poppy seeds', 'Garlic and caraway', 'Olive oil, sea salt'], allergens: ['gluten', 'sesame'], kcal: 290 }, 'Rolled daily'),
      pick(item('avocado-egg-bagel', 'Avocado & Egg Bagel', 'Smashed avocado, soft-boiled egg, lemon zest, chilli', 380, ['Vegetarian'], { ingredients: ['Bagel', 'Smashed avocado', 'Soft-boiled egg', 'Lemon, chilli, butter'], allergens: ['gluten', 'egg', 'dairy'], kcal: 480 }, 'Most ordered')),
      item('scramble-bagel', 'Scramble Bagel', 'Slow egg, spring onion, cracked pepper, chilli crisp', 320, ['Vegetarian'], { ingredients: ['Bagel', 'Slow-cooked eggs', 'Spring onion, chilli crisp', 'Butter, black pepper'], allergens: ['gluten', 'egg', 'dairy'], kcal: 450 }),
      item('almond-croissant', 'Almond Croissant', 'Twice-baked, filled with frangipane, sugar dusted', 280, ['Vegetarian'], { ingredients: ['Butter pastry', 'Almond frangipane', 'Toasted almonds', 'Icing sugar'], allergens: ['gluten', 'dairy', 'nuts', 'egg'], kcal: 420 }),
      item('blueberry-muffin', 'Blueberry Muffin', 'Burst berries under a crunchy sugar top', 220, ['Vegetarian'], { ingredients: ['Plain flour', 'Wild blueberries', 'Butter and cane sugar', 'Egg, lemon zest'], allergens: ['gluten', 'dairy', 'egg'], kcal: 380 }),
      item('coconut-chia-bowl', 'Coconut Chia Bowl', 'Overnight chia, mango, toasted coconut, lime', 300, ['Vegan', 'Gluten-free', 'House-made'], { ingredients: ['Chia seeds', 'Coconut milk', 'Mango, toasted coconut', 'Lime, maple'], allergens: [], kcal: 320 }),
    ],
  },
  {
    id: 'coffee',
    title: 'Coffee',
    kicker: 'Single origin, roasted nearby',
    prompt: 'Select your coffee',
    blurb:
      'One espresso base through the day, pulled short and sweet. Milk from the fridge across the road; oat and almond always on hand at no extra.',
    items: [
      item('espresso', 'Espresso', 'A short, syrupy double', 150, ['Vegan', 'Gluten-free'], { ingredients: ['Single-origin espresso', 'Double shot', 'Pulled short and sweet'], allergens: [], kcal: 5 }),
      item('flat-white', 'Flat White', 'Six ounces, silk texture, leaf on top', 220, ['Vegetarian'], { ingredients: ['Double espresso', 'Steamed whole milk', 'Latte-art leaf'], allergens: ['dairy'], kcal: 140 }),
      item('cappuccino', 'Cappuccino', 'Third shot, third milk, third cloud of foam', 230, ['Vegetarian'], { ingredients: ['Espresso', 'Steamed milk, thick foam', 'Cocoa dust'], allergens: ['dairy'], kcal: 160 }),
      item('cortado', 'Cortado', 'Equal parts, warm not hot', 200, ['Vegetarian'], { ingredients: ['Espresso', 'Warm steamed milk', 'Equal parts, short glass'], allergens: ['dairy'], kcal: 90 }),
      pick(item('cold-brew', 'Cold Brew', 'Steeped twelve hours, poured over one big rock', 260, ['Vegan', 'Iced'], { ingredients: ['Coarse-ground coffee', 'Steeped 12 hours', 'Spring water, ice'], allergens: [], kcal: 10 }, 'Top rated')),
      item('iced-latte', 'Iced Latte', 'Double shot, cold milk, no fuss', 250, ['Vegetarian', 'Iced'], { ingredients: ['Double espresso', 'Cold milk', 'Ice, stirred short'], allergens: ['dairy'], kcal: 120 }),
      item('hot-chocolate', 'Hot Chocolate', '70 per cent, melted to order', 230, ['Vegetarian'], { ingredients: ['70% dark couverture', 'Steamed milk', 'Cocoa powder'], allergens: ['dairy', 'soy'], kcal: 260 }),
    ],
  },
  {
    id: 'lunch',
    title: 'Lunch',
    kicker: 'From 12:00',
    prompt: 'Select your plate',
    blurb:
      'Pressed, pooled and plated on the same boards the bagels rest on. Everything is sized to share badly and eat alone happily.',
    items: [
      pick(item('pressed-toastie', 'Pressed Toastie', 'Smoked cheddar, caramelised onion, spinach', 340, ['Vegetarian'], { ingredients: ['Sourdough', 'Smoked cheddar', 'Caramelised onion', 'Spinach, butter'], allergens: ['gluten', 'dairy'], kcal: 520 }, 'Chef’s pick')),
      item('roasted-tomato-soup', 'Roasted Tomato Soup', 'Cream swirl, basil oil, bread for dunking', 280, ['Vegetarian', 'Gluten-free'], { ingredients: ['Roasted tomatoes', 'Cream, basil oil', 'Garlic', 'Gluten-free bread to dip'], allergens: ['dairy'], kcal: 300 }, 'Rotates daily'),
      item('grilled-chicken-sandwich', 'Grilled Chicken Sandwich', 'Charred breast, yoghurt chilli, shelf herbs', 420, ['Gluten-free'], { ingredients: ['Charred chicken breast', 'Yoghurt-chilli marinade', 'Gluten-free bun', 'Herbs, lettuce'], allergens: ['dairy'], kcal: 460 }),
      item('mushroom-egg-bowl', 'Mushroom & Egg Bowl', 'Brown butter mushrooms, soft egg, grain base', 380, ['Vegetarian'], { ingredients: ['Mushrooms in brown butter', 'Soft egg', 'Millet and rice base', 'Parsley'], allergens: ['dairy', 'egg'], kcal: 440 }),
      item('caesar-salad', 'Caesar Salad', 'Romaine, parmesan, lemon, golden croutons', 320, ['Vegetarian'], { ingredients: ['Romaine', 'Parmesan', 'Garlic croutons', 'Anchovy and egg dressing'], allergens: ['gluten', 'dairy', 'fish', 'egg'], kcal: 350 }),
      item('salt-vinegar-fries', 'Salt & Vinegar Fries', 'Double-fried, malt vinegar, paper cone', 190, ['Vegan', 'Gluten-free'], { ingredients: ['Potatoes', 'Rice-flour dust', 'Malt vinegar', 'Sea salt'], allergens: [], kcal: 380 }),
    ],
  },
];
