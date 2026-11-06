'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { GST_RATE, maker, pieces } from './data';
import { Reveal } from './Reveal';

const STEPS = [
  {
    n: '01',
    title: 'You choose the piece and the size',
    body: 'Every shape here has its number on it — a diameter, a chain length, a ring size. If yours is not listed, write it in the notes.',
  },
  {
    n: '02',
    title: 'She replies with a date',
    body: 'Not a form letter: a message saying when the metal is cut and when it leaves. That reply is the order being confirmed.',
  },
  {
    n: '03',
    title: 'It is made at the bench',
    body: 'Saw, file, hammer, setting. The photograph that goes out is of your piece, not of the one on this page.',
  },
  {
    n: '04',
    title: 'Boxed, tracked, and yours to keep',
    body: 'Tracking on WhatsApp the day it is packed, and the resizing that follows is free for the first thirty days.',
  },
];

/**
 * The person behind the prices.
 *
 * A made-to-order shop lives or dies on whether the buyer believes someone is
 * actually making it, so this band answers the questions a customer asks before
 * they ask for anything: whose hands, what metal, how long, and what happens
 * when it arrives.
 */
export function Story() {
  const metals = new Set(pieces.map((p) => p.metal)).size;
  const longest = Math.max(...pieces.map((p) => p.lead[1]));

  return (
    <>
      <section id="maker" className="rj-band rj-maker" aria-label="The maker">
        <div className="rj-shell rj-maker-grid">
          <div className="rj-maker-figure">
            <Image
              src="/ruhani/bench.jpg"
              alt="A jeweller's workbench: files, a magnifier, pliers and silver blank on a cloth mat"
              width={1600}
              height={1073}
              sizes="(max-width: 900px) 100vw, 52vw"
              className="rj-maker-img"
            />
            <figcaption>{maker.studio}</figcaption>
          </div>

          <Reveal className="rj-maker-copy">
            <p className="rj-eyebrow">{maker.kicker}</p>
            <h2 className="rj-display rj-h2">{maker.line}</h2>
            <p className="rj-lede">{maker.intro}</p>
            <p className="rj-body">{maker.story}</p>

            <dl className="rj-facts">
              <div>
                <dt>Pieces on the shelf</dt>
                <dd>{pieces.length}</dd>
              </div>
              <div>
                <dt>Metals worked</dt>
                <dd>{metals}</dd>
              </div>
              <div>
                <dt>Longest make</dt>
                <dd>{longest} days</dd>
              </div>
              <div>
                <dt>People making it</dt>
                <dd>1</dd>
              </div>
            </dl>

            <p className="rj-note">{maker.hallmarkNote}</p>
          </Reveal>
        </div>
      </section>

      <section id="how" className="rj-band rj-how" aria-label="How an order works">
        <div className="rj-shell">
          <Reveal>
            <p className="rj-eyebrow">Four steps, no checkout till the end</p>
            <h2 className="rj-display rj-h2">How a piece gets from here to your ear.</h2>
          </Reveal>
          <ol className="rj-steps">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                className="rj-step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="rj-step-n">{s.n}</span>
                <h3 className="rj-step-title">{s.title}</h3>
                <p>{s.body}</p>
              </motion.li>
            ))}
          </ol>
          <p className="rj-how-fine">
            Prices throughout this site are written inclusive of the {GST_RATE}% GST that gold and
            silver are sold at in India, and the box shows that {GST_RATE}% as its own line — you
            never find the tax after you have said yes.
          </p>
        </div>
      </section>
    </>
  );
}
