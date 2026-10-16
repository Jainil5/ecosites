import { tickerPhrases } from './cafe';
import { SunriseMark } from './SunriseMark';

/** Endless ribbon of house lines. Decorative, so the copy repeats unseen. */
export function Ticker() {
  const row = (
    <>
      {tickerPhrases.map((phrase, i) => (
        <span key={`${phrase}-${i}`} className="dc-ticker-cell">
          <span className="dc-display uppercase tracking-[0.16em]">{phrase}</span>
          <SunriseMark className="h-4 w-4 shrink-0 text-[var(--dc-honey)]" />
        </span>
      ))}
    </>
  );

  return (
    <div className="dc-ticker" aria-hidden>
      <div className="dc-ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}
