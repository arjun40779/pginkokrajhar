import type { BaseSectionType } from './Common.types';

export interface PgsHeroSection extends BaseSectionType {
  _type: 'pgsHeroSection';
  eyebrow?: string;
  mainTitle: string;
  subtitle?: string;
}

export interface PgsHeroSectionCreateInput {
  title: string;
  isActive?: boolean;
  eyebrow?: string;
  mainTitle: string;
  subtitle?: string;
}

