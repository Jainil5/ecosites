export interface ProcessStep {
  key: string;
  name: string;
  detail: string;
}

export const processSteps: ProcessStep[] = [
  {
    key: 'understand',
    name: 'Understand',
    detail: 'We learn about your business, users, workflows, and goals.',
  },
  {
    key: 'plan',
    name: 'Plan',
    detail:
      'We recommend a suitable scope, timeline, and implementation approach.',
  },
  {
    key: 'build',
    name: 'Build',
    detail: 'We design, develop, test, and prepare the solution for launch.',
  },
  {
    key: 'improve',
    name: 'Improve',
    detail:
      'We help maintain, measure, and extend the solution as needs change.',
  },
];
