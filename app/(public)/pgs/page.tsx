import type { Metadata } from 'next';
import { PgsHero } from '@/components/sections/PgsHero';
import { PageRenderer } from '@/components/PageRenderer';
import { getPgsHeroSection } from '@/lib/sanity/queries/pgsHeroSection';
import { getPageSection } from '@/lib/sanity/queries/getPageSection';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'PGs | PG Inkokrajhar',
  description:
    'Browse all active PG properties, compare locations, and open each property-specific room listing.',
};

export default async function PGListPage() {
  const [pgsHero, pageData] = await Promise.all([
    getPgsHeroSection(),
    getPageSection('pgs'),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {pageData && <PageRenderer pageData={pageData} />}
    </div>
  );
}

