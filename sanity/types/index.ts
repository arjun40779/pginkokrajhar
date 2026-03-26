// Centralized type exports for all Sanity schemas

// Base and Common types
export * from './Common.types';
export * from './Enums.types';

// Document schema types
export * from './HeroSection.types';
export * from './AmenitiesSection.types';
export * from './FacilitiesSection.types';
export * from './FeaturesCtaSection.types';
export * from './HeaderSection.types';
export * from './FooterSection.types';
export * from './LayoutSection.types';
export * from './PageSection.types';
export * from './ContactSection.types';
export * from './ContactLocationSection.types';
export * from './FAQSection.types';

// Re-export commonly used types for convenience
export type {
  BaseSectionType,
  SanityImage,
  CTAButton,
  NavigationItem,
  SocialMediaLink,
  ContactInfo,
  BrandSection,
  CompanyInfo,
  Statistic,
  Badge,
} from './Common.types';

export type {
  ButtonStyle,
  BackgroundColor,
  IconType,
  ColorTheme,
  LayoutColumns,
  ImageRatio,
  CachePolicy,
} from './Enums.types';

