import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function SectionHeading({ eyebrow, title, children }: SectionHeadingProps) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
      {children ? <p className="mt-3 text-subtle">{children}</p> : null}
    </div>
  );
}
