import type { CSSProperties } from 'react';
import { CursorLit } from '@/components/brand/CursorLit';
import { CountUp } from '@/components/brand/CountUp';
import { LineReveal } from '@/components/brand/LineReveal';
import { dev } from '@/components/sites/namesake/data';

/**
 * The same product read by an engineering manager: what shipped, at what size,
 * with the log still open. Sticky-stacked cards so the four projects arrive one
 * over the last, the way a reviewer actually scrolls a portfolio.
 */
export function DevPortfolio() {
  return (
    <section id="developer" className="nk-section nk-dev">
      <p className="nk-kicker">
        <span className="nk-kicker-hot">02</span> <span aria-hidden>/</span> developer
      </p>
      <h2 className="nk-h2">
        <LineReveal text="A CV that reads like a changelog." />
      </h2>
      <p className="nk-p nk-p-wide">
        {dev.person.name} — {dev.role}. {dev.status}. No case-study poetry: the
        system, the constraint, the number that moved.
      </p>

      <div className="nk-stack">
        {dev.projects.map((project, i) => (
          <article
            key={project.name}
            className="nk-project"
            style={{ '--i': i } as CSSProperties}
          >
            <header className="nk-project-head">
              <span className="nk-project-no">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="nk-h3">{project.name}</h3>
              <span className="nk-project-kind">{project.kind}</span>
              <span className="nk-project-year">{project.year}</span>
            </header>
            <p className="nk-p">{project.summary}</p>
            <footer className="nk-project-foot">
              <ul className="nk-tags">
                {project.stack.map((item) => (
                  <li key={item} className="nk-tag">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="nk-project-metric">{project.metric}</p>
            </footer>
          </article>
        ))}
      </div>

      <div className="nk-dev-grid">
        <div className="nk-log">
          <p className="nk-meta">
            <span className="nk-dot" aria-hidden />
            shipping log
          </p>
          <ul>
            {dev.log.map((entry) => (
              <li key={entry.what} className="nk-log-row">
                <span className="nk-log-when">{entry.when}</span>
                <span className="nk-log-what">{entry.what}</span>
              </li>
            ))}
          </ul>
        </div>

        <CursorLit selector=".nk-lit" className="nk-skills">
          <p className="nk-meta">
            <span className="nk-dot" aria-hidden />
            stack
          </p>
          <ul className="nk-skill-grid">
            {dev.stack.map((item) => (
              <li key={item} className="nk-skill nk-lit">
                {item}
              </li>
            ))}
          </ul>
          <ul className="nk-links">
            {dev.links.map((item) => (
              <li key={item} className="nk-link">
                {item}
              </li>
            ))}
          </ul>
        </CursorLit>
      </div>

      <dl className="nk-stats">
        {dev.stats.map((stat) => (
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
