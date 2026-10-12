import type { Metadata } from 'next';
import { Layers } from 'lucide-react';
import { WebsiteCard } from '@/components/WebsiteCard';
import { websites } from '@/content/websites/sites';

export const metadata: Metadata = {
  title: 'Apps',
  description:
    'All live demo apps and websites I have built — each with its own distinct style, theme, and design language.',
};

export default function AppsPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-accent">
          <Layers aria-hidden className="h-3.5 w-3.5" />
          Live Demos
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          All Apps
        </h1>
        <p className="mt-3 max-w-2xl text-subtle">
          Full websites and tools I have designed and built, each exploring a different visual
          style and theme. Click a card to open the live app.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {websites.map((site, i) => (
          <div
            key={site.slug}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <WebsiteCard site={site} />
          </div>
        ))}
      </div>
    </div>
  );
}
