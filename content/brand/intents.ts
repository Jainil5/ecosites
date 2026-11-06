/**
 * The reasons a visitor reaches for the phone, written once.
 *
 * Every enquiry control on the brand pages used to carry its own sentence, so
 * "book a walkthrough" on one page and "see it working" on another were the
 * same ask in three wordings — and the inbox could not tell them apart. An
 * intent is now a record: the button label, the WhatsApp text and the mail
 * subject all come from the same line, which means a lead arrives classified
 * by what the visitor actually clicked.
 *
 * The prefilled text always leaves room for the business's own words. A first
 * message that says everything is a message nobody needed to finish.
 */
export interface EnquiryIntent {
  key: string;
  /** The button's own words. */
  label: string;
  /** Why a reader picks it, in the reader's terms. */
  detail: string;
  /** First message in the chat, with the sentence left open to finish. */
  whatsapp: string;
  /** Mail subject — short enough to survive a phone notification. */
  subject: string;
  /** Mail body, also left open. */
  body: string;
}

export const intents: EnquiryIntent[] = [
  {
    key: 'message',
    label: 'Message us',
    detail: 'Any question about what we build, or whether your idea fits.',
    whatsapp:
      'Hi Website & Intelligence! I would like to ask about my business — here is what I have in mind: ',
    subject: 'A question about my business',
    body: 'Hi Website & Intelligence,\n\nHere is my business and what I am thinking about: \n',
  },
  {
    key: 'demo',
    label: 'Book a demo',
    detail: 'Thirty minutes, screen shared, one of our running systems end to end.',
    whatsapp:
      'Hi Website & Intelligence! I would like to see one of your systems working — a good time for me is: ',
    subject: 'A time to see a system working',
    body: 'Hi Website & Intelligence,\n\nI would like a walkthrough. A good time for me is: \nMy business: \n',
  },
  {
    key: 'quote',
    label: 'Ask what it costs',
    detail: 'A number for the work, and the monthly plan that keeps it running.',
    whatsapp:
      'Hi Website & Intelligence! I would like to know what this would cost — what I need is: ',
    subject: 'What would this cost',
    body: 'Hi Website & Intelligence,\n\nWhat I need: \nWhen it would be needed by: \n',
  },
  {
    key: 'project',
    label: 'Start a project',
    detail: 'The idea is settled. Send it over and we will say what step one is.',
    whatsapp:
      'Hi Website & Intelligence! I want to start a project — here is the idea: ',
    subject: 'Starting a project',
    body: 'Hi Website & Intelligence,\n\nThe idea: \nWhat it is for: \nWho will use it: \n',
  },
  {
    key: 'run',
    label: 'Hand us the running of it',
    detail: 'You already have a site or a system and nobody is minding it.',
    whatsapp:
      'Hi Website & Intelligence! I already have this running and I would like it looked after — what I have: ',
    subject: 'Looking after what we already have',
    body: 'Hi Website & Intelligence,\n\nWhat we already have: \nWhat it needs: \n',
  },
  {
    key: 'trouble',
    label: 'Something is broken',
    detail: 'A page down, a payment not landing, a counter that stopped taking orders.',
    whatsapp:
      'Hi Website & Intelligence! Something is not working — here is what is happening: ',
    subject: 'Something is not working',
    body: 'Hi Website & Intelligence,\n\nWhat is happening: \nSince when: \nWhere it shows: \n',
  },
];

export function getIntentByKey(key: string): EnquiryIntent | undefined {
  return intents.find((intent) => intent.key === key);
}
