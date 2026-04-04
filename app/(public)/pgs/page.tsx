import type { Metadata } from 'next';
import { Building2, MapPin } from 'lucide-react';
import { PGCardGrid } from '@/components/pg/PGCardGrid';
import { hydratePGsWithLiveInventory } from '@/lib/pgs/live';
import { getAllPGs } from '@/lib/sanity/queries/pgSection';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'PGs | PG Inkokrajhar',
  description:
    'Browse all active PG properties, compare locations, and open each property-specific room listing.',
};

export default async function PGListPage() {
  const pgs = await hydratePGsWithLiveInventory(await getAllPGs());

  const activeCities = new Set(
    pgs.map((pg) => pg.city).filter((city): city is string => Boolean(city)),
  ).size;
  const availableRooms = pgs.reduce(
    (total, pg) => total + Math.max(pg.availableRooms || 0, 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
              Browse Properties
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Explore PGs in kokrajhar .
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Discover your ideal PG accommodation in kokrajhar . Compare active
              properties, explore locations, and find the perfect room for your
              needs.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <PGCardGrid pgs={pgs} />
      </section>
    </div>
  );
}

