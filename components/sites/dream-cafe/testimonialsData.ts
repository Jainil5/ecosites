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
      'The Frappé survived my 8am deadline and still tasted like dessert at eleven. I have stopped pretending water is lunch.',
    itemId: 'frappe',
  },
  {
    name: 'Rahul S.',
    when: 'Walks in at seven',
    quote:
      'Flat white so smooth I forgave the Monday standup. This is the only counter where the queue feels like part of the morning.',
    itemId: 'flat-white',
  },
  {
    name: 'Aman K.',
    when: 'Window-ledge sitter',
    quote:
      'Ordered the avocado-and-egg bagel to share with a friend and we silently agreed never to split it again. One per person, minimum.',
    itemId: 'avocado-egg-bagel',
  },
  {
    name: 'Sneha P.',
    when: 'Lunch-break escapee',
    quote:
      'The pressed toastie is proof that a simple thing done properly beats a fancy thing done loudly. Crust to crust, no leftovers.',
    itemId: 'pressed-toastie',
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
      'Mango lassi, a corner table, and a water bowl by the door. My Tuesday walk and my Tuesday treat live at the same address now.',
    itemId: 'mango-lassi',
  },
  {
    name: 'Kunal B.',
    when: 'Pizza-Thursday host',
    quote:
      'Cheese-burst pizza for four, and the espresso machine kept up with every refill. Somehow nobody checked their phone once.',
    itemId: 'cheese-burst-pizza',
  },
  {
    name: 'Divya R.',
    when: 'Cappuccino purist',
    quote:
      'Foam like velvet, cocoa dusted late so it still floats when it lands. I have stopped ordering cappuccinos anywhere else.',
    itemId: 'cappuccino',
  },
];
