import type {
  BaseSectionType,
  NavigationItem,
  SanityImage,
} from './Common.types';
import type { IconType, BackgroundColor } from './Enums.types';

export interface BrandSection {
  logo: SanityImage;
  companyName: string;
  homeUrl: string;
}

export interface HeaderNavItem extends NavigationItem {
  label: string;
  url: string;
  icon: IconType;
  openInNewTab: boolean;
  highlighted: boolean;
  mobileOnly: boolean;
  desktopOnly: boolean;
  order?: number;
}

export interface HeaderStyling {
  backgroundColor: BackgroundColor;
  textColor: string;
  shadow: 'shadow-sm' | 'shadow-md' | 'shadow-lg' | 'shadow-none';
  isSticky: boolean;
  activeStateColor: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface MobileMenuSettings {
  enabled: boolean;
  menuIcon: IconType;
  closeIcon: IconType;
}

export interface HeaderSection extends BaseSectionType {
  _type: 'headerSection';
  brandSection: BrandSection;
  navigation: HeaderNavItem[];
  styling: HeaderStyling;
  mobileMenu: MobileMenuSettings;
}

export interface HeaderSectionCreateInput {
  title: string;
  isActive?: boolean;
  brandSection: BrandSection;
  navigation: HeaderNavItem[];
}

