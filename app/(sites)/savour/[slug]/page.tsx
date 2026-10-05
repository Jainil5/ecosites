import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MenuList } from '@/components/sites/savour/MenuList';
import { PlaceHeader } from '@/components/sites/savour/PlaceHeader';
import { ReviewPanel } from '@/components/sites/savour/ReviewPanel';
import { getPlaceBySlug } from '@/components/sites/savour/server';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  // An outage must not fail the build: return [] and let routes render on demand.
  try {
    const { CATALOG } = await import('@/components/sites/savour/catalog');
    return CATALOG.map((v) => ({ slug: v.place.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPlaceBySlug(slug);
  if (!data) return { title: 'Savour — Pune Food Guide (Demo)' };
  return {
    title: `${data.place.name} — Menu and dishes (Savour demo)`,
    description: `Dishes to try at ${data.place.name}, ${data.place.area ?? data.place.city}, on Savour's Pune food guide.`,
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlaceBySlug(slug);
  if (!data) notFound();
  return (
    <div className="savour min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link href="/savour" className="text-xs text-[var(--sv-muted)] hover:text-[var(--sv-accent)]">
          ← All of Pune
        </Link>
        <PlaceHeader place={data.place} />
        <MenuList items={data.items} />
        <ReviewPanel place={data.place} reviews={data.reviews} />
      </div>
    </div>
  );
}
