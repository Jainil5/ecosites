'use client';

import { FREE_SHIPPING_OVER, SHIPPING_FLAT, faqs, quotes } from './data';
import { inr } from './cart';
import { Reveal } from './Reveal';

/**
 * What people said, and what they asked before they bought.
 *
 * The quotes name the piece rather than the moment, because the useful signal
 * for the next buyer is "the 6g jhumka is genuinely light", not "lovely
 * jewellery, thanks". The questions underneath are the five that arrive on
 * WhatsApp most often, answered once in writing so nobody has to wait for a reply.
 */
export function Voices() {
  return (
    <section id="voices" className="rj-band rj-voices" aria-label="Reviews and questions">
      <div className="rj-shell">
        <Reveal>
          <p className="rj-eyebrow">Worn and reported back</p>
          <h2 className="rj-display rj-h2">Three people, three pieces, no photographs of faces.</h2>
        </Reveal>

        <div className="rj-quotes">
          {quotes.map((q, i) => (
            <Reveal key={q.who} delay={i * 0.07} className="rj-quote">
              <blockquote className="rj-quote-text">“{q.text}”</blockquote>
              <p className="rj-quote-who">
                {q.who} · {q.city}
              </p>
              <p className="rj-quote-bought">Ordered the {q.bought}</p>
            </Reveal>
          ))}
        </div>

        <div className="rj-ask">
          <Reveal className="rj-ask-head">
            <p className="rj-eyebrow">Before you ask on WhatsApp</p>
            <h2 className="rj-display rj-h2">The five questions the bench answers most.</h2>
            <p className="rj-lede">
              Courier is {inr(SHIPPING_FLAT)} and free above {inr(FREE_SHIPPING_OVER)}. Rings are
              resized once, free, inside thirty days. Made-to-order pieces are not returnable —
              they were not made for anyone else.
            </p>
          </Reveal>

          <div className="rj-faq">
            {faqs.map((f) => (
              <details key={f.q} className="rj-faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
