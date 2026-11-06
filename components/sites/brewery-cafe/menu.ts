export type MenuTag = 'Vegan' | 'Vegetarian' | 'Gluten-free' | 'House-made' | 'Seasonal' | 'Iced';

export interface ItemSize {
  id: string;
  label: string;
  /** Rupees added on top of the base price for this size. */
  extra: number;
}

export interface ItemAddon {
  id: string;
  label: string;
  price: number;
}

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
  /** Available size upgrades (e.g. pizzas). */
  sizes?: ItemSize[];
  /** Optional paid add-ons the customer can tick. */
  addons?: ItemAddon[];
}

export interface MenuGroup {
  id: 'coffee' | 'food' | 'beverages';
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
  src: `/brewery-cafe/menu/${id}.jpg`,
});

const pick = (i: MenuItem): MenuItem => ({ ...i, featured: true });

const pizzaSizes: ItemSize[] = [
  { id: 'reg', label: 'Regular', extra: 0 },
  { id: 'med', label: 'Medium', extra: 80 },
  { id: 'lrg', label: 'Large', extra: 150 },
];

const pizzaAddons: ItemAddon[] = [
  { id: 'cheese-burst', label: 'Cheese Burst', price: 150 },
  { id: 'extra-protein', label: 'Extra Paneer / Chicken', price: 60 },
];

const withVariants = (i: MenuItem): MenuItem => ({ ...i, sizes: pizzaSizes, addons: pizzaAddons });

/** Worth pushing on the board: carries a badge or is the category's featured pick. */
export const isRecommended = (item: MenuItem): boolean => Boolean(item.badge) || Boolean(item.featured);

