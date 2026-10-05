export interface Service {
  name: string;
  note: string;
  price: string;
  amount: number;
  badge?: string;
}

export type ServiceCategory = 'women' | 'men' | 'unisex';

export const services: Record<ServiceCategory, Service[]> = {
  women: [
    { name: 'Advanced Haircut', note: 'Wash, consultation & blow-dry included', price: '₹800+', amount: 800 },
    { name: 'Global Hair Colour', note: 'L’Oréal Majirel / iNOA — ammonia-free', price: '₹3,500+', amount: 3500, badge: 'L’Oréal Certified' },
    { name: 'French Balayage', note: 'Hand-painted, sun-kissed dimension', price: '₹5,500+', amount: 5500, badge: 'Bestseller' },
    { name: 'French Blending / Highlights', note: 'Soft root melt & natural blend', price: '₹4,000+', amount: 4000 },
    { name: 'VibGYOR Fashion Colours', note: 'Bold fashion shades by colour artists', price: '₹6,000+', amount: 6000 },
    { name: 'Keratin / Smoothing', note: 'Frizz-free results up to 6 months', price: '₹4,500+', amount: 4500 },
    { name: 'Hair Extensions', note: 'Tape-in / sew-in, natural finish', price: '₹8,000+', amount: 8000 },
    { name: 'Bridal Makeup Package', note: 'HD/Airbrush + Hair + Draping', price: '₹12,000+', amount: 12000 },
  ],
  men: [
    { name: 'Precision Haircut', note: 'Tailored style with wash & blow-dry', price: '₹400+', amount: 400, badge: 'Bestseller' },
    { name: 'Skin Fade & Taper', note: 'Clipper-work perfection, clean finish', price: '₹500+', amount: 500 },
    { name: 'Beard Grooming & Spa', note: 'Trimming, shaping, and conditioning', price: '₹300+', amount: 300 },
    { name: "Men's Global Colour", note: 'iNOA / Dia colour — grey coverage & style', price: '₹1,500+', amount: 1500 },
    { name: 'Anti-Dandruff Treatment', note: 'Deep cleanse & scalp therapy', price: '₹900+', amount: 900 },
    { name: 'Head Massage & Oil Therapy', note: 'Relaxing scalp ritual with premium oils', price: '₹600+', amount: 600 },
    { name: "Men's Facial", note: 'Detan & deep pore cleansing', price: '₹1,200+', amount: 1200 },
  ],
  unisex: [
    { name: 'Glass Hair Treatment', note: 'Mirror-shine gloss service', price: '₹2,500+', amount: 2500, badge: 'Trending' },
    { name: 'Hyaluronic Glossing', note: 'Deep hydration + brilliant shine', price: '₹2,000+', amount: 2000 },
    { name: 'Hair Spa (L’Oréal/Schwarzkopf)', note: 'Deep conditioning & head massage', price: '₹1,000+', amount: 1000, badge: 'Bestseller' },
    { name: 'Dia Light Gloss / Toning', note: 'Shine service & brass control', price: '₹1,800+', amount: 1800 },
    { name: 'Balayage / Highlights', note: 'Custom colour techniques', price: '₹4,000+', amount: 4000 },
    { name: 'Party & Editorial Styling', note: 'Curls, waves & updos for any occasion', price: '₹1,500+', amount: 1500 },
    { name: 'Manicure & Pedicure', note: 'Exfoliation, massage & nail care', price: '₹900+', amount: 900 },
    { name: 'Body Detan Pack', note: 'Sun tan & dead skin removal', price: '₹800+', amount: 800 },
  ],
};

export interface Reel {
  title: string;
  url: string;
}

export const reels: Reel[] = [
  { title: 'Global Colour Transformation', url: 'https://www.instagram.com/reel/DWMDq8SiN5u/' },
  { title: 'Haircut Journey — VibGYOR Look', url: 'https://www.instagram.com/reel/DWq7tIzCKoL/' },
  { title: 'Welcome to Hair Adore', url: 'https://www.instagram.com/reel/DYZAu3UoMar/' },
];

export interface Offer {
  title: string;
  tagline: string;
  includes: string[];
  price: number;
  oldPrice: number;
  perk: string;
  tint: string;
}

