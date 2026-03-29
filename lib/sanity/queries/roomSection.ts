import { client } from '@/sanity/lib/client';
import type { SanityRoom, SanityImage, SanityAmenity } from './pgSection';

// Re-export shared types
export type { SanityRoom, SanityImage, SanityAmenity };

// GROQ query for all rooms (customer-facing)
export const roomListQuery = `
  *[_type == "room" && isActive == true] | order(_createdAt desc) {
    _id,
    dbId,
    roomNumber,
    slug,
    description,
    roomType,
    maxOccupancy,
    currentOccupancy,
    floor,
    roomSize,
    hasBalcony,
    hasAttachedBath,
    hasAC,
    hasFan,
    windowDirection,
    monthlyRent,
    securityDeposit,
    maintenanceCharges,
    electricityIncluded,
    availabilityStatus,
    availableFrom,
    featured,
    features[] {
      name,
      available,
      description
    },
    images[] {
      asset-> {
        _id,
        url,
        metadata {
          dimensions { width, height }
        }
      },
      alt,
      caption,
      crop,
      hotspot
    },
    pgReference-> {
      _id,
      dbId,
      name,
      slug,
      area,
      city,
      genderRestriction,
      images[0] {
        asset-> { _id, url },
        alt
      }
    },
    pgId
  }
`;

// GROQ query for rooms by PG database ID
export const roomsByPGQuery = `
  *[_type == "room" && pgId == $pgDbId && isActive == true] | order(roomNumber asc) {
    _id,
    dbId,
    roomNumber,
    slug,
    description,
    roomType,
    maxOccupancy,
    currentOccupancy,
    floor,
    roomSize,
    hasBalcony,
    hasAttachedBath,
    hasAC,
    hasFan,
    windowDirection,
    monthlyRent,
    securityDeposit,
    maintenanceCharges,
    electricityIncluded,
    availabilityStatus,
    availableFrom,
    featured,
    features[] {
      name,
      available,
      description
    },
    images[] {
      asset-> {
        _id,
        url,
        metadata {
          dimensions { width, height }
        }
      },
      alt,
      caption,
      crop,
      hotspot
    }
  }
`;

// GROQ query for a single room detail
export const roomDetailQuery = `
  *[_type == "room" && dbId == $dbId && isActive == true][0] {
    _id,
    dbId,
    roomNumber,
    slug,
    description,
    roomType,
    maxOccupancy,
    currentOccupancy,
    floor,
    roomSize,
    hasBalcony,
    hasAttachedBath,
    hasAC,
    hasFan,
    windowDirection,
    monthlyRent,
    securityDeposit,
    maintenanceCharges,
    electricityIncluded,
    availabilityStatus,
    availableFrom,
    featured,
    features[] {
      name,
      available,
      description
    },
    images[] {
      asset-> {
        _id,
        url,
        metadata {
          dimensions { width, height }
        }
      },
      alt,
      caption,
      crop,
      hotspot
    },
    content,
    pgReference-> {
      _id,
      dbId,
      name,
      slug,
      area,
      city,
      state,
      address,
      genderRestriction,
      ownerPhone,
      ownerEmail,
      images[0] {
        asset-> { _id, url },
        alt
      }
    },
    pgId
  }
`;

// Extended room type with PG reference for list views
export interface SanityRoomWithPG extends SanityRoom {
  pgReference?: {
    _id: string;
    dbId: string;
    name: string;
    slug: { current: string };
    area: string;
    city: string;
    genderRestriction: string;
    images?: SanityImage[];
  };
}

// Fetch functions
export async function getAllRooms(): Promise<SanityRoomWithPG[]> {
  try {
    const rooms = await client.fetch<SanityRoomWithPG[]>(roomListQuery);
    return rooms || [];
  } catch (error) {
    console.error('Error fetching rooms from Sanity:', error);
    return [];
  }
}

export async function getRoomsByPG(pgDbId: string): Promise<SanityRoom[]> {
  try {
    const rooms = await client.fetch<SanityRoom[]>(roomsByPGQuery, { pgDbId });
    return rooms || [];
  } catch (error) {
    console.error(`Error fetching rooms for PG ${pgDbId} from Sanity:`, error);
    return [];
  }
}

export async function getRoomByDbId(dbId: string): Promise<SanityRoomWithPG | null> {
  try {
    return await client.fetch<SanityRoomWithPG>(roomDetailQuery, { dbId });
  } catch (error) {
    console.error(`Error fetching room ${dbId} from Sanity:`, error);
    return null;
  }
}
