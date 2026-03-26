import type { BaseSectionType } from './Common.types';
import type {
  IconType,
  LayoutColumns,
  Spacing,
  CardStyle,
  BackgroundColor,
} from './Enums.types';

export interface Amenity {
  title: string;
  description: string;
  icon: IconType;
  featured: boolean;
  order?: number;
}

export interface AmenitiesLayout {
  columns: LayoutColumns;
  spacing: Spacing;
  showIcons: boolean;
  cardStyle: CardStyle;
  backgroundColor: BackgroundColor;
}

export interface AmenitiesSection extends BaseSectionType {
  _type: 'amenitiesSection';
  sectionTitle: string;
  sectionSubtitle?: string;
  amenities: Amenity[];
  layout: AmenitiesLayout;
}

export interface AmenitiesSectionCreateInput {
  title: string;
  isActive?: boolean;
  sectionTitle: string;
  sectionSubtitle?: string;
  amenities: Amenity[];
  layout?: AmenitiesLayout;
}
