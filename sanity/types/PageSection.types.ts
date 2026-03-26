import type { BaseSectionType, SanityImage } from './Common.types';
import type { CachePolicy } from './Enums.types';
import type { HeroSection } from './HeroSection.types';
import type { AmenitiesSection } from './AmenitiesSection.types';
import type { FacilitiesSection } from './FacilitiesSection.types';
import type { FeaturesCtaSection } from './FeaturesCtaSection.types';
import type { ContactSection } from './ContactSection.types';
import type { ContactLocationSection } from './ContactLocationSection.types';
import type { FAQSection } from './FAQSection.types';

export interface PageMetadata {
  pageTitle?: string;
  pageDescription?: string;
  ogImage?: SanityImage;
  customMetaTags?: string;
}

export interface CustomSectionSettings {
  backgroundColor?: string;
  paddingOverride?: string;
  marginOverride?: string;
}

export type SectionType =
  | 'heroSection'
  | 'amenitiesSection'
  | 'facilitiesSection'
  | 'featuresCtaSection'
  | 'contactSection'
  | 'contactLocationSection'
  | 'faqSection';

export interface SectionReference {
  sectionType: SectionType;
  sectionRef: {
    _ref: string;
    _type: 'reference';
  };
  isVisible: boolean;
  customSettings?: CustomSectionSettings;
  // Populated section data
  sectionData?:
    | HeroSection
    | AmenitiesSection
    | FacilitiesSection
    | FeaturesCtaSection
    | ContactSection
    | ContactLocationSection
    | FAQSection;
}

export interface PageSettings {
  showBreadcrumbs: boolean;
  enableComments: boolean;
  requireAuth: boolean;
  cachePolicy: CachePolicy;
}

export interface PageSection extends BaseSectionType {
  _type: 'pageSection';
  slug: {
    current: string;
    _type: 'slug';
  };
  pageMetadata?: PageMetadata;
  sections: SectionReference[];
  pageSettings: PageSettings;
}

export interface PageSectionCreateInput {
  title: string;
  isActive?: boolean;
  slug: string;
  pageMetadata?: PageMetadata;
  sections: Omit<SectionReference, 'sectionData'>[];
  pageSettings?: PageSettings;
}

// GROQ Query response types
export interface PageSectionResponse extends Omit<
  PageSection,
  'slug' | 'sections'
> {
  slug: string; // GROQ returns slug.current as 'slug'
  sections: Array<
    Omit<SectionReference, 'sectionRef'> & {
      sectionData:
        | HeroSection
        | AmenitiesSection
        | FacilitiesSection
        | FeaturesCtaSection
        | ContactSection
        | ContactLocationSection
        | FAQSection;
    }
  >;
}

