import { describe, expect, it } from 'vitest';
import { leadChannelOf, mailtoHref, mailtoHrefMessage, telHref, whatsappHref } from '@/content/brand/links';
import type { ContactChannels } from '@/content/brand/types';

const contact: ContactChannels = {
  email: 'mail.jainil5@gmail.com',
  phone: '8238889347',
  phoneDisplay: '+91 82388 89347',
  whatsappMessage: 'Hi Website & Intelligence! I would like a website for my business.',
};

describe('whatsappHref', () => {
  it('builds a wa.me link with the 91 country code and an encoded message', () => {
    expect(whatsappHref(contact)).toBe(
      'https://wa.me/918238889347?text=Hi%20Website%20%26%20Intelligence!%20I%20would%20like%20a%20website%20for%20my%20business.',
    );
  });

  it('strips spaces and dashes from a loosely typed number', () => {
    expect(whatsappHref({ ...contact, phone: '82388-89 347' })).toContain('/918238889347');
  });

  it('does not double the country code when one is already present', () => {
    expect(whatsappHref({ ...contact, phone: '+918238889347' })).toContain('/918238889347');
  });
});

describe('telHref', () => {
  it('produces an E.164 href', () => {
    expect(telHref(contact)).toBe('tel:+918238889347');
  });
});

describe('mailtoHref', () => {
  it('produces a plain mailto for the business address', () => {
    expect(mailtoHref(contact)).toBe('mailto:mail.jainil5@gmail.com');
  });
});

describe('mailtoHrefMessage', () => {
  it('encodes a subject and a body into the draft', () => {
    expect(
      mailtoHrefMessage(contact, {
        subject: 'Book a demo',
        body: 'Hi there,\n\nI want one.',
      }),
    ).toBe(
      'mailto:mail.jainil5@gmail.com?subject=Book%20a%20demo&body=Hi%20there%2C%0A%0AI%20want%20one.',
    );
  });

  it('leaves out whichever half is not asked for', () => {
    // An empty `?subject=` reads as an untitled message in some clients, which
    // is worse than no subject at all.
    expect(mailtoHrefMessage(contact, { subject: 'Only a subject' })).toBe(
      'mailto:mail.jainil5@gmail.com?subject=Only%20a%20subject',
    );
    expect(mailtoHrefMessage(contact, { body: 'Only a body' })).toBe(
      'mailto:mail.jainil5@gmail.com?body=Only%20a%20body',
    );
    expect(mailtoHrefMessage(contact, {})).toBe('mailto:mail.jainil5@gmail.com');
  });

  it('keeps the channel attribution working on a prefilled address', () => {
    // Attribution reads the scheme, so a subject must not move a mail lead
    // into some other column.
    expect(leadChannelOf(mailtoHrefMessage(contact, { subject: 'x', body: 'y' }))).toBe('email');
  });
});

it('exposes the phone in national form and a separate display form', () => {
  expect(contact.phone).toBe('8238889347');
  expect(contact.phoneDisplay).toBe('+91 82388 89347');
});
