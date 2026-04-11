import type { BaseSectionType } from './Common.types';

export interface RoomPricingIncludesSection extends BaseSectionType {
  _type: 'roomPricingIncludesSection';
  roomAmenities: string[];
  commonFacilities: string[];
}

export interface RoomPricingIncludesSectionCreateInput {
  title: string;
  isActive?: boolean;
  roomAmenities: string[];
  commonFacilities: string[];
}

