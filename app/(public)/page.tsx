import { PageRenderer } from '@/components/PageRenderer';
import { PGCardGrid } from '@/components/pg/PGCardGrid';
import { hydratePGsWithLiveInventory } from '@/lib/pgs/live';
import { getHomePageSection } from '@/lib/sanity/queries/getPageSection';
import { getFeaturedPGs } from '@/lib/sanity/queries/pgSection';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60;

export default async function HomePage() {
  const [pageData, featuredPGs] = await Promise.all([
    getHomePageSection(),
    getFeaturedPGs().then(hydratePGsWithLiveInventory),
  ]);

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Available
          </h1>
          <p className="text-gray-600">
            The home page is currently unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageRenderer pageData={pageData} />

      {featuredPGs.length > 0 ? (
        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                  Featured PGs
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Start with the properties we are actively showcasing.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  These PGs are marked as featured in Sanity and already active
                  in the live inventory flow. Open any property to see its
                  dedicated room listing.
                </p>
              </div>

              <Link
                href="/pgs"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Browse All PGs
              </Link>
            </div>

            <div className="mt-10">
              <PGCardGrid pgs={featuredPGs} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

// Generate page-specific metadata
export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getHomePageSection({ stega: false });

  if (!pageData) {
    return {
      title: 'Home | PG Inkokrajhar',
      description: 'Premium PG accommodation in the heart of the city',
    };
  }

  return {
    title: pageData.pageMetadata?.pageTitle || 'Home',
    description:
      pageData.pageMetadata?.pageDescription ||
      'Premium PG accommodation in the heart of the city',
    openGraph: pageData.pageMetadata?.ogImageUrl
      ? {
          images: [pageData.pageMetadata.ogImageUrl],
        }
      : undefined,
  };
}

