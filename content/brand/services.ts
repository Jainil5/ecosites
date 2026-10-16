import type { LucideIcon } from 'lucide-react';
import { Clapperboard, Globe, Sparkles, Workflow } from 'lucide-react';

/** One step of the "get online" journey, in build order. */
export interface ServiceStep {
  key: string;
  title: string;
  tagline: string;
  /** The pain, in the owner's words. */
  problem: string;
  /** What we actually build. */
  build: string;
  /** What changes for their customers afterwards. */
  notice: string;
  Icon: LucideIcon;
}

export const serviceSteps: ServiceStep[] = [
  {
    key: 'get-found',
    title: 'Get Found',
    tagline: 'A website that answers for you',
    problem:
      'You exist offline. When someone searches for what you sell, they find your competitor instead — and never know you were there.',
    build:
      'A fast, mobile-first business site: your services, photos, prices and an enquiry button that lands straight on your phone. Built so searches in your category and city land on you.',
    notice: 'Customers arrive already knowing your hours and prices — and call instead of asking around.',
    Icon: Globe,
  },
  {
    key: 'get-known',
    title: 'Get Known',
    tagline: 'Motion design that makes you look established',
    problem:
      'A plain page is forgotten in seconds. People judge how serious a business is by how it presents itself online.',
    build:
      'A motion-design pass on your site: 3D hero moments, scroll reveals, a logo that moves with weight. The polish that makes a small business read as an established one.',
    notice: 'Visitors stay longer, send the link to friends, and remember you at decision time.',
    Icon: Clapperboard,
  },
  {
    key: 'get-running',
    title: 'Get Running',
    tagline: 'The back office runs itself',
    problem:
      'Once customers start arriving, the mess begins: orders in three apps, follow-ups kept in memory, a month-end spreadsheet nobody trusts.',
    build:
      'Automation wired to how you already work: orders and enquiries into one inbox, scheduled follow-ups, menus and offers you update yourself — no developer needed.',
    notice: 'Nothing slips, and closing the shutters no longer means closing your phone.',
    Icon: Workflow,
  },
  {
    key: 'get-smart',
    title: 'Get Smart',
    tagline: 'AI that answers at 11pm',
    problem:
      '"What are your timings? Do you have this in stock?" — questions that arrive at odd hours and cost you sales when unanswered.',
    build:
      'An assistant on your site that answers in your voice about stock, pricing and bookings at any hour, plus first drafts for offers, posts and menus from your own details.',
    notice: 'Customers get answers instantly; you get back a few hours every single week.',
    Icon: Sparkles,
  },
];
