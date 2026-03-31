import { client } from '@/sanity/lib/client';
import { pageQuery, homePageQuery } from './pageSection';
import type { PageSectionResponse } from '@/sanity/types';

// Import individual section queries as fallbacks
import { heroSectionQuery } from './heroSection';
import { amenitiesSectionQuery } from './amenitiesSection';
import { facilitiesSectionQuery } from './facilitiesSection';
import { featuresCtaSectionQuery } from './featuresCtaSection';

function normalizePageSlug(slug: string): string {
  let normalizedSlug = slug.trim();

  while (normalizedSlug.endsWith('/')) {
    normalizedSlug = normalizedSlug.slice(0, -1);
  }

  return normalizedSlug || '/home';
}

export async function getPageSection(
  slug: string,
): Promise<PageSectionResponse | null> {
  try {
    const page = await client.fetch(pageQuery, {
      slug: slug,
    });
    return page;
  } catch (error) {
    console.error('Error fetching page section:', error);
    return null;
  }
}

export async function getHomePageSection(): Promise<PageSectionResponse | null> {
  try {
    // First try to fetch from pageSection documents
    const page = await client.fetch(homePageQuery);

    if (page) {
      return page;
    }

    // Fallback: Use individual section queries if no pageSection exists
    console.log('⚠️ No pageSection found, falling back to individual queries');

    const [heroData, amenitiesData, facilitiesData, featuresCtaData] =
      await Promise.all([
        client.fetch(heroSectionQuery),
        client.fetch(amenitiesSectionQuery),
        client.fetch(facilitiesSectionQuery),
        client.fetch(featuresCtaSectionQuery),
      ]);

    // Convert individual sections to pageSection format
    const fallbackPageData: PageSectionResponse = {
      _id: 'fallback-home-page',
      _type: 'pageSection',
      title: 'Home Page (Fallback)',
      slug: 'home',
      isActive: true,
      pageSettings: {
        showBreadcrumbs: false,
        enableComments: false,
        requireAuth: false,
        cachePolicy: 'default',
      },
      sections: [
        heroData && {
          sectionType: 'hero' as const,
          isVisible: true,
          order: 1,
          sectionData: { ...heroData, _type: 'heroSection' as const },
        },
        amenitiesData && {
          sectionType: 'amenities' as const,
          isVisible: true,
          order: 2,
          sectionData: { ...amenitiesData, _type: 'amenitiesSection' as const },
        },
        facilitiesData && {
          sectionType: 'facilities' as const,
          isVisible: true,
          order: 3,
          sectionData: {
            ...facilitiesData,
            _type: 'facilitiesSection' as const,
          },
        },
        featuresCtaData && {
          sectionType: 'featuresCta' as const,
          isVisible: true,
          order: 4,
          sectionData: {
            ...featuresCtaData,
            _type: 'featuresCtaSection' as const,
          },
        },
      ].filter(Boolean) as any,
    };

    console.log(
      '✅ Created fallback pageData with',
      fallbackPageData.sections.length,
      'sections',
    );
    return fallbackPageData;
  } catch (error) {
    console.error('Error fetching home page section:', error);
    return null;
  }
}

