import { tickerPhrases } from './cafe';
import { SunriseMark } from './SunriseMark';

/** Endless ribbon of house lines. Decorative, so the copy repeats unseen. */
export function Ticker() {
  const row = (
    <>
      {tickerPhrases.map((phrase, i) => (
        <span key={`${phrase}-${i}`} className="cc-ticker-cell">
          <span className="cc-display uppercase tracking-[0.16em]">{phrase}</span>
          <SunriseMark className="h-4 w-4 shrink-0 text-[var(--cc-honey)]" />
        </span>
      ))}
    </>
  );

  return (
    <div className="cc-ticker" aria-hidden>
      <div className="cc-ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}