export const menuGroups: MenuGroup[] = [
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
      item('vanilla-latte', 'Vanilla Latte', 'Double shot, house vanilla, velvet milk', 240, ['Vegetarian'], { ingredients: ['Double espresso', 'Vanilla syrup', 'Steamed milk', 'Micro foam'], allergens: ['dairy'], kcal: 180 }),
      pick(item('cold-brew', 'Cold Brew', 'Steeped twelve hours, poured over one big rock', 260, ['Vegan', 'Iced'], { ingredients: ['Coarse-ground coffee', 'Steeped 12 hours', 'Spring water, ice'], allergens: [], kcal: 10 }, 'Top rated')),
      item('frappe', 'Frappé', 'Blended iced coffee under a cream crown', 280, ['Vegetarian', 'Iced'], { ingredients: ['Double espresso', 'Milk and ice, blended', 'Vanilla syrup', 'Whipped cream'], allergens: ['dairy'], kcal: 260 }, 'Loved in summer'),
      item('iced-latte', 'Iced Latte', 'Double shot, cold milk, no fuss', 250, ['Vegetarian', 'Iced'], { ingredients: ['Double espresso', 'Cold milk', 'Ice, stirred short'], allergens: ['dairy'], kcal: 120 }),
      item('hot-chocolate', 'Hot Chocolate', '70 per cent, melted to order', 230, ['Vegetarian'], { ingredients: ['70% dark couverture', 'Steamed milk', 'Cocoa powder'], allergens: ['dairy', 'soy'], kcal: 260 }),
    ],
  },
  {
    id: 'food',
    title: 'Food',
    kicker: 'Baked from 8:00, plated till we close',
    prompt: 'Select your plate',
    blurb:
      'Bagels proved overnight and boards pressed to order, then pizzas off the same ovens and pasta straight off the stove. Sized to share badly and eat alone happily.',
    items: [
      item('everything-bagel', 'Everything Bagel', 'Sesame, poppy, garlic and caraway on a glossy crust', 220, ['Vegetarian', 'House-made'], { ingredients: ['Wheat flour', 'Sesame and poppy seeds', 'Garlic and caraway', 'Olive oil, sea salt'], allergens: ['gluten', 'sesame'], kcal: 290 }, 'Rolled daily'),
      pick(item('avocado-egg-bagel', 'Avocado & Egg Bagel', 'Smashed avocado, soft-boiled egg, lemon zest, chilli', 380, ['Vegetarian'], { ingredients: ['Bagel', 'Smashed avocado', 'Soft-boiled egg', 'Lemon, chilli, butter'], allergens: ['gluten', 'egg', 'dairy'], kcal: 480 }, 'Most ordered')),
      item('scramble-bagel', 'Scramble Bagel', 'Slow egg, spring onion, cracked pepper, chilli crisp', 320, ['Vegetarian'], { ingredients: ['Bagel', 'Slow-cooked eggs', 'Spring onion, chilli crisp', 'Butter, black pepper'], allergens: ['gluten', 'egg', 'dairy'], kcal: 450 }),
      item('almond-croissant', 'Almond Croissant', 'Twice-baked, filled with frangipane, sugar dusted', 280, ['Vegetarian'], { ingredients: ['Butter pastry', 'Almond frangipane', 'Toasted almonds', 'Icing sugar'], allergens: ['gluten', 'dairy', 'nuts', 'egg'], kcal: 420 }),
      item('blueberry-muffin', 'Blueberry Muffin', 'Burst berries under a crunchy sugar top', 220, ['Vegetarian'], { ingredients: ['Plain flour', 'Wild blueberries', 'Butter and cane sugar', 'Egg, lemon zest'], allergens: ['gluten', 'dairy', 'egg'], kcal: 380 }),
      item('coconut-chia-bowl', 'Coconut Chia Bowl', 'Overnight chia, mango, toasted coconut, lime', 300, ['Vegan', 'Gluten-free', 'House-made'], { ingredients: ['Chia seeds', 'Coconut milk', 'Mango, toasted coconut', 'Lime, maple'], allergens: [], kcal: 320 }),
      item('pressed-toastie', 'Pressed Toastie', 'Smoked cheddar, caramelised onion, spinach', 340, ['Vegetarian'], { ingredients: ['Sourdough', 'Smoked cheddar', 'Caramelised onion', 'Spinach, butter'], allergens: ['gluten', 'dairy'], kcal: 520 }, 'Chef’s pick'),
      item('roasted-tomato-soup', 'Roasted Tomato Soup', 'Cream swirl, basil oil, bread for dunking', 280, ['Vegetarian', 'Gluten-free'], { ingredients: ['Roasted tomatoes', 'Cream, basil oil', 'Garlic', 'Gluten-free bread to dip'], allergens: ['dairy'], kcal: 300 }, 'Rotates daily'),
      item('grilled-chicken-sandwich', 'Grilled Chicken Sandwich', 'Charred breast, yoghurt chilli, shelf herbs', 420, ['Gluten-free'], { ingredients: ['Charred chicken breast', 'Yoghurt-chilli marinade', 'Gluten-free bun', 'Herbs, lettuce'], allergens: ['dairy'], kcal: 460 }),
      item('mushroom-egg-bowl', 'Mushroom & Egg Bowl', 'Brown butter mushrooms, soft egg, grain base', 380, ['Vegetarian'], { ingredients: ['Mushrooms in brown butter', 'Soft egg', 'Millet and rice base', 'Parsley'], allergens: ['dairy', 'egg'], kcal: 440 }),
      item('caesar-salad', 'Caesar Salad', 'Romaine, parmesan, lemon, golden croutons', 320, ['Vegetarian'], { ingredients: ['Romaine', 'Parmesan', 'Garlic croutons', 'Anchovy and egg dressing'], allergens: ['gluten', 'dairy', 'fish', 'egg'], kcal: 350 }),
      item('salt-vinegar-fries', 'Salt & Vinegar Fries', 'Double-fried, malt vinegar, paper cone', 190, ['Vegan', 'Gluten-free'], { ingredients: ['Potatoes', 'Rice-flour dust', 'Malt vinegar', 'Sea salt'], allergens: [], kcal: 380 }),
      item('bombay-grilled-sandwich', 'Bombay Grilled Sandwich', 'Green chutney, potato, onion, tomato, cheese', 260, ['Vegetarian'], { ingredients: ['White pan bread', 'Green mint chutney', 'Potato, onion, tomato', 'Cheese, butter'], allergens: ['gluten', 'dairy'], kcal: 430 }),
      withVariants(item('margherita-pizza', 'Margherita Pizza', 'San Marzano, fior di latte, torn basil', 360, ['Vegetarian'], { ingredients: ['Slow-proofed dough', 'San Marzano tomato', 'Fior di latte mozzarella', 'Basil, olive oil'], allergens: ['gluten', 'dairy'], kcal: 640 })),
      withVariants(item('cheese-burst-pizza', 'Cheese Burst Pizza', 'Molten centre, double-cheese crust', 420, ['Vegetarian'], { ingredients: ['Double mozzarella core', 'Cheddar and mozzarella edge', 'Tomato base', 'Italian herbs'], allergens: ['gluten', 'dairy'], kcal: 780 }, 'House favourite')),
      item('pink-sauce-pasta', 'Pink Sauce Pasta', 'Tomato and cream, parmesan, chilli flakes', 360, ['Vegetarian'], { ingredients: ['Penne', 'Tomato and cream sauce', 'Parmesan', 'Garlic, chilli flakes'], allergens: ['gluten', 'dairy'], kcal: 560 }),
      item('paneer-tikka-roll', 'Paneer Tikka Roll', 'Charred paneer, onions, mint mayo in a soft roti', 320, ['Vegetarian'], { ingredients: ['Tandoori paneer', 'Sliced onion, coriander', 'Mint yoghurt mayo', 'Soft rumali roti'], allergens: ['gluten', 'dairy'], kcal: 470 }),
    ],
  },
  {
    id: 'beverages',
    title: 'Beverages',
    kicker: 'Cold pressed, shaken to order',
    prompt: 'Select your drink',
    blurb:
      'No coffee, no milk foam — just cordials pressed that morning, sodas shaken frothy, and the cold things we keep in the fridge by the till.',
    items: [
      item('mint-lemonade', 'Mint Lemonade', 'Lemon, muddled mint, soda, crushed ice', 180, ['Vegan', 'Gluten-free', 'Iced'], { ingredients: ['Lemon juice', 'Muddled mint', 'Soda water', 'Cane sugar, ice'], allergens: [], kcal: 90 }),
      item('peach-iced-tea', 'Peach Iced Tea', 'Black tea, peach cordial, lemon wedge', 190, ['Vegan', 'Gluten-free', 'Iced'], { ingredients: ['Brewed black tea', 'House peach cordial', 'Lemon wedge', 'Crushed ice'], allergens: [], kcal: 120 }),
      item('fresh-lime-soda', 'Fresh Lime Soda', 'Salt or sweet, shaken till frothy', 160, ['Vegan', 'Gluten-free', 'Iced'], { ingredients: ['Fresh lime juice', 'Soda water', 'Cane sugar or black salt', 'Ice'], allergens: [], kcal: 70 }),
      pick(item('mango-lassi', 'Mango Lassi', 'Alphonso pulp churned through thick curd', 220, ['Vegetarian', 'Seasonal', 'Iced'], { ingredients: ['Alphonso mango pulp', 'Thick set curd', 'Sugar, ice', 'Cardamom pinch'], allergens: ['dairy'], kcal: 230 }, 'House classic')),
      item('diet-coke', 'Diet Coke', 'Chilled can, lime wedge on the side', 120, ['Vegan', 'Gluten-free', 'Iced'], { ingredients: ['Diet Coke, chilled', 'Ice', 'Lime wedge'], allergens: [], kcal: 2 }),
    ],
  },
];
