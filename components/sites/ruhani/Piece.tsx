import type { Form } from './data';

interface PieceProps {
  form: Form;
  /** The second view a card swaps to on hover: the same drawing, closer in. */
  detail?: boolean;
  className?: string;
  /** Ink colour of the metal line, so gold pieces draw in gold. */
  tone?: string;
}

/**
 * Bench drawings, not photographs.
 *
 * A maker who works from a single table cannot supply a studio's worth of
 * product photography, and a stock photo of someone else's jewellery would be
 * a lie on her page. So the pieces are drawn the way they are actually designed
 * — a line on paper at the bench — and the hover view is the loupe: the same
 * drawing scaled in on the setting, which is the part a buyer needs to see and
 * a photograph of a silver stud rarely shows.
 */
export function Piece({ form, detail = false, className = '', tone = 'var(--rj-ink)' }: PieceProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-hidden
      className={className}
      style={{
        transform: detail ? 'scale(1.9)' : 'scale(1)',
        transformOrigin: detail ? '50% 46%' : 'center',
      }}
    >
      <g
        fill="none"
        stroke={tone}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {draw(form)}
      </g>
    </svg>
  );
}

function draw(form: Form) {
  switch (form) {
    case 'stud':
      return (
        <>
          <circle cx="50" cy="46" r="15" />
          <circle cx="50" cy="46" r="9" stroke="var(--rj-gold)" />
          <path d="M50 61v13" />
          <path d="M46 74h8" />
          <path d="M41 46l-9-4M59 46l9-4" />
        </>
      );
    case 'hoop':
      return (
        <>
          <circle cx="50" cy="52" r="24" />
          <circle cx="50" cy="52" r="19" stroke="var(--rj-hair)" />
          <path d="M50 28v-6" />
          <circle cx="50" cy="20" r="3" stroke="var(--rj-gold)" />
        </>
      );
    case 'drop':
      return (
        <>
          <path d="M50 22v14" />
          <circle cx="50" cy="19" r="3" stroke="var(--rj-gold)" />
          <path d="M50 36c-9 8-13 14-13 21a13 13 0 0 0 26 0c0-7-4-13-13-21z" />
          <path d="M44 58c2 3 5 5 8 5" stroke="var(--rj-hair)" />
        </>
      );
    case 'ring':
      return (
        <>
          <circle cx="50" cy="54" r="22" />
          <circle cx="50" cy="54" r="16" stroke="var(--rj-hair)" />
          <path d="M42 33l8-9 8 9" />
          <path d="M46 28h8" stroke="var(--rj-gold)" />
        </>
      );
    case 'pendant':
      return (
        <>
          <path d="M28 26c8 12 36 12 44 0" />
          <path d="M50 33v10" />
          <ellipse cx="50" cy="58" rx="13" ry="16" stroke="var(--rj-gold)" />
          <ellipse cx="50" cy="58" rx="17" ry="20" />
        </>
      );
    case 'bangle':
      return (
        <>
          <circle cx="50" cy="50" r="26" />
          <circle cx="50" cy="50" r="21" stroke="var(--rj-hair)" />
          <path d="M50 24v6M50 70v6M24 50h6M70 50h6" stroke="var(--rj-gold)" />
          <path d="M33 33l4 4M67 33l-4 4M33 67l4-4M67 67l-4-4" stroke="var(--rj-hair)" />
        </>
      );
    case 'tikka':
      return (
        <>
          <path d="M22 30c10 10 46 10 56 0" />
          <path d="M50 40v8" />
          <path d="M50 48c-11 4-16 12-16 20a16 16 0 0 0 32 0c0-8-5-16-16-20z" />
          <circle cx="50" cy="64" r="6" stroke="var(--rj-gold)" />
          <path d="M36 74l-3 8M64 74l3 8M50 78v9" stroke="var(--rj-hair)" />
        </>
      );
    case 'jhumka':
      return (
        <>
          <circle cx="50" cy="26" r="4" stroke="var(--rj-gold)" />
          <path d="M50 30v8" />
          <path d="M30 54a20 20 0 0 1 40 0z" />
          <path d="M30 54h40" />
          <path d="M34 58v6M42 58v9M50 58v11M58 58v9M66 58v6" stroke="var(--rj-hair)" />
        </>
      );
    case 'chain':
      return (
        <>
          <path d="M20 34c10 14 40 14 60 0" />
          <path d="M24 48c9 14 34 14 48 0" stroke="var(--rj-hair)" />
          <circle cx="50" cy="52" r="3" stroke="var(--rj-gold)" />
          <path d="M50 26v6" />
        </>
      );
    case 'cuff':
      return (
        <>
          <path d="M28 32a24 24 0 1 0 0 36" />
          <path d="M34 36a18 18 0 1 0 0 28" stroke="var(--rj-hair)" />
          <path d="M28 32l-6-4M28 68l-6 4" stroke="var(--rj-gold)" />
          <path d="M62 40h10M62 50h12M62 60h10" stroke="var(--rj-hair)" />
        </>
      );
  }
}
