import { client } from '@/sanity/lib/client';
import type { AmenitiesSection, Amenity } from '@/sanity/types';

// GROQ query to fetch the active amenities section with all amenities
export const amenitiesSectionQuery = `
  *[_type == "amenitiesSection" && isActive == true][0] {
    _id,
    title,
    sectionTitle,
    sectionSubtitle,
    amenities[] {
      title,
      description,
      icon,
      featured,
      order
    } | order(order asc),
    isActive
  }
`;

// Function to fetch amenities section data
export async function getAmenitiesSection(): Promise<AmenitiesSection | null> {
  try {
    const amenitiesData = await client.fetch<AmenitiesSection>(
      amenitiesSectionQuery,
    );
    return amenitiesData;
  } catch (error) {
    console.error('Error fetching amenities section:', error);
    return null;
  }
}

// Fallback amenities data if Sanity content is not available
export const fallbackAmenities: Amenity[] = [
  {
    title: 'Hygienic Meals',
    description: '3 times nutritious homely meals included in the package',
    icon: 'Utensils',
    featured: true,
    order: 1,
  },
  {
    title: 'High-Speed WiFi',
    description: '24/7 unlimited high-speed internet connectivity',
    icon: 'Wifi',
    featured: true,
    order: 2,
  },
  {
    title: '24/7 Security',
    description: 'CCTV surveillance and secure entry with biometric access',
    icon: 'Shield',
    featured: true,
    order: 3,
  },
  {
    title: 'Laundry Service',
    description: 'Free laundry service with washing machine and dryer',
    icon: 'WashingMachine',
    featured: false,
    order: 4,
  },
  {
    title: 'Study Room',
    description: 'Dedicated quiet study area with library facilities',
    icon: 'BookOpen',
    featured: false,
    order: 5,
  },
  {
    title: 'Common Area',
    description: 'Spacious common room with TV and recreational facilities',
    icon: 'Users',
    featured: false,
    order: 6,
  },
  {
    title: 'Power Backup',
    description: '100% power backup with generator for uninterrupted supply',
    icon: 'Zap',
    featured: false,
    order: 7,
  },
  {
    title: 'Modern Kitchen',
    description: 'Fully equipped shared kitchen with refrigerator',
    icon: 'Refrigerator',
    featured: false,
    order: 8,
  },
];

