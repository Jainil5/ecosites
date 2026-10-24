import type { ContactChannels } from './types';

const COUNTRY_CODE = '91';

/** Digits only, with the Indian country code added exactly once. */
function fullNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `${COUNTRY_CODE}${digits}`;
  if (digits.startsWith(COUNTRY_CODE)) return digits;
  return digits;
}

export function whatsappHrefMessage(contact: ContactChannels, message: string): string {
  return `https://wa.me/${fullNumber(contact.phone)}?text=${encodeURIComponent(message)}`;
}

export function whatsappHref(contact: ContactChannels): string {
  return whatsappHrefMessage(contact, contact.whatsappMessage);
}

export function telHref(contact: ContactChannels): string {
  return `tel:+${fullNumber(contact.phone)}`;
}

export function mailtoHref(contact: ContactChannels): string {
  return `mailto:${contact.email}`;
}

/** The three ways a visitor can actually reach the business. */
export const leadChannels = ['whatsapp', 'call', 'email'] as const;

export type LeadChannel = (typeof leadChannels)[number];

/**
 * Which channel an href reaches. Attribution derives it from the link rather
 * than trusting a label, so a renamed button cannot silently re-file a lead.
 */
export function leadChannelOf(href: string): LeadChannel | null {
  if (href.startsWith('https://wa.me/')) return 'whatsapp';
  if (href.startsWith('tel:')) return 'call';
  if (href.startsWith('mailto:')) return 'email';
  return null;
}
