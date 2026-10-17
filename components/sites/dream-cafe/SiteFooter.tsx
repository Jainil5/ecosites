import { cafe } from './cafe';
import { SunriseMark } from './SunriseMark';

const links = [
  { href: '#menu', label: 'Menu' },
  { href: '#room', label: 'The room' },
  { href: '#visit', label: 'Visit' },
];

export function SiteFooter() {
  return (
    <footer className="dc-footer">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <SunriseMark className="h-7 w-7 text-[var(--dc-honey)]" />
              <span className="dc-display text-xl leading-none text-[var(--dc-cream)]">
                <span className="dc-serif font-normal italic text-[var(--dc-honey)]">Dream</span>
                <span className="ml-1 uppercase tracking-[0.14em]">Cafe</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--dc-cream)]/60">{cafe.tagline}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="focus-ring dc-display rounded text-[12px] uppercase tracking-[0.18em] text-[var(--dc-cream)]/70 transition-colors hover:text-[var(--dc-honey)]"
              >
                {l.label}
              </a>
            ))}
            {cafe.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="focus-ring dc-display rounded text-[12px] uppercase tracking-[0.18em] text-[var(--dc-cream)]/70 transition-colors hover:text-[var(--dc-honey)]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-[var(--dc-cream)]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {cafe.name}. Baked daily, sold out by two most Saturdays.
          </p>
          <p className="dc-display uppercase tracking-[0.14em]">{cafe.address}</p>
        </div>
      </div>
    </footer>
  );
}
