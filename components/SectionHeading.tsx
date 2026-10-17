import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="gs-label gs-label-hot">{eyebrow}</p>
      <h2 className="gs-display gs-h3 slice mt-3">
        <span className="slice-scroll">{title}</span>
      </h2>
      {children ? <p className="mt-4 leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  );
}
