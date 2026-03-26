import type {
  BaseSectionType,
  SanityImage,
  Badge,
  CTAButton,
  Statistic,
} from './Common.types';
import type { BackgroundColor } from './Enums.types';

export interface HeroSection extends BaseSectionType {
  _type: 'heroSection';
  badge: Badge;
  mainTitle: string;
  subtitle: string;
  heroImage: SanityImage;
  ctaButtons: CTAButton[];
  stats: Statistic[];
  backgroundColor: BackgroundColor;
}

export interface HeroSectionCreateInput {
  title: string;
  isActive?: boolean;
  badge: Badge;
  mainTitle: string;
  subtitle: string;
  heroImage: SanityImage;
  ctaButtons?: CTAButton[];
  stats?: Statistic[];
  backgroundColor?: BackgroundColor;
}
