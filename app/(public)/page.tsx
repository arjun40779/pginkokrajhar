import { PageRenderer } from '@/components/PageRenderer';
import { getHomePageSection } from '@/lib/sanity/queries/getPageSection';
import type { Metadata } from 'next';

export const revalidate = 60;

export default async function HomePage() {
  // Fetch all page data with a single query
  const pageData = await getHomePageSection();

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

  return <PageRenderer pageData={pageData} />;
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

