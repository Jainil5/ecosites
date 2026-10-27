'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { larder } from './data';
import { Reveal } from './Reveal';

const sizes = [2, 3, 4, 6, 8, 10, 14];
const sittings = ['18:00', '19:30', '21:00', '22:30'];
const seats = [
  { id: 'rail', label: 'The hearth rail', note: 'Eight stools, close enough to get singed' },
  { id: 'table', label: 'A table in the room', note: 'Twenty-six seats, low ceilings, loud wood' },
  { id: 'long', label: 'The long table', note: 'Six to fourteen, the set dinner only' },
];

interface Held {
  name: string;
  when: string;
  size: number;
  seat: string;
  ref: string;
}

/**
 * The booking sheet. Nothing leaves the page — it validates, prints a hold
 * reference, and hands the phone number over for the real call.
 */
export function Reserve() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(sittings[1]);
  const [size, setSize] = useState(4);
  const [seat, setSeat] = useState(seats[0].id);
  const [held, setHeld] = useState<Held | null>(null);

  const seatLabel = seats.find((s) => s.id === seat)?.label ?? '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setHeld({
      name: name.trim(),
      when: `${date || 'the next service'} at ${time}`,
      size,
      seat: seatLabel,
      ref: `HR-${String(Math.floor(1000 + Math.random() * 9000))}`,
    });
  };

  return (
    <section id="reserve" className="el-band el-reserve" aria-label="Book a table">
      <div className="el-shell el-reserve-grid">
        <Reveal>
          <p className="el-kicker">Twenty-six seats, and the rail goes first</p>
          <h2 className="el-display el-h2">
            <span className="el-serif el-h2-em">Hold a place</span> by the fire
          </h2>
          <p className="el-serif el-reserve-lede">
            We answer the phone between services and write the book down by hand. This form keeps
            your shape of it — {larder.phone} is what actually gets you a table.
          </p>
          <ul className="el-notes el-reserve-notes">
            {larder.hours.map((h) => (
              <li key={h.days}>
                <span className="el-hours-day">{h.days}</span>
                <span className="el-hours-time">{h.time}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="el-form-card">
            <AnimatePresence mode="wait" initial={false}>
              {held ? (
                <motion.div
                  key="held"
                  className="el-held"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="el-kicker">Written in the book</p>
                  <p className="el-held-ref">{held.ref}</p>
                  <p className="el-serif el-held-copy">
                    {held.name ? `${held.name}, we’ve` : 'We’ve'} got {held.size} for {held.when},{' '}
                    {held.seat.toLowerCase()}. {held.seat === 'The hearth rail' && held.size > 4
                      ? 'The rail runs tight past four, so we may ring to move you to the room.'
                      : 'We hold it for twenty minutes past the sitting, then the fire moves on.'}{' '}
                    Nothing left this page — call {larder.phone} and give them {held.ref}.
                  </p>
                  <div className="el-held-actions">
                    <a className="el-btn el-btn-ember" href={`tel:+91${larder.phone}`}>
                      Call {larder.phone}
                    </a>
                    <button type="button" className="el-btn el-btn-ghost" onClick={() => setHeld(null)}>
                      Change it
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="el-form"
                >
                  <div className="el-form-row">
                    <label className="el-field">
                      <span className="el-field-label">Your name</span>
                      <input
                        className="el-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Who the table is for"
                        autoComplete="name"
                      />
                    </label>
                    <label className="el-field">
                      <span className="el-field-label">Phone</span>
                      <input
                        className="el-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10 digits"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                      />
                    </label>
                  </div>

                  <div className="el-form-row">
                    <label className="el-field">
                      <span className="el-field-label">Date</span>
                      <input type="date" className="el-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </label>
                    <div className="el-field">
                      <span className="el-field-label">Sitting</span>
                      <div className="el-chips" role="radiogroup" aria-label="Sitting">
                        {sittings.map((t) => (
                          <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={time === t}
                            className="el-chip"
                            onClick={() => setTime(t)}
                          >
                            {t}
                            {time === t ? <motion.span layoutId="el-chip-time" className="el-chip-fill" /> : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="el-field">
                    <span className="el-field-label">How many</span>
                    <div className="el-chips" role="radiogroup" aria-label="Party size">
                      {sizes.map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={size === n}
                          className="el-chip el-chip-num"
                          onClick={() => setSize(n)}
                        >
                          {n}
                          {size === n ? <motion.span layoutId="el-chip-size" className="el-chip-fill" /> : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="el-field">
                    <span className="el-field-label">Where you want to sit</span>
                    <div className="el-seat-opts">
                      {seats.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="el-seat"
                          aria-pressed={seat === s.id}
                          onClick={() => setSeat(s.id)}
                        >
                          <strong>{s.label}</strong>
                          <span>{s.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="el-btn el-btn-ember el-form-send">
                    Hold the table
                  </button>
                  <p className="el-form-fine">
                    {size} guests · {seatLabel} · the hearth is cold on{' '}
                    {larder.hours[larder.hours.length - 1].days}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
