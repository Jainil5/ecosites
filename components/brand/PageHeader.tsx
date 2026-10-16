import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Two-digit structural number, e.g. '02'. */
  index: string;
  /** Section name in lowercase — rendered uppercased by the label style. */
  label: string;
  title: string;
  children?: ReactNode;
}

/** Subpage header in the manifesto language: number, slice-revealed title, lead. */
export function PageHeader({ index, label, title, children }: PageHeaderProps) {
  return (
    <header className="mb-14">
      <p className="go-label animate-fade-up">
        <b>{index}</b> <i>/</i> {label}
      </p>
      <h1 className="slice mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        <span className="slice-inner">{title}</span>
      </h1>
      {children ? <p className="mt-4 max-w-2xl leading-relaxed text-subtle">{children}</p> : null}
    </header>
  );
}
