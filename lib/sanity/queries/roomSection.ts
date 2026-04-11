import { fetchSanityQuery } from '@/sanity/lib/fetch';
import type { SanityRoom, SanityImage } from './pgSection';
import { Room } from '@/components/pages/Rooms';

export type { SanityRoom, SanityImage, SanityAmenity } from './pgSection';

export interface RoomPricingIncludesSectionData {
  _id: string;
  title: string;
  roomAmenities: string[];
  commonFacilities: string[];
}

export interface RoomsPageData {
  rooms: Room[];
  pricingIncludesSection: RoomPricingIncludesSectionData | null;
}

// GROQ query for all rooms (customer-facing)
export const roomListQuery = `
  *[_type == "room"] | order(_createdAt desc) {
    _id,
    dbId,
    title,
    slug,
    description,
    roomType,
    maxOccupancy,
    monthlyRent,
    securityDeposit,
    maintenanceCharges,
    featured,
    amenities,
    availabilityStatus,
    "heroImage": coalesce(heroImage, images[0]) {
      asset-> {
        _id,
        url
      }
    }
  }
`;

export const roomsPageQuery = `
  {
    "rooms": *[_type == "room"] | order(_createdAt desc) {
      _id,
      dbId,
      title,
      slug,
      description,
      roomType,
      maxOccupancy,
      monthlyRent,
      securityDeposit,
      maintenanceCharges,
      featured,
      amenities,
      availabilityStatus,
      "heroImage": coalesce(heroImage, images[0]) {
        asset-> {
          _id,
          url
        }
      }
    },
    "pricingIncludesSection": *[_type == "roomPricingIncludesSection" && isActive == true] | order(_updatedAt desc)[0] {
      _id,
      title,
      roomAmenities,
      commonFacilities
    }
  }
`;

export const roomsPageByPGQuery = `
  {
    "rooms": *[_type == "room" && pgId == $pgDbId] | order(roomNumber asc) {
      _id,
      dbId,
      title,
      slug,
      description,
      roomType,
      maxOccupancy,
      currentOccupancy,
      monthlyRent,
      securityDeposit,
      maintenanceCharges,
      featured,
      "amenities": coalesce(amenities, features[available == true].name),
      availabilityStatus,
      "heroImage": coalesce(heroImage, images[0]) {
        asset-> {
          _id,
          url
        }
      }
    },
    "pricingIncludesSection": *[_type == "roomPricingIncludesSection" && isActive == true] | order(_updatedAt desc)[0] {
      _id,
      title,
      roomAmenities,
      commonFacilities
    }
  }
`;

