'use client';

import Image from 'next/image';
import { gifting, maker } from './data';
import { Reveal } from './Reveal';

/**
 * The part of a jewellery order that is not about the jewellery.
 *
 * Most of what leaves this bench is for someone else, so the packing gets its
 * own band — and its own photograph, because a box is the only thing a buyer
 * can be shown before the piece exists.
 */
export function Gifting() {
  return (
    <section id="gifting" className="rj-band rj-gifting" aria-label="Gifting">
      <div className="rj-shell rj-gift-grid">
        <Reveal className="rj-gift-copy">
          <p className="rj-eyebrow">For someone else</p>
          <h2 className="rj-display rj-h2">{gifting.title}</h2>
          <p className="rj-lede">{gifting.line}</p>
          <ul className="rj-gift-points">
            {gifting.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="rj-gift-fine">
            Say in the message what the card should read. She writes it out at the bench, in the
            same hand she uses to label the box — {maker.name} is one person, and it
            stays that way.
          </p>
        </Reveal>

        <div className="rj-gift-figure">
          <Image
            src="/ruhani/gifting.jpg"
            alt="A jewellery gift box with a handwritten card, cotton ribbon and anti-tarnish pouch on tissue paper"
            width={1400}
            height={1128}
            sizes="(max-width: 900px) 100vw, 46vw"
            className="rj-gift-img"
          />
          <figcaption>Tissue, ribbon, card, cloth — folded the same way every time.</figcaption>
        </div>
      </div>
    </section>
  );
}
