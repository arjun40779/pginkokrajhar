import type { BaseSectionType, SanityImage } from './Common.types';
import type { RobotsPolicy, CacheStrategy } from './Enums.types';
import type { HeaderSection } from './HeaderSection.types';
import type { FooterSection } from './FooterSection.types';

export interface SiteMetadata {
  siteName: string;
  siteDescription: string;
  siteUrl?: string;
  favicon?: SanityImage;
  appleTouchIcon?: SanityImage;
  ogImage?: SanityImage;
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  customHeadScripts?: string;
  customBodyScripts?: string;
}

export interface SEOConfig {
  robotsPolicy: RobotsPolicy;
  canonicalUrl?: string;
  structuredData?: string;
}

export interface PerformanceConfig {
  enablePreload: boolean;
  enableServiceWorker: boolean;
  cacheStrategy: CacheStrategy;
}

export interface LayoutSection extends BaseSectionType {
  _type: 'layoutSection';
  siteMetadata: SiteMetadata;
  header?: HeaderSection; // Populated reference
  footer?: FooterSection; // Populated reference
  analytics?: AnalyticsConfig;
  seo: SEOConfig;
  performance: PerformanceConfig;
}

export interface LayoutSectionCreateInput {
  title: string;
  isActive?: boolean;
  siteMetadata: SiteMetadata;
  header?: string; // Reference ID
  footer?: string; // Reference ID
  analytics?: AnalyticsConfig;
  seo?: SEOConfig;
  performance?: PerformanceConfig;
}

