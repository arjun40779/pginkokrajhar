import { client } from '@/sanity/lib/client';
import type { ContactLocationSection } from '@/sanity/types';

// GROQ query to fetch the active contact location section with all required fields
export const contactLocationSectionQuery = `
  *[_type == "contactLocationSection" && isActive == true][0] {
    _id,
    title,
    sectionTitle,
    sectionSubtitle,
    locationName,
    address {
      addressLine1,
      addressLine2,
      addressLine3,
    },
    coordinates {
      lat,
      lng
    },
    mapEmbedUrl,
    contactInfo[] {
      _key,
      type,
      label,
      value,
      isPrimary
    },
    operatingHours[] {
      _key,
      days,
      hours,
      isOpen
    },
    description,
    directionsText,
    directionsUrl,
    backgroundColor,
    isActive
  }
`;

// Function to fetch contact location section data
export async function getContactLocationSection(): Promise<ContactLocationSection | null> {
  try {
    console.log('🔍 Fetching contact location section...');

    const data = await client.fetch<ContactLocationSection | null>(
      contactLocationSectionQuery,
    );

    console.log(
      '✅ Contact location section fetched:',
      data ? 'Found' : 'Not found',
    );
    return data;
  } catch (error) {
    console.error('❌ Error fetching contact location section:', error);
    return null;
  }
}

// Function to fetch multiple contact location sections (if supporting multiple locations)
export async function getAllContactLocationSections(): Promise<
  ContactLocationSection[]
> {
  try {
    console.log('🔍 Fetching all contact location sections...');

    const query = `
      *[_type == "contactLocationSection" && isActive == true] | order(_createdAt desc) {
        _id,
        title,
        sectionTitle,
        sectionSubtitle,
        locationName,
        address {
          street,
          city,
          state,
          postalCode,
          country
        },
        coordinates {
          lat,
          lng
        },
        mapImage {
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height
              },
              lqip
            }
          },
          alt,
          crop,
          hotspot
        },
        mapEmbedUrl,
        contactInfo[] {
          _key,
          type,
          label,
          value,
          isPrimary
        },
        operatingHours[] {
          _key,
          days,
          hours,
          isOpen
        },
        description,
        directionsText,
        directionsUrl,
        backgroundColor,
        isActive
      }
    `;

    const data = await client.fetch<ContactLocationSection[]>(query);

    console.log(
      '✅ Contact location sections fetched:',
      data.length,
      'sections',
    );
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching contact location sections:', error);
    return [];
  }
}