// GROQ query for rooms by PG database ID
export const roomsByPGQuery = `
  *[_type == "room" && pgId == $pgDbId] | order(roomNumber asc) {
    _id,
    dbId,
    roomNumber,
    title,
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
  *[_type == "room" && dbId == $dbId][0] {
    _id,
    dbId,
    roomNumber,
    title,
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
    amenities,
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

export const roomDetailBySlugQuery = `
  *[_type == "room" && slug.current == $slug][0] {
    _id,
    dbId,
    roomNumber,
    title,
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
    amenities,
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

export const roomPageDetailBySlugQuery = `
  *[_type == "room" && slug.current == $slug][0] {
    _id,
    dbId,
    roomNumber,
    title,
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
    heroImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions { width, height }
        }
      }
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
    amenities,
    features[] {
      name,
      available,
      description
    },
    content,
    pgReference-> {
      _id,
      dbId,
      name,
      slug,
      description,
      address,
      area,
      city,
      state,
      pincode,
      ownerName,
      ownerPhone,
      ownerEmail,
      genderRestriction,
      gateClosingTime,
      smokingAllowed,
      drinkingAllowed,
      startingPrice,
      electricityIncluded,
      waterIncluded,
      wifiIncluded,
      totalRooms,
      availableRooms,
      featured,
      verificationStatus,
      amenities[] {
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
      content
    },
    pgId
  }
`;

// Extended room type with PG reference for list views
export interface SanityRoomWithPG extends SanityRoom {
  pgId?: string;
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
  amenities?: string[];
}

export interface SanityRoomPageDetail extends SanityRoomWithPG {
  heroImage?: SanityImage;
  content?: Array<{
    _type?: string;
    children?: Array<{ _type?: string; text?: string }>;
  }>;
  pgReference?: SanityRoomWithPG['pgReference'] & {
    description?: string;
    address?: string;
    state?: string;
    pincode?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    gateClosingTime?: string;
    smokingAllowed?: boolean;
    drinkingAllowed?: boolean;
    startingPrice?: number;
    electricityIncluded?: boolean;
    waterIncluded?: boolean;
    wifiIncluded?: boolean;
    totalRooms?: number;
    availableRooms?: number;
    featured?: boolean;
    verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
    amenities?: Array<{
      name: string;
      available: boolean;
      description?: string;
    }>;
    content?: Array<{
      _type?: string;
      children?: Array<{ _type?: string; text?: string }>;
    }>;
  };
}

// Fetch functions
export async function getAllRooms(): Promise<Room[]> {
  try {
    const rooms = await fetchSanityQuery<Room[]>({
      query: roomListQuery,
    });
    return rooms || [];
  } catch (error) {
    console.error('Error fetching rooms from Sanity:', error);
    return [];
  }
}

export async function getRoomsPageData(): Promise<RoomsPageData> {
  try {
    const data = await fetchSanityQuery<RoomsPageData>({
      query: roomsPageQuery,
    });
    return {
      rooms: data?.rooms || [],
      pricingIncludesSection: data?.pricingIncludesSection || null,
    };
  } catch (error) {
    console.error('Error fetching rooms page data from Sanity:', error);
    return {
      rooms: [],
      pricingIncludesSection: null,
    };
  }
}

export async function getRoomsPageDataByPG(
  pgDbId: string,
): Promise<RoomsPageData> {
  try {
    const data = await fetchSanityQuery<RoomsPageData>({
      query: roomsPageByPGQuery,
      params: { pgDbId },
    });
    return {
      rooms: data?.rooms || [],
      pricingIncludesSection: data?.pricingIncludesSection || null,
    };
  } catch (error) {
    console.error(`Error fetching rooms page data for PG ${pgDbId}:`, error);
    return {
      rooms: [],
      pricingIncludesSection: null,
    };
  }
}

export async function getRoomsByPG(pgDbId: string): Promise<SanityRoom[]> {
  try {
    const rooms = await fetchSanityQuery<SanityRoom[]>({
      query: roomsByPGQuery,
      params: { pgDbId },
    });
    return rooms || [];
  } catch (error) {
    console.error(`Error fetching rooms for PG ${pgDbId} from Sanity:`, error);
    return [];
  }
}

export async function getRoomByDbId(
  dbId: string,
): Promise<SanityRoomWithPG | null> {
  try {
    return await fetchSanityQuery<SanityRoomWithPG | null>({
      query: roomDetailQuery,
      params: { dbId },
    });
  } catch (error) {
    console.error(`Error fetching room ${dbId} from Sanity:`, error);
    return null;
  }
}

export async function getRoomBySlug(
  slug: string,
): Promise<SanityRoomWithPG | null> {
  try {
    return await fetchSanityQuery<SanityRoomWithPG | null>({
      query: roomDetailBySlugQuery,
      params: {
        slug,
      },
    });
  } catch (error) {
    console.error(`Error fetching room ${slug} from Sanity:`, error);
    return null;
  }
}

export async function getRoomPageDetailBySlug(
  slug: string,
): Promise<SanityRoomPageDetail | null> {
  try {
    return await fetchSanityQuery<SanityRoomPageDetail | null>({
      query: roomPageDetailBySlugQuery,
      params: {
        slug,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching room page detail ${slug} from Sanity:`,
      error,
    );
    return null;
  }
}

