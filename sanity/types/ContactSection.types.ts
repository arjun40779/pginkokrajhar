import type { BaseSectionType } from './Common.types';
import type { BackgroundColor, IconType } from './Enums.types';

export interface ContactCard {
  type: 'phone' | 'email' | 'address' | 'hours';
  icon: IconType;
  title: string;
  details: string[];
  description?: string;
  order: number;
}

export interface ContactSection extends BaseSectionType {
  _type: 'contactSection';
  sectionTitle: string;
  sectionSubtitle: string;
  contactCards: ContactCard[];
  backgroundColor: BackgroundColor;
}

export interface ContactSectionCreateInput {
  title: string;
  isActive?: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  contactCards: ContactCard[];
  backgroundColor?: BackgroundColor;
}
