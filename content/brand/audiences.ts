export interface Audience {
  key: 'local' | 'enterprise';
  name: string;
  /** The campaign line this audience sees about itself. */
  campaign: string;
  headline: string;
  pitch: string;
  path: string;
  /** Button label — a verb for this buyer, never 'Learn more'. */
  cta: string;
}

export const audiences: Audience[] = [
  {
    key: 'local',
    name: 'Local Business',
    campaign: 'Grow Online.',
    headline: 'A professional online presence that turns searches into customers.',
    pitch:
      'Get found, get understood, get contacted. Websites, digital menus and catalogues, enquiry and booking flows, an agent that answers the same ten questions at midnight — and a monthly plan that keeps them running — for shops, clinics and local service providers.',
    path: '/local-business',
    cta: 'Get Your Business Online',
  },
  {
    key: 'enterprise',
    name: 'Enterprise & Growing',
    campaign: 'Build Smarter.',
    headline: 'Software, data and AI systems that make your team more effective.',
    pitch:
      'Custom applications, mobile apps for the field, business dashboards, data pipelines, automation and AI agents — engineered around your business problem, not a template, and run by the team that built it.',
    path: '/enterprise',
    cta: 'Discuss Your Project',
  },
];
