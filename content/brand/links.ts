import type { ContactChannels } from './types';

const COUNTRY_CODE = '91';

/** Digits only, with the Indian country code added exactly once. */
function fullNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `${COUNTRY_CODE}${digits}`;
  if (digits.startsWith(COUNTRY_CODE)) return digits;
  return digits;
}

export function whatsappHref(contact: ContactChannels): string {
  const message = encodeURIComponent(contact.whatsappMessage);
  return `https://wa.me/${fullNumber(contact.phone)}?text=${message}`;
}

export function telHref(contact: ContactChannels): string {
  return `tel:+${fullNumber(contact.phone)}`;
}

export function mailtoHref(contact: ContactChannels): string {
  return `mailto:${contact.email}`;
}
