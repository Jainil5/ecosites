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
  /** Strength of a beer on tap, as a percentage of alcohol by volume. */
  abv?: number;
  /** Bitterness of a beer on tap, in international bitterness units. */
  ibu?: number;
  /** The style line a brewer would put on the tap marker. */
  style?: string;
  /** What the kitchen says this goes with. */
  pairing?: string;
}

export interface MenuGroup {
  id: 'brews' | 'food' | 'coffee' | 'beverages';
  title: string;
  /** Small line above the heading — usually when this group is available. */
  kicker: string;
  /** The invitation the landing shows when the category opens. */
  prompt: string;
  blurb: string;
  items: MenuItem[];
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

type Extras = Partial<Pick<MenuItem, 'abv' | 'ibu' | 'style' | 'pairing'>>;

const item = (
  id: string,
  name: string,
  note: string,
  amount: number,
  tags: MenuTag[],
  details: ItemDetails,
  badge?: string,
  extras?: Extras,
): MenuItem => ({
  id,
  name,
  note,
  amount,
  price: inr(amount),
  tags,
  badge,
  details,
  src: `/brewery/menu/${id}.jpg`,
  ...extras,
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

/** The beers on the wall: strength and bitterness travel with the price. */
const beer = (
  id: string,
  name: string,
  note: string,
  amount: number,
  style: string,
  abv: number,
  ibu: number,
  ingredients: string[],
  kcal: number,
  badge?: string,
  pairing?: string,
): MenuItem =>
  item(
    id,
    name,
    note,
    amount,
    ['Vegan', 'House-made'],
    { ingredients, allergens: ['gluten'], kcal },
    badge,
    { abv, ibu, style, pairing },
  );

export const menuGroups: MenuGroup[] = [
  {
    id: 'brews',
    title: 'Brews',
    kicker: 'Twelve taps, one wall',
    prompt: 'Select your pint',
    blurb:
      'Everything on this wall is brewed in the back room and poured from the tank it was fermented in. The wall changes on Mondays, so ask what came off the bench this week.',
    items: [
      pick(
        beer(
          'copper-road-pilsner',
          'Copper Road Pilsner',
          'Cracker-dry and clean, 4.2% and 32 IBU',
          420,
          'Pilsner',
          4.2,
          32,
          ['Pilsner malt', 'Saaz hops', 'Czech pils yeast', 'Water, salt'],
          210,
          'House pilsner',
          'Salt & Vinegar Fries',
        ),
      ),
      beer(
        'ridgeway-pale-ale',
        'Ridgeway Pale Ale',
        'Caramel malt and citrus peel, 5.1% and 38 IBU',
        480,
        'Pale ale',
        5.1,
        38,
        ['Pale and crystal malt', 'Cascade hops', 'English ale yeast', 'Water'],
        230,
        undefined,
        'Pressed Toastie',
      ),
      beer(
        'nightporter',
        'Nightporter',
        'Roast and cocoa, dry to the finish, 5.6% and 42 IBU',
        500,
        'Dry stout',
        5.6,
        42,
        ['Roasted barley', 'Chocolate malt', 'East Kent Goldings hops', 'Roast yeast'],
        250,
        'Dark of the wall',
        'Blueberry Muffin',
      ),
      beer(
        'green-room-ipa',
        'Green Room IPA',
        'Pine and grapefruit, 6.4% and 58 IBU',
        540,
        'West coast IPA',
        6.4,
        58,
        ['Pale malt', 'Simcoe hops', 'Citra hops', 'American ale yeast'],
        240,
        'Hoppiest we pour',
        'Paneer Tikka Roll',
      ),
      beer(
        'honey-wheat',
        'Honey Wheat',
        'Cloudy, soft and slow, 4.7% and 18 IBU',
        440,
        'Honey wheat',
        4.7,
        18,
        ['Wheat malt', 'Pale malt', 'Wildflower honey', 'Hefeweizen yeast'],
        230,
        undefined,
        'Almond Croissant',
      ),
      beer(
        'nitro-cold-ipa',
        'Nitro Cold IPA',
        'Served on nitrogen, 6.0% and 45 IBU',
        560,
        'Cold IPA',
        6.0,
        45,
        ['Pale malt', 'Cascade and Mosaic hops', 'Verdant ale yeast', 'Nitrogen'],
        220,
        undefined,
        'Loaded Brewpub Fries',
      ),
      beer(
        'tamarind-sour',
        'Tamarind Sour',
        'Tamarind and salt, 5.3% and 26 IBU',
        540,
        'Sour ale',
        5.3,
        26,
        ['Pilsner malt', 'Wheat malt', 'Tamarind pulp', 'Sea salt', 'Saison yeast'],
        190,
        undefined,
        'Coconut Chia Bowl',
      ),
      beer(
        'sunday-tripel',
        'Sunday Tripel',
        'Bottle-conditioned, 8.1% and 30 IBU',
        640,
        'Belgian tripel',
        8.1,
        30,
        ['Pale malt', 'Pilsner malt', 'Aromatic hops', 'Belgian yeast', 'White pepper'],
        320,
        'Strongest on the wall',
        'Cheese Burst Pizza',
      ),
    ],
  },
  {
    id: 'food',
    title: 'Kitchen',
    kicker: 'Cooked to the pint, till late',
    prompt: 'Select your plate',
    blurb:
      'The kitchen is the brewer’s father, so it runs until the last table leaves: bread proved overnight, wings smoked in the morning, and pizzas off the same oven the bagels come out of. Every plate names the beer it wants next to it.',
    items: [
      item('everything-bagel', 'Everything Bagel', 'Sesame, poppy, garlic and caraway on a glossy crust', 220, ['Vegetarian', 'House-made'], { ingredients: ['Wheat flour', 'Sesame and poppy seeds', 'Garlic and caraway', 'Olive oil, sea salt'], allergens: ['gluten', 'sesame'], kcal: 290 }, 'Rolled daily', { pairing: 'Honey Wheat' }),
      pick(item('avocado-egg-bagel', 'Avocado & Egg Bagel', 'Smashed avocado, soft-boiled egg, lemon zest, chilli', 380, ['Vegetarian'], { ingredients: ['Bagel', 'Smashed avocado', 'Soft-boiled egg', 'Lemon, chilli, butter'], allergens: ['gluten', 'egg', 'dairy'], kcal: 480 }, 'Most ordered', { pairing: 'Copper Road Pilsner' })),
      item('scramble-bagel', 'Scramble Bagel', 'Slow egg, spring onion, cracked pepper, chilli crisp', 320, ['Vegetarian'], { ingredients: ['Bagel', 'Slow-cooked eggs', 'Spring onion, chilli crisp', 'Butter, black pepper'], allergens: ['gluten', 'egg', 'dairy'], kcal: 450 }, undefined, { pairing: 'Copper Road Pilsner' }),
      item('almond-croissant', 'Almond Croissant', 'Twice-baked, filled with frangipane, sugar dusted', 280, ['Vegetarian'], { ingredients: ['Butter pastry', 'Almond frangipane', 'Toasted almonds', 'Icing sugar'], allergens: ['gluten', 'dairy', 'nuts', 'egg'], kcal: 420 }, undefined, { pairing: 'Honey Wheat' }),
      item('blueberry-muffin', 'Blueberry Muffin', 'Burst berries under a crunchy sugar top', 220, ['Vegetarian'], { ingredients: ['Plain flour', 'Wild blueberries', 'Butter and cane sugar', 'Egg, lemon zest'], allergens: ['gluten', 'dairy', 'egg'], kcal: 380 }, undefined, { pairing: 'Honey Wheat' }),
      item('coconut-chia-bowl', 'Coconut Chia Bowl', 'Overnight chia, mango, toasted coconut, lime', 300, ['Vegan', 'Gluten-free', 'House-made'], { ingredients: ['Chia seeds', 'Coconut milk', 'Mango, toasted coconut', 'Lime, maple'], allergens: [], kcal: 320 }, undefined, { pairing: 'Tamarind Sour' }),
      item('pressed-toastie', 'Pressed Toastie', 'Smoked cheddar, caramelised onion, spinach', 340, ['Vegetarian'], { ingredients: ['Sourdough', 'Smoked cheddar', 'Caramelised onion', 'Spinach, butter'], allergens: ['gluten', 'dairy'], kcal: 520 }, 'Chef’s pick', { pairing: 'Ridgeway Pale Ale' }),
      item('roasted-tomato-soup', 'Roasted Tomato Soup', 'Cream swirl, basil oil, bread for dunking', 280, ['Vegetarian', 'Gluten-free'], { ingredients: ['Roasted tomatoes', 'Cream, basil oil', 'Garlic', 'Gluten-free bread to dip'], allergens: ['dairy'], kcal: 300 }, 'Rotates daily', { pairing: 'Ridgeway Pale Ale' }),
      item('grilled-chicken-sandwich', 'Grilled Chicken Sandwich', 'Charred breast, yoghurt chilli, shelf herbs', 420, ['Gluten-free'], { ingredients: ['Charred chicken breast', 'Yoghurt-chilli marinade', 'Gluten-free bun', 'Herbs, lettuce'], allergens: ['dairy'], kcal: 460 }, undefined, { pairing: 'Honey Wheat' }),
      item('mushroom-egg-bowl', 'Mushroom & Egg Bowl', 'Brown butter mushrooms, soft egg, grain base', 380, ['Vegetarian'], { ingredients: ['Mushrooms in brown butter', 'Soft egg', 'Millet and rice base', 'Parsley'], allergens: ['dairy', 'egg'], kcal: 440 }, undefined, { pairing: 'Copper Road Pilsner' }),
      item('caesar-salad', 'Caesar Salad', 'Romaine, parmesan, lemon, golden croutons', 320, ['Vegetarian'], { ingredients: ['Romaine', 'Parmesan', 'Garlic croutons', 'Anchovy and egg dressing'], allergens: ['gluten', 'dairy', 'fish', 'egg'], kcal: 350 }, undefined, { pairing: 'Copper Road Pilsner' }),
      item('salt-vinegar-fries', 'Salt & Vinegar Fries', 'Double-fried, malt vinegar, paper cone', 190, ['Vegan', 'Gluten-free'], { ingredients: ['Potatoes', 'Rice-flour dust', 'Malt vinegar', 'Sea salt'], allergens: [], kcal: 380 }, undefined, { pairing: 'Copper Road Pilsner' }),
      item('bombay-grilled-sandwich', 'Bombay Grilled Sandwich', 'Green chutney, potato, onion, tomato, cheese', 260, ['Vegetarian'], { ingredients: ['White pan bread', 'Green mint chutney', 'Potato, onion, tomato', 'Cheese, butter'], allergens: ['gluten', 'dairy'], kcal: 430 }, undefined, { pairing: 'Honey Wheat' }),
      withVariants(item('margherita-pizza', 'Margherita Pizza', 'San Marzano, fior di latte, torn basil', 360, ['Vegetarian'], { ingredients: ['Slow-proofed dough', 'San Marzano tomato', 'Fior di latte mozzarella', 'Basil, olive oil'], allergens: ['gluten', 'dairy'], kcal: 640 }, undefined, { pairing: 'Ridgeway Pale Ale' })),
      withVariants(item('cheese-burst-pizza', 'Cheese Burst Pizza', 'Molten centre, double-cheese crust', 420, ['Vegetarian'], { ingredients: ['Double mozzarella core', 'Cheddar and mozzarella edge', 'Tomato base', 'Italian herbs'], allergens: ['gluten', 'dairy'], kcal: 780 }, 'House favourite', { pairing: 'Ridgeway Pale Ale' })),
      item('pink-sauce-pasta', 'Pink Sauce Pasta', 'Tomato and cream, parmesan, chilli flakes', 360, ['Vegetarian'], { ingredients: ['Penne', 'Tomato and cream sauce', 'Parmesan', 'Garlic, chilli flakes'], allergens: ['gluten', 'dairy'], kcal: 560 }, undefined, { pairing: 'Copper Road Pilsner' }),
      item('paneer-tikka-roll', 'Paneer Tikka Roll', 'Charred paneer, onions, mint mayo in a soft roti', 320, ['Vegetarian'], { ingredients: ['Tandoori paneer', 'Sliced onion, coriander', 'Mint yoghurt mayo', 'Soft rumali roti'], allergens: ['gluten', 'dairy'], kcal: 470 }, undefined, { pairing: 'Green Room IPA' }),
      item('loaded-fries', 'Loaded Brewpub Fries', 'Battered chips, cheddar, onion and a hop salt', 320, ['Vegetarian'], { ingredients: ['Beer-battered chips', 'Cheddar sauce', 'Caramelised onion', 'Spring onion, hop salt'], allergens: ['gluten', 'dairy'], kcal: 690 }, 'Beer-battered', { pairing: 'Ridgeway Pale Ale' }),
      item('chicken-wings', 'Smoked Chicken Wings', 'Overnight in the smoker, glazed in soy and honey', 420, ['House-made'], { ingredients: ['Chicken wings', 'Smoked over oak', 'Soy and honey glaze', 'Sesame, chilli flakes'], allergens: ['soy', 'sesame'], kcal: 610 }, 'Smoked since dawn', { pairing: 'Green Room IPA' }),
    ],
  },
  {
    id: 'coffee',
    title: 'Café',
    kicker: 'Coffee on the counter, from noon',
    prompt: 'Select your coffee',
    blurb:
      'The grinder sits next to the till, so the coffee is the one thing on this menu that was not made here. One espresso base through the day, pulled short and sweet; oat and almond always on hand at no extra.',
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
    id: 'beverages',
    title: 'Coolers',
    kicker: 'Bottled, canned and shaken',
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
