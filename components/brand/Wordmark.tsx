import { company } from '@/content/brand/company';

/**
 * The brand lockup. Everything up to the last word sits in the surrounding
 * colour, the last word takes the accent — and both come from `company.name`
 * rather than being written out again here. That retyping is exactly how the
 * "&" went missing from the nav bar while the footer, the page titles and
 * every enquiry message carried the full name.
 *
 * The whole phrase is wrapped in one span: the bar and the footer both lay
 * their children out with `flex gap-2`, and an unwrapped lockup would become
 * two flex items — the word space before the "&" would sit inside the text
 * while the space after it came from the gap, so the "&" would hug one side.
 *
 * The gap before the accent word is optical, not typographic. Archivo's word
 * space is 2.6px at nav size, and a wide "&" followed by heavy caps swallows
 * it entirely — the lockup measured correctly and still read as "WEBSITE
 * &INTELLIGENCE". So the space is kept (no-break, so the name never splits)
 * and the accent word carries its own margin.
 *
 * Below the `sm` breakpoint the head of the name is its own line. At 320px a
 * single-line lockup plus the search and menu buttons does not fit, and the
 * browser's chosen break — after "Website" — reads as a wrapping accident.
 * Broken deliberately before the accent word, the same two lines read as a
 * lockup.
 */
export function Wordmark() {
  const words = company.name.split(' ');
  const tail = words.pop() ?? '';
  return (
    <span>
      <span className="block sm:inline">{`${words.join(' ')}\u00A0`}</span>
      <span className="ml-1 text-accent">{tail}</span>
    </span>
  );
}
