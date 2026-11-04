import { brewery } from './brewery';
import { BreweryMark } from './BreweryMark';

const links = [
  { href: '#menu', label: 'Menu' },
  { href: '#story', label: 'Story' },
  { href: '#voices', label: 'Voices' },
  { href: '#feed', label: 'Instagram' },
  { href: '#room', label: 'The room' },
  { href: '#visit', label: 'Visit' },
];

export function SiteFooter() {
  return (
    <footer className="br-footer">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <BreweryMark className="h-7 w-7 text-[var(--br-amber)]" />
              <span className="br-display text-xl leading-none text-[var(--br-cream)]">
                <span className="br-serif font-normal italic text-[var(--br-amber)]">Brew</span>
                <span className="ml-1 uppercase tracking-[0.14em]">ery</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#fbf4e9]/60">{brewery.tagline}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="focus-ring br-display inline-flex min-h-10 items-center rounded text-[12px] uppercase tracking-[0.18em] text-[#fbf4e9]/70 transition-colors hover:text-[var(--br-amber)]"
              >
                {l.label}
              </a>
            ))}
            {brewery.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="focus-ring br-display inline-flex min-h-10 items-center rounded text-[12px] uppercase tracking-[0.18em] text-[#fbf4e9]/70 transition-colors hover:text-[var(--br-amber)]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-[#fbf4e9]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brewery.name}. Brewed on site, gone by midnight.
          </p>
          <p className="br-display uppercase tracking-[0.14em]">{brewery.address}</p>
        </div>
      </div>
    </footer>
  );
}
