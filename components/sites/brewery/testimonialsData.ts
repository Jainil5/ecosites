/**
 * Demo voices for the testimonials page. Each is pinned to a real menu item
 * id so the chip can borrow its photo and name from `menu.ts` — change the
 * menu and the tags follow. No surnames, handles or contact details.
 */
export interface Voice {
  name: string;
  when: string;
  quote: string;
  itemId: string;
}

export const testimonials: Voice[] = [
  {
    name: 'Priya N.',
    when: 'Tuesday regular',
    quote:
      'The house pilsner is cracker-dry and gone before I have found a seat. I have stopped pretending water is lunch.',
    itemId: 'copper-road-pilsner',
  },
  {
    name: 'Rahul S.',
    when: 'Walks in at seven',
    quote:
      'The IPA is properly bitter, not politely bitter. It is the only counter where the queue feels like part of the evening.',
    itemId: 'green-room-ipa',
  },
  {
    name: 'Aman K.',
    when: 'Window-ledge sitter',
    quote:
      'Ordered the loaded fries to share with a friend and we silently agreed never to split it again. One per person, minimum.',
    itemId: 'loaded-fries',
  },
  {
    name: 'Sneha P.',
    when: 'Lunch-break escapee',
    quote:
      'The porter is proof that a simple thing done properly beats a fancy thing done loudly. Dry to the last mouthful, no leftovers.',
    itemId: 'nightporter',
  },
  {
    name: 'Vikram D.',
    when: 'Cold-brew sceptic',
    quote:
      'I said cold brew is just iced coffee with marketing. I now say cold brew is the reason I am here every afternoon. I stand corrected.',
    itemId: 'cold-brew',
  },
  {
    name: 'Ira M.',
    when: 'Brings the dog',
    quote:
      'A honey wheat, a corner table, and a water bowl by the door. My Tuesday walk and my Tuesday pint live at the same address now.',
    itemId: 'honey-wheat',
  },
  {
    name: 'Kunal B.',
    when: 'Pizza-Thursday host',
    quote:
      'Cheese-burst pizza for four and the kitchen kept the plates coming until midnight. Somehow nobody checked their phone once.',
    itemId: 'cheese-burst-pizza',
  },
  {
    name: 'Divya R.',
    when: 'Cappuccino purist',
    quote:
      'Foam like velvet, cocoa dusted late so it still floats when it lands. Nobody else pours coffee after midnight, either.',
    itemId: 'cappuccino',
  },
];
