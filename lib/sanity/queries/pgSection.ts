import { fetchSanityQuery } from '@/sanity/lib/fetch';

// GROQ query for PG listings (customer-facing)
export const pgListQuery = `*[_type == "pg" && isActive == true] | order(_createdAt desc) {
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

  coordinates {
    latitude,
    longitude
  },

  genderRestriction,
  startingPrice,
  securityDeposit,
  brokerageCharges,
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

  heroImage {
    asset->{
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
    caption,
    crop,
    hotspot
  },

  images[] {
    asset->{
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
    caption,
    crop,
    hotspot
  }
}
`;

// GROQ query for a single PG detail with its rooms
export const pgDetailQuery = `
  *[_type == "pg" && dbId == $dbId && isActive == true][0] {
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
    coordinates {
      latitude,
      longitude
    },
    ownerName,
    ownerPhone,
    ownerEmail,
    genderRestriction,
    gateClosingTime,
    smokingAllowed,
    drinkingAllowed,
    startingPrice,
    securityDeposit,
    brokerageCharges,
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
    heroImage: heroImage[0] {
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
    "rooms": *[_type == "room" && pgId == ^.dbId && isActive == true] | order(roomNumber asc) {
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
  }
`;

// GROQ query for PG detail by slug (for public URL)
export const pgDetailBySlugQuery = `
  *[_type == "pg" && slug.current == $slug && isActive == true][0] {
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
    coordinates {
      latitude,
      longitude
    },
    ownerName,
    ownerPhone,
    ownerEmail,
    genderRestriction,
    gateClosingTime,
    smokingAllowed,
    drinkingAllowed,
    startingPrice,
    securityDeposit,
    brokerageCharges,
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
    heroImage: heroImage[0] {
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
    "rooms": *[_type == "room" && pgId == ^.dbId && isActive == true] | order(roomNumber asc) {
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
  }
`;

// GROQ query for featured PGs (homepage)
export const featuredPGsQuery = `
  *[_type == "pg" && isActive == true && featured == true && verificationStatus == "VERIFIED"] | order(_createdAt desc)[0...6] {
    _id,
    dbId,
    name,
    slug,
    description,
    area,
    city,
    genderRestriction,
    startingPrice,
    totalRooms,
    availableRooms,
    heroImage: heroImage[0] {
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
    amenities[] {
      name,
      available
    }
  }
`;

// TypeScript interfaces for Sanity PG data
export interface SanityImage {
  asset: {
    _id: string;
    url: string;
    metadata?: {
      dimensions?: { width: number; height: number };
    };
  };
  alt?: string;
  caption?: string;
  crop?: unknown;
  hotspot?: unknown;
}

export interface SanityAmenity {
  name: string;
  available: boolean;
  description?: string;
}

export interface SanityRoom {
  _id: string;
  dbId: string;
  roomNumber: string;
  title?: string;
  slug: { current: string };
  description?: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
  maxOccupancy: number;
  currentOccupancy: number;
  floor: number;
  roomSize?: number;
  hasBalcony: boolean;
  hasAttachedBath: boolean;
  hasAC: boolean;
  hasFan: boolean;
  windowDirection?: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges: number;
  electricityIncluded: boolean;
  availabilityStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  availableFrom?: string;
  featured: boolean;
  features?: SanityAmenity[];
  images?: SanityImage[];
}

export interface SanityPG {
  _id: string;
  dbId: string;
  name: string;
  slug: { current: string };
  description?: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: { latitude: number; longitude: number };
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  genderRestriction: 'BOYS' | 'GIRLS' | 'COED';
  gateClosingTime?: string;
  smokingAllowed?: boolean;
  drinkingAllowed?: boolean;
  startingPrice: number;
  securityDeposit: number;
  brokerageCharges?: number;
  electricityIncluded: boolean;
  waterIncluded: boolean;
  wifiIncluded: boolean;
  totalRooms: number;
  availableRooms: number;
  featured: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  amenities?: SanityAmenity[];
  heroImage?: SanityImage;
  images?: SanityImage[];
  content?: unknown[];
  rooms?: SanityRoom[];
}

// Fetch functions
export async function getAllPGs(): Promise<SanityPG[]> {
  try {
    const pgs = await fetchSanityQuery<SanityPG[]>({
      query: pgListQuery,
    });
    return pgs || [];
  } catch (error) {
    console.error('Error fetching PGs from Sanity:', error);
    return [];
  }
}

export async function getPGByDbId(dbId: string): Promise<SanityPG | null> {
  try {
    return await fetchSanityQuery<SanityPG | null>({
      query: pgDetailQuery,
      params: { dbId },
    });
  } catch (error) {
    console.error(`Error fetching PG ${dbId} from Sanity:`, error);
    return null;
  }
}

export async function getPGBySlug(slug: string): Promise<SanityPG | null> {
  try {
    return await fetchSanityQuery<SanityPG | null>({
      query: pgDetailBySlugQuery,
      params: { slug },
    });
  } catch (error) {
    console.error(`Error fetching PG by slug ${slug} from Sanity:`, error);
    return null;
  }
}

export async function getFeaturedPGs(): Promise<SanityPG[]> {
  try {
    const pgs = await fetchSanityQuery<SanityPG[]>({
      query: featuredPGsQuery,
    });
    return pgs || [];
  } catch (error) {
    console.error('Error fetching featured PGs from Sanity:', error);
    return [];
  }
}

