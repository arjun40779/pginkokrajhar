import type { BaseSectionType, SanityImage } from './Common.types';
import type { BackgroundColor } from './Enums.types';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface ContactLocationInfo {
  type: 'phone' | 'email' | 'website';
  label: string;
  value: string;
  isPrimary?: boolean;
}

export interface OperatingHours {
  days: string;
  hours: string;
  isOpen: boolean;
}

export interface ContactLocationSection extends BaseSectionType {
  _type: 'contactLocationSection';
  sectionTitle: string;
  sectionSubtitle?: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
  };
  mapEmbedUrl?: string;
}

export interface ContactLocationSectionCreateInput {
  title: string;
  isActive?: boolean;
  sectionTitle: string;
  sectionSubtitle?: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
  };

  mapEmbedUrl?: string;
}

