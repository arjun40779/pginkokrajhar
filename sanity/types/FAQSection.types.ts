import type { BaseSectionType } from './Common.types';
import type { BackgroundColor } from './Enums.types';

export interface FAQItem {
  _key: string;
  question: string;
  answer: string;
  order: number;
}

export interface FAQSection extends BaseSectionType {
  _type: 'faqSection';
  sectionTitle: string;
  sectionSubtitle?: string;
  faqItems: FAQItem[];
  backgroundColor: BackgroundColor;
}

export interface FAQSectionCreateInput {
  title: string;
  isActive?: boolean;
  sectionTitle: string;
  sectionSubtitle?: string;
  faqItems: Omit<FAQItem, '_key'>[];
  backgroundColor?: BackgroundColor;
}
