/**
 * The Instagram feed section rotates through these three slots — swap a URL
 * (and its caption) here and nowhere else. URLs must be
 * `https://www.instagram.com/<p|reel>/<code>/`.
 */
export const instaFeed = [
  {
    url: 'https://www.instagram.com/starbucks/p/DaWEQ3vEgYh/',
    caption: 'The morning tray, before anyone ordered it',
  },
  {
    url: 'https://www.instagram.com/starbucks/reel/DYkcaYbvk7l/',
    caption: 'Watch the shot drop',
  },
  {
    url: 'https://www.instagram.com/starbucks/p/DZZ6InukqOE/',
    caption: 'Cold brew, long pour, no rush',
  },
] as const;