export const offers: Offer[] = [
  {
    title: 'Bridal Glow Package',
    tagline: 'HD/Airbrush makeup + Balayage + Hair Spa + Draping',
    includes: ['Bridal Makeup', 'French Balayage', 'Hair Spa', 'Draping'],
    price: 18999,
    oldPrice: 24800,
    perk: 'Free trial session',
    tint: 'from-[#C1613C] to-[#9E4A2B]',
  },
  {
    title: 'Couple Grooming Combo',
    tagline: 'Two cuts + beard styling + head massage, booked together',
    includes: ['2 Haircuts', 'Beard Grooming', 'Oil Therapy'],
    price: 1499,
    oldPrice: 1900,
    perk: 'Same-chair Saturday slots',
    tint: 'from-[#C1613C] to-[#2B2118]',
  },
  {
    title: 'Colour + Gloss Ritual',
    tagline: 'Global colour or highlights sealed with hyaluronic glossing',
    includes: ['Global Colour', 'Hyaluronic Glossing'],
    price: 4999,
    oldPrice: 5500,
    perk: 'Free aftercare shampoo',
    tint: 'from-[#9E4A2B] to-[#2B2118]',
  },
  {
    title: 'Student Cut & Care',
    tagline: 'Precision cut + express spa. Valid with college ID',
    includes: ['Haircut', 'Express Spa'],
    price: 799,
    oldPrice: 1400,
    perk: 'Weekday only',
    tint: 'from-[#9E4A2B] to-[#C1613C]',
  },
  {
    title: 'Monsoon Hair Rehab',
    tagline: 'Anti-dandruff therapy + deep spa + scalp oil ritual',
    includes: ['Anti-Dandruff', 'Hair Spa', 'Oil Therapy'],
    price: 1999,
    oldPrice: 2500,
    perk: 'Aroma upgrade included',
    tint: 'from-[#2B2118] to-[#9E4A2B]',
  },
];

export interface Transformation {
  title: string;
  before: string;
  after: string;
}

export const transformations: Transformation[] = [
  {
    title: 'Caramel Balayage',
    before: '/showcase/hair-adore/transformations/balayage-before.jpg',
    after: '/showcase/hair-adore/transformations/balayage-after.jpg',
  },
  {
    title: 'Fade & Beard Sculpting',
    before: '/showcase/hair-adore/transformations/fade-before.jpg',
    after: '/showcase/hair-adore/transformations/fade-after.jpg',
  },
  {
    title: 'Keratin Smoothing',
    before: '/showcase/hair-adore/transformations/smooth-before.jpg',
    after: '/showcase/hair-adore/transformations/smooth-after.jpg',
  },
];

export interface Stylist {
  name: string;
  role: string;
  bio: string;
  tags: string[];
  image: string;
  initials: string;
}

export const stylists: Stylist[] = [
  {
    name: 'Aarav Mehta',
    role: 'Creative Director',
    bio: '10+ years in advanced cuts, restructuring, and avant-garde editorial styling.',
    tags: ['Cutting', 'Styling'],
    image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=500&q=80',
    initials: 'AM',
  },
  {
    name: 'Priya Sharma',
    role: 'Senior Colorist & MUA',
    bio: 'Master of Balayage and bridal transformations, certified by top international academies.',
    tags: ['Colour', 'Bridal'],
    image: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=500&q=80',
    initials: 'PS',
  },
  {
    name: 'Vikram Desai',
    role: "Men's Grooming Expert",
    bio: 'Precision fades, beard sculpting, and scalp treatments. The go-to barber in Viman Nagar.',
    tags: ['Fades', 'Beard'],
    image: 'https://images.unsplash.com/photo-1622281561081-420d43714571?auto=format&fit=crop&w=500&q=80',
    initials: 'VD',
  },
];

export interface Review {
  name: string;
  meta: string;
  text: string;
  initials: string;
  tint: string;
  service: string;
  stylist: string;
}

export const reviews: Review[] = [
  {
    name: 'Sneha Kulkarni',
    meta: 'Local Guide · 2 weeks ago',
    text: 'Absolutely the best unisex salon in Viman Nagar! Priya’s balayage looks stunning and the dedicated parking is a huge relief.',
    initials: 'S',
    tint: 'bg-rose-100 text-rose-700',
    service: 'Balayage',
    stylist: 'Priya',
  },
  {
    name: 'Rahul Patil',
    meta: '1 month ago',
    text: 'Been visiting Aarav for 2 years. Excellent precision cuts every time. Extremely hygienic and the staff is very polite.',
    initials: 'R',
    tint: 'bg-emerald-100 text-emerald-700',
    service: 'Precision Cut',
    stylist: 'Aarav',
  },
  {
    name: 'Neha Agarwal',
    meta: '3 months ago',
    text: 'Got bridal makeup done here. They listened exactly and made me look natural yet glowing. Prices are very transparent.',
    initials: 'N',
    tint: 'bg-amber-100 text-amber-700',
    service: 'Bridal Makeup',
    stylist: 'Makeup Team',
  },
];

export const stats = [
  { value: 320, suffix: '+', label: 'Google Reviews' },
  { value: 10, suffix: '', label: 'Years Experience' },
  { value: 4.8, suffix: '', label: 'Star Rating', decimals: 1 },
] as const;
