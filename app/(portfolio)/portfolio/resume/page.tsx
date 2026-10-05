import type { Metadata } from 'next';
import { Download, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { resume } from '@/content/resume/data';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Resume',
  description: resume.summary,
};

export default function ResumePage() {
  return (
    <div className="space-y-16">
      {/* Header card */}
      <section className="rounded-3xl glass p-8 shadow-card">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Resume</p>
            <h1 className="mt-2 font-display text-4xl text-foreground">{resume.name}</h1>
            <p className="mt-1 text-lg text-subtle">{resume.title}</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm text-subtle">
              <li className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden className="h-4 w-4 text-accent" /> {resume.location}
              </li>
              <li>
                <a href={`mailto:${resume.email}`} className="inline-flex items-center gap-1.5 hover:text-accent">
                  <Mail aria-hidden className="h-4 w-4 text-accent" /> {resume.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Phone aria-hidden className="h-4 w-4 text-accent" /> {resume.phone}
              </li>
              {resume.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <ExternalLink aria-hidden className="h-4 w-4 text-accent" /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/resume/resume.pdf"
            download
            className="focus-ring inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-xl bg-accent px-5 py-3 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            <Download aria-hidden className="h-4 w-4" />
            Download PDF
          </a>
        </div>

        <p className="mt-6 max-w-3xl text-subtle">{resume.summary}</p>
      </section>

      {/* Experience */}
      <section>
        <SectionHeading eyebrow="Career" title="Experience" />
        <ol className="relative space-y-8 border-l border-white/10 pl-6">
          {resume.experience.map((job) => (
            <li key={`${job.company}-${job.period}`} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-accent shadow-glow"
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-display text-xl text-foreground">
                  {job.role} <span className="text-subtle">· {job.company}</span>
                </h3>
                <span className="font-mono text-xs text-subtle">{job.period}</span>
              </div>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-subtle marker:text-accent">
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Skills */}
      <section>
        <SectionHeading eyebrow="Toolkit" title="Technical Skills" />
        <div className="grid gap-5 sm:grid-cols-2">
          {resume.skills.map((group) => (
            <div key={group.label} className="rounded-2xl glass p-5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
                {group.label}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-foreground/85"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education + Certifications */}
      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Academics" title="Education" />
          <div className="space-y-4">
            {resume.education.map((ed) => (
              <div key={ed.school} className="rounded-2xl glass p-5">
                <h3 className="font-display text-lg text-foreground">{ed.school}</h3>
                <p className="text-sm text-subtle">{ed.degree}</p>
                <p className="mt-1 font-mono text-xs text-accent">{ed.period}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Credentials" title="Certifications" />
          <ul className="space-y-3">
            {resume.certifications.map((c) => (
              <li key={c} className="flex items-start gap-3 rounded-2xl glass p-4 text-sm text-foreground/90">
                <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
