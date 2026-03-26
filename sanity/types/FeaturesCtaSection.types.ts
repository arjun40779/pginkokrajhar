import type { BaseSectionType } from './Common.types';
import type { IconType } from './Enums.types';

export interface Feature {
  text: string;
}

export interface CtaCard {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkUrl?: string;
}

export interface FooterLink {
  text: string;
  link: string;
  isExternal: boolean;
}

export interface FeaturesCtaSection extends BaseSectionType {
  _type: 'featuresCtaSection';
  featuresTitle: string;
  features: Feature[];
  ctaCards: CtaCard[];
  footerLinks?: FooterLink[];
}

export interface FeaturesCtaSectionCreateInput {
  title: string;
  isActive?: boolean;
  featuresTitle: string;
  features: Feature[];
  ctaCards: CtaCard[];
  footerLinks?: FooterLink[];
}

