import { resume } from '@/content/resume/data';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="font-mono text-sm text-subtle">
          © {new Date().getFullYear()} {resume.name} · {resume.title}
        </p>
        <div className="flex items-center gap-5">
          <a
            href={`mailto:${resume.email}`}
            className="focus-ring rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
          >
            Email
          </a>
          {resume.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded font-mono text-sm text-subtle transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
