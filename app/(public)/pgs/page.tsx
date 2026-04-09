import type { Metadata } from 'next';
import { PGCardGrid } from '@/components/pg/PGCardGrid';
import { PgsHero } from '@/components/sections/PgsHero';
import { hydratePGsWithLiveInventory } from '@/lib/pgs/live';
import { getAllPGs } from '@/lib/sanity/queries/pgSection';
import { getPgsHeroSection } from '@/lib/sanity/queries/pgsHeroSection';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'PGs | PG Inkokrajhar',
  description:
    'Browse all active PG properties, compare locations, and open each property-specific room listing.',
};

export default async function PGListPage() {
  const [pgsHero, pgs] = await Promise.all([
    getPgsHeroSection(),
    hydratePGsWithLiveInventory(await getAllPGs()),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {pgsHero && <PgsHero data={pgsHero} />}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <PGCardGrid pgs={pgs} />
      </section>
    </div>
  );
}

