import type {
  BaseSectionType,
  ContactInfo,
  SocialMediaLink,
  SanityImage,
} from './Common.types';
import type {
  SocialPlatform,
  LayoutColumns,
  BackgroundColor,
} from './Enums.types';

export interface FooterBrandSection {
  logo: SanityImage;
  companyName: string;
  description: string;
}

export interface FooterLink {
  label: string;
  url: string;
  openInNewTab: boolean;
  order?: number;
}

export interface QuickLinksSection {
  title: string;
  links: FooterLink[];
}

export interface FooterContactInfo extends ContactInfo {
  title: string;
  contactIcons: boolean;
}

export interface FooterSocialLink extends SocialMediaLink {
  platform: SocialPlatform;
  order?: number;
}

export interface FooterLayout {
  columns: LayoutColumns;
  alignment: 'left' | 'center' | 'right';
  backgroundColor: BackgroundColor;
  textColor: string;
}

export interface FooterSection extends BaseSectionType {
  _type: 'footerSection';
  brandSection: FooterBrandSection;
  quickLinks: QuickLinksSection;
  contactInfo: FooterContactInfo;
  copyrightText: string;
  socialLinks: FooterSocialLink[];
  layout: FooterLayout;
}

export interface FooterSectionCreateInput {
  title: string;
  isActive?: boolean;
  brandSection: FooterBrandSection;
  quickLinks: QuickLinksSection;
  contactInfo: FooterContactInfo;
  copyrightText?: string;
  socialLinks?: FooterSocialLink[];
}

