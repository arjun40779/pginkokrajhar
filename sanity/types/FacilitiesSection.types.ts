import type { BaseSectionType, SanityImage } from './Common.types';
import type {
  LayoutColumns,
  ImageRatio,
  Spacing,
  BackgroundColor,
} from './Enums.types';

export type FacilityCategory =
  | 'living'
  | 'study'
  | 'recreation'
  | 'services'
  | 'kitchen'
  | 'common';

export interface Facility {
  title: string;
  description?: string;
  image: SanityImage;
  imageUrl: string;
  featured: boolean;
  category?: FacilityCategory;
  order?: number;
}

export interface FacilitiesLayout {
  gridColumns: LayoutColumns;
  imageRatio: ImageRatio;
  showTitles: boolean;
  spacing: Spacing;
  backgroundColor: BackgroundColor;
}

export interface FacilitiesSection extends BaseSectionType {
  _type: 'facilitiesSection';
  sectionTitle: string;
  sectionSubtitle?: string;
  facilities: Facility[];
  layout: FacilitiesLayout;
}

export interface FacilitiesSectionCreateInput {
  title: string;
  isActive?: boolean;
  sectionTitle: string;
  sectionSubtitle?: string;
  facilities: Facility[];
  layout?: FacilitiesLayout;
}

