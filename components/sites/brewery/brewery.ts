/**
 * Everything the Brewery pages assert about the business. The venue is a
 * studio build, so contact lines stay placeholders on the reserved
 * `.example` TLD and the address names no real corner.
 */
export const brewery = {
  name: 'Brewery',
  tagline: 'Craft beer on tap, kitchen till late',
  kicker: 'Twelve taps, one long counter',
  intro:
    'Malted, mashed and poured in the room behind the bar — twelve taps of our own beer, a kitchen that cooks to the pint, and coffee on the counter from noon so the afternoon has somewhere to go.',
  story:
    'We started with a second-hand mash tun, a borrowed kettle and two hundred kilos of pale malt, and a stubborn idea: a neighbourhood deserved a room that made its own beer instead of selling someone else’s. Everything still comes off our own kettles — the wort is boiled in the back, the taps are cleaned on Mondays, and the kitchen was built by the brewer’s father, who had spent thirty years in kitchens that never closed early.',
  heroImage: '/brewery/hero.jpg',
  email: 'hello@brewery.example',
  address: 'Old Mill Yard, ground floor, brass door',
  hours: [
    { days: 'Mon–Thu', time: '12:00 – 23:00' },
    { days: 'Friday', time: '12:00 – 00:30' },
    { days: 'Sat–Sun', time: '11:00 – 00:30' },
  ],
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'WhatsApp', href: '#' },
  ],
  notes: [
    'Twelve taps, rotated by the brewhouse every Monday',
    'Dogs welcome, water bowls by the door',
    'Growlers filled to take away, six at a time',
  ],
} as const;

export interface GalleryShot {
  src: string;
  alt: string;
  caption: string;
  /** Intrinsic size, so next/image never shifts the layout. */
  w: number;
  h: number;
  /** Tall shots span two mosaic rows. */
  tall?: boolean;
  /** Degrees of tilt, so the mosaic never reads as a grid. */
  rotate: number;
}

export const galleryShots: GalleryShot[] = [
  {
    src: '/brewery/tap-wall.jpg',
    alt: 'A row of brass beer tap handles on a dark green tiled wall, each one above a small blank ceramic marker',
    caption: 'Twelve handles',
    w: 1000,
    h: 1250,
    tall: true,
    rotate: -2.5,
  },
  {
    src: '/brewery/flight.jpg',
    alt: 'A wooden flight paddle holding four small glasses of beer from pale gold pilsner to dark stout on a bar counter',
    caption: 'The Wednesday flight',
    w: 1200,
    h: 1200,
    rotate: 1.8,
  },
  {
    src: '/brewery/kettle.jpg',
    alt: 'A brewing kettle and mash tun in a dim brewhouse, steam rising past stacked sacks of malt',
    caption: 'Mash at six',
    w: 1000,
    h: 1250,
    rotate: -1.2,
  },
  {
    src: '/brewery/room-night.jpg',
    alt: 'A busy taproom at night seen from the back of the room, warm pendant lights over a long bar with brass taps',
    caption: 'The room at nine',
    w: 1600,
    h: 900,
    tall: true,
    rotate: 2.2,
  },
  {
    src: '/brewery/chalkboard.jpg',
    alt: 'A dark chalkboard menu frame on a brick wall beside the bar, brass tap visible at the edge of the shot',
    caption: 'This week’s list',
    w: 1000,
    h: 1250,
    rotate: -2,
  },
  {
    src: '/brewery/pour.jpg',
    alt: 'A hand pulling a pint of amber beer from a brass tap, the glass filling with a thick foam head',
    caption: 'Poured by hand',
    w: 1000,
    h: 1250,
    rotate: 1.4,
  },
];
