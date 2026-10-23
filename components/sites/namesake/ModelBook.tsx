import type { CSSProperties } from 'react';
import { CursorLit } from '@/components/brand/CursorLit';
import { CountUp } from '@/components/brand/CountUp';
import { LineReveal } from '@/components/brand/LineReveal';
import { model } from '@/components/sites/namesake/data';

/**
 * The book a photographer or agency actually reads: the work as print plates,
 * the comp card as a register, and nothing that asks them to scroll a feed.
 */
export function ModelBook() {
  return (
    <section id="modelling" className="nk-section nk-book">
      <p className="nk-kicker">
        <span className="nk-kicker-hot">01</span> <span aria-hidden>/</span> modelling
      </p>
      <h2 className="nk-h2">
        <LineReveal text="Print cards, not a feed of thumbnails." />
      </h2>
      <p className="nk-p nk-p-wide">
        {model.person.name} — {model.role}. Every plate below is a job on the record;
        the caption is what the client booked and what came back.
      </p>

      <CursorLit selector=".nk-lit" className="nk-plates">
        {model.campaigns.map((campaign, i) => (
          <article
            key={campaign.brand}
            className="nk-plate nk-lit"
            style={{ '--i': i } as CSSProperties}
          >
            <span aria-hidden className={`nk-plate-image nk-plate-${campaign.plate}`}>
              <span className="nk-plate-brand">{campaign.brand}</span>
              <span className="nk-plate-year">{campaign.year}</span>
            </span>
            <div className="nk-plate-body">
              <p className="nk-meta">
                {campaign.kind}
                <span aria-hidden>/</span>
                {campaign.year}
              </p>
              <h3 className="nk-h3">{campaign.title}</h3>
              <p className="nk-p">{campaign.caption}</p>
            </div>
          </article>
        ))}
      </CursorLit>

      <div className="nk-book-grid">
        <div className="nk-comp">
          <p className="nk-meta">
            <span className="nk-dot" aria-hidden />
            comp card
          </p>
          <dl className="nk-comp-list">
            {model.book.map((row) => (
              <div key={row.label} className="nk-comp-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="nk-avail">
          <p className="nk-meta">
            <span className="nk-dot" aria-hidden />
            available for
          </p>
          <ul className="nk-chips">
            {model.available.map((item) => (
              <li key={item} className="nk-chip">
                {item}
              </li>
            ))}
          </ul>
          <p className="nk-status">{model.status}</p>
        </div>
      </div>

      <dl className="nk-stats">
        {model.stats.map((stat) => (
          <div key={stat.label} className="nk-stat">
            <dt>
              <CountUp value={stat.value} />
            </dt>
            <dd>{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
