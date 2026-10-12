import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, FolderGit2, Sparkles, ArrowRight } from 'lucide-react';
import { resume } from '@/content/resume/data';
import { sites } from '@/content/demos/sites';
import { DemoCard } from '@/components/DemoCard';
import { TiltCard } from '@/components/TiltCard';
import { SectionHeading } from '@/components/SectionHeading';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: `${resume.name} — ${resume.title}. Case studies of production systems: data platforms, ETL automation and cloud infrastructure.`,
};

const coreStack = [
  'Snowflake',
  'Apache Airflow',
  'PySpark',
  'AWS',
  'Python',
  'SQL',
  'LangGraph',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'Databricks',
  'RAG',
];

export default function HomePage() {
  return (
    <div className="space-y-28">
      {/* HERO */}
      <section className="relative pt-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="animate-fade-up space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 font-mono text-xs text-accent">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              {resume.title} · Software, Data & AI
            </div>

            <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              <span className="text-foreground">Hi, I&apos;m </span>
              <span className="text-gradient text-glow">{resume.name}</span>
            </h1>

            <p className="max-w-xl text-lg text-subtle">
              I design and ship production software — from APIs and interfaces to
              Snowflake-backed data pipelines, ETL automation, and cloud infrastructure on
              AWS, plus AI-agent systems on top.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/portfolio/resume"
                className="focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-background shadow-glow transition-transform hover:-translate-y-0.5 hover:bg-accent-soft"
              >
                <Download aria-hidden className="h-4 w-4" />
                View Resume
              </Link>
              <Link
                href="/portfolio/demos"
                className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-5 py-3 font-semibold text-foreground transition-transform hover:-translate-y-0.5"
              >
                <FolderGit2 aria-hidden className="h-4 w-4 text-accent" />
                Projects
                <ArrowRight aria-hidden className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <dl className="flex gap-8 pt-4">
              {[
                { k: `${sites.length}`, v: 'Featured builds' },
                { k: `${resume.experience.length}`, v: 'Roles' },
                { k: `${resume.skills.length}`, v: 'Skill domains' },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl text-accent">{s.k}</dt>
                  <dd className="font-mono text-xs uppercase tracking-wider text-subtle">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 3D terminal panel */}
          <TiltCard max={12} className="rounded-2xl">
            <div className="rounded-2xl glass p-5 shadow-card-hover">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-accent/80" />
                <span className="ml-2 font-mono text-xs text-subtle">jainil@data-eng: ~</span>
              </div>
              <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground/90">
{`$ whoami
`}
                <span className="text-accent">{resume.name}</span>
                {'\n$ role\n'}
                <span className="text-cyan-300">{resume.title}</span>
                {'\n$ stack --top\n'}
                <span className="text-violet-300">Snowflake · Airflow · PySpark · AWS</span>
                {'\n$ focus\n'}
                <span className="text-foreground/70">pipelines · ETL · AI agents · RAG</span>
                {'\n$ location\n'}
                <span className="text-foreground/70">{resume.location}</span>
                {'\n$ '}
                <span className="animate-glow-pulse text-accent">▋</span>
              </pre>
            </div>
          </TiltCard>
        </div>

        {/* tech marquee */}
        <div className="relative mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <ul className="flex w-max animate-none gap-3 py-2">
            {[...coreStack, ...coreStack].map((tech, i) => (
              <li
                key={`${tech}-${i}`}
                className="whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-subtle"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROJECTS PREVIEW */}
      <section>
        <SectionHeading eyebrow="Selected Work" title="Things I have built">
          Data platforms, SaaS, and AI-agent systems. Each backed by production-grade pipelines.
        </SectionHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <DemoCard key={site.slug} site={site} />
          ))}
        </div>
      </section>
    </div>
  );
}
