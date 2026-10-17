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
      <p className="gs-label">
        <span className="gs-label-hot">{index}</span> <span aria-hidden>/</span> {label}
      </p>
      <h2 className="gs-display gs-h3 mt-3">{title}</h2>
      {children ? <p className="mt-4 leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  );
}
