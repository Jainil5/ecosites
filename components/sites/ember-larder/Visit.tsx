'use client';

import { larder } from './data';
import { FlameMark } from './FlameMark';
import { Reveal } from './Reveal';

/**
 * Where the door is. The plan is drawn rather than embedded — no map provider,
 * just the lane, the charcoal cart, and a coal that keeps pulsing so the eye
 * lands on the right black rectangle.
 */
export function Visit() {
  return (
    <section id="visit" className="el-band el-visit" aria-label="Where we are">
      <div className="el-shell el-visit-grid">
        <Reveal>
          <p className="el-kicker">Cooperage Lane</p>
          <h2 className="el-display el-h2">
            <span className="el-serif el-h2-em">The black door</span> by the charcoal cart
          </h2>

          <dl className="el-visit-list">
            <div>
              <dt>Finding us</dt>
              <dd>{larder.address}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:+91${larder.phone}`}>{larder.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${larder.email}`}>{larder.email}</a>
              </dd>
            </div>
            <div>
              <dt>Elsewhere</dt>
              <dd className="el-socials">
                {larder.socials.map((s) => (
                  <a key={s.label} href={s.href}>
                    {s.label}
                  </a>
                ))}
              </dd>
            </div>
          </dl>

          <div className="el-hours">
            <p className="el-field-label">When the fire is lit</p>
            <ul>
              {larder.hours.map((h) => (
                <li key={h.days}>
                  <span className="el-hours-day">{h.days}</span>
                  <span className="el-hours-dots" aria-hidden />
                  <span className="el-hours-time">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="el-plan" role="img" aria-label={`Sketch plan: ${larder.address}`}>
            <svg viewBox="0 0 320 260" className="el-plan-svg" aria-hidden>
              <rect x="0" y="0" width="320" height="260" className="el-plan-ground" />
              <path d="M0 96 H320" className="el-plan-road" />
              <path d="M0 108 H320" className="el-plan-road" />
              <path d="M128 0 V260" className="el-plan-road" />
              <path d="M140 0 V260" className="el-plan-road" />
              <rect x="24" y="132" width="86" height="62" className="el-plan-block" />
              <rect x="170" y="30" width="70" height="48" className="el-plan-block" />
              <rect x="246" y="126" width="52" height="60" className="el-plan-block" />
              <rect x="152" y="126" width="66" height="52" className="el-plan-venue" />
              <circle cx="186" cy="152" r="15" className="el-plan-halo" />
              <circle cx="186" cy="152" r="7" className="el-plan-pin" />
              <rect x="44" y="70" width="40" height="20" className="el-plan-cart" />
              <text x="152" y="212" className="el-plan-label">the hearth room</text>
              <text x="24" y="64" className="el-plan-label">charcoal cart</text>
              <text x="214" y="104" className="el-plan-label el-plan-street">12th Main</text>
              <text x="146" y="22" className="el-plan-label el-plan-street">Cooperage Lane</text>
            </svg>
            <div className="el-plan-legend">
              <FlameMark className="el-plan-mark" />
              <span>
                No sign on the door. If you can smell sal wood, you are within forty metres of the
                entrance.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
