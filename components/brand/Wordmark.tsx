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
 */
export function Wordmark() {
  const words = company.name.split(' ');
  const tail = words.pop() ?? '';
  return (
    <span>
      {words.join(' ')} <span className="text-accent">{tail}</span>
    </span>
  );
}
