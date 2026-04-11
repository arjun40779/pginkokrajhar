import type { PgGridSection as PgGridSectionType } from '@/sanity/types';
import { PGCardGrid } from '@/components/pg/PGCardGrid';
import { hydratePGsWithLiveInventory } from '@/lib/pgs/live';
import { getAllPGs } from '@/lib/sanity/queries/pgSection';

interface PgGridSectionProps {
  sectionData: PgGridSectionType;
}

export async function PgGridSection({
  sectionData,
}: Readonly<PgGridSectionProps>) {
  if (!sectionData?.isActive) return null;

  const pgs = await hydratePGsWithLiveInventory(await getAllPGs());

  if (!pgs.length) return null;

  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
          {sectionData.title}
        </h2>
        <PGCardGrid pgs={pgs} />
      </div>
    </section>
  );
}

