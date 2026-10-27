import { FlameMark } from './FlameMark';
import { larder } from './data';

const links = [
  { href: '#products', label: 'The card' },
  { href: '#hearth', label: 'The hearth' },
  { href: '#set-dinner', label: 'Set dinner' },
  { href: '#voices', label: 'Voices' },
  { href: '#reserve', label: 'Book' },
  { href: '#visit', label: 'Visit' },
];

export function SiteFooter() {
  return (
    <footer className="el-footer">
      <div className="el-shell el-footer-grid">
        <div className="el-footer-brand">
          <span className="el-footer-name">
            <FlameMark className="el-footer-mark" />
            <span>
              <span className="el-brand-serif">Ember</span> <span className="el-brand-caps">Larder</span>
            </span>
          </span>
          <p className="el-serif el-footer-tag">{larder.tagline}</p>
          <p className="el-footer-kick">{larder.kicker}</p>
        </div>

        <nav aria-label="Footer" className="el-footer-nav">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {larder.socials.map((s) => (
            <a key={s.label} href={s.href}>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="el-footer-meta">
          <a href={`mailto:${larder.email}`}>{larder.email}</a>
          <a href={`tel:+91${larder.phone}`}>{larder.phone}</a>
          <a href="#top" className="el-footer-top">
            Back to the fire ↑
          </a>
        </div>
      </div>

      <div className="el-shell el-footer-base">
        <p>
          © {new Date().getFullYear()} {larder.name}. {larder.address}
        </p>
        <p className="el-footer-note">
          A studio build — sample prices, no reservations actually taken, and the photographs were
          made for this page.
        </p>
      </div>
    </footer>
  );
}
