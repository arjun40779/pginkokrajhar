import { client } from '@/sanity/lib/client';

// GROQ query to fetch the active hero section with all required fields
const heroSectionQuery = `
  *[_type == "heroSection" && isActive == true][0] {
    _id,
    title,
    badge {
      show,
      icon,
      text
    },
    mainTitle,
    subtitle,
    heroImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt,
      crop,
      hotspot
    },
    ctaButtons[] {
      text,
      url,
      style,
      icon
    },
    stats[] {
      number,
      label,
      icon
    },
    backgroundColor,
    isActive
  }
`;

export interface HeroSection {
  _id: string;
  title: string;
  badge: {
    show: boolean;
    icon: string;
    text: string;
  };
  mainTitle: string;
  subtitle: string;
  heroImage: {
    asset: {
      _id: string;
      url: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
        };
      };
    };
    alt: string;
    crop?: any;
    hotspot?: any;
  };
  ctaButtons: Array<{
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
    icon?: string;
  }>;
  stats: Array<{
    number: string;
    label: string;
    icon?: string;
  }>;
  backgroundColor: string;
  isActive: boolean;
}

// Fetch the active hero section
export async function getHeroSection(): Promise<HeroSection> {
  try {
    console.log('🔍 Fetching hero section...');
    console.log('📋 Client config:', {
      projectId: client.config().projectId,
      dataset: client.config().dataset,
      apiVersion: client.config().apiVersion,
    });

    // Test basic connection first
    console.log('🧪 Testing basic connection...');
    const testQuery = '*[_type == "heroSection"][0...3]{_id, _type, isActive}';
    const testResult = await client.fetch(testQuery);
    console.log('🧪 Test result:', testResult);

    console.log('🔎 Main Query:', heroSectionQuery);

    const heroSection = await client.fetch<HeroSection>(
      heroSectionQuery,
      {},
      {
        // Disable caching for debugging
        cache: 'no-store',
      },
    );

    console.log('✅ Raw response:', heroSection);
    console.log('📊 Response type:', typeof heroSection);
    console.log(
      '🎯 Response length:',
      Array.isArray(heroSection) ? heroSection.length : 'Not an array',
    );

    return heroSection;
  } catch (error) {
    console.error('❌ Error fetching hero section:', error);
    throw new Error('Failed to fetch hero section');
  }
}

// Helper function to generate Sanity image URLs with optimizations
export function getImageUrl(
  image: HeroSection['heroImage'],
  width?: number,
  height?: number,
): string {
  if (!image?.asset?.url) return '';

  const { url } = image.asset;
  const params = new URLSearchParams();

  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());

  // Add image optimization parameters
  params.append('auto', 'format');
  params.append('fit', 'crop');
  params.append('q', '85'); // Quality 85%

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

