import type { ReactNode } from 'react';

interface SectionIntroProps {
  /** Two-digit structural number, e.g. '02'. */
  index: string;
  /** Section name in lowercase — rendered uppercased by the label style. */
  label: string;
  title: string;
  children?: ReactNode;
}

/** The homepage sibling of PageHeader: same language, h2 instead of h1. */
export function SectionIntro({ index, label, title, children }: SectionIntroProps) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="go-label">
        <b>{index}</b> <i>/</i> {label}
      </p>
      <h2 className="slice mt-3 font-display text-3xl text-foreground sm:text-4xl">
        <span className="slice-scroll">{title}</span>
      </h2>
      {children ? <p className="mt-3 leading-relaxed text-subtle">{children}</p> : null}
    </div>
  );
}
