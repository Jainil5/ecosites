import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Two-digit structural number, e.g. '02'. */
  index: string;
  /** Section name in lowercase — rendered uppercased by the label style. */
  label: string;
  title: string;
  children?: ReactNode;
}

/** Subpage header in the manifesto language: number, poster caps, lead. */
export function PageHeader({ index, label, title, children }: PageHeaderProps) {
  return (
    <header className="mb-14 gs-band-rise">
      <p className="gs-label">
        <span className="gs-label-hot">{index}</span> <span aria-hidden>/</span> {label}
      </p>
      <h1 className="gs-display gs-h2 mt-3">{title}</h1>
      {children ? (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">{children}</p>
      ) : null}
    </header>
  );
}
