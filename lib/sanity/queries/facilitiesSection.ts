import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { FacilitiesSection, Facility } from '@/sanity/types';

// GROQ query to fetch the active facilities section with all facilities
export const facilitiesSectionQuery = `
  *[_type == "facilitiesSection" && isActive == true][0] {
    _id,
    title,
    sectionTitle,
    sectionSubtitle,
    layout,
    facilities[] {
      title,
      description,
      image {
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
      featured,
      category,
      order
    } | order(order asc),
    isActive
  }
`;

// Function to fetch facilities section data
export async function getFacilitiesSection(): Promise<FacilitiesSection | null> {
  try {
    const facilitiesData = await client.fetch<FacilitiesSection>(
      facilitiesSectionQuery,
    );
    return facilitiesData;
  } catch (error) {
    console.error('Error fetching facilities section:', error);
    return null;
  }
}

// Function to get optimized image URL for facilities
export function getFacilityImageUrl(
  facility: Facility,
  width: number = 600,
  height: number = 400,
): string {
  if (!facility.image?.asset) {
    return '';
  }

  return urlFor(facility.image)
    .width(width)
    .height(height)
    .fit('crop')
    .auto('format')
    .url();
}

// Fallback facilities data if Sanity content is not available
export const fallbackFacilities: Array<{
  url: string;
  label: string;
  description?: string;
}> = [
  {
    url: 'https://images.unsplash.com/photo-1758523417921-0f4884c38481?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaGFyZWQlMjBraXRjaGVufGVufDF8fHx8MTc3Mzc1NDg5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Modern Kitchen',
    description: 'Fully equipped shared kitchen with modern appliances',
  },
  {
    url: 'https://images.unsplash.com/photo-1749671232817-1f224147f0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMHJvb20lMjBsaWJyYXJ5JTIwZGVza3xlbnwxfHx8fDE3NzM3NTQ5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Study Area',
    description:
      'Quiet study spaces with comfortable seating and good lighting',
  },
  {
    url: 'https://images.unsplash.com/photo-1758253382580-409c579742ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZhY2lsaXRpZXN8ZW58MXx8fHwxNzczNzU0ODk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Laundry Service',
    description: 'Professional laundry facilities for your convenience',
  },
];

