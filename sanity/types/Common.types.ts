// Common types shared across multiple Sanity schemas

export interface SanityImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
      };
      lqip?: string;
    };
  };
  alt?: string;
  crop?: {
    _type: 'sanity.imageCrop';
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  hotspot?: {
    _type: 'sanity.imageHotspot';
    height: number;
    width: number;
    x: number;
    y: number;
  };
}

export interface BaseSectionType {
  _id: string;
  _type: string;
  title: string;
  isActive: boolean;
}

export interface CTAButton {
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
  icon?: string;
}

export interface NavigationItem {
  title?: string;
  href?: string;
  isVisible?: boolean;
  isHighlighted?: boolean;
  target?: '_blank' | '_self';
  order?: number;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
  isVisible: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

export interface BrandSection {
  showLogo: boolean;
  logo?: SanityImage;
  brandText?: string;
  description?: string;
}

export interface CompanyInfo {
  legalName?: string;
  foundedYear?: number;
  registrationNumber?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Statistic {
  number: string;
  label: string;
  icon?: string;
}

export interface Badge {
  show: boolean;
  icon: string;
  text?: string;
}

