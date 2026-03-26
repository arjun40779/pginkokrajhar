// Enum and option types for Sanity schemas

export type ButtonStyle = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';
export type LinkTarget = '_blank' | '_self';

export type BackgroundColor =
  | 'blue-gradient'
  | 'purple-gradient'
  | 'green-gradient'
  | 'orange-gradient'
  | 'white'
  | 'gray-light'
  | 'bg-white'
  | 'bg-gray-50'
  | 'bg-blue-50'
  | 'bg-green-50';

export type IconType =
  // Amenity Icons
  | 'Utensils'
  | 'Wifi'
  | 'Shield'
  | 'WashingMachine'
  | 'BookOpen'
  | 'Users'
  | 'Zap'
  | 'Refrigerator'
  | 'Car'
  | 'Heart'
  | 'Clock'
  | 'MapPin'
  // Social Media Icons
  | 'Facebook'
  | 'Twitter'
  | 'Instagram'
  | 'LinkedIn'
  | 'YouTube'
  | 'WhatsApp'
  // General Icons
  | 'Phone'
  | 'Mail'
  | 'ExternalLink'
  | 'ArrowRight'
  | 'Menu'
  | 'X'
  | 'ChevronDown'
  | 'Home'
  | 'CheckCircle'
  | 'UserCircle'
  | 'Star';

export type TextAlignment = 'left' | 'center' | 'right';

export type LayoutColumns = 1 | 2 | 3 | 4;

export type Spacing =
  | 'compact'
  | 'normal'
  | 'spacious'
  | 'py-8'
  | 'py-16'
  | 'py-24'
  | 'py-32';

export type CardStyle = 'flat' | 'shadow' | 'border' | 'gradient';

export type ImageRatio =
  | 'square'
  | 'landscape'
  | 'portrait'
  | 'aspect-square'
  | 'aspect-video'
  | 'aspect-[4/3]'
  | 'aspect-[3/4]';

export type FacilityCategory =
  | 'rooms'
  | 'common-areas'
  | 'amenities'
  | 'recreation'
  | 'security'
  | 'parking';

export type ColorTheme =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'gray';

export type SocialPlatform =
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'youtube'
  | 'whatsapp';

export type NavigationStyle = 'horizontal' | 'center' | 'spaced';

export type MobileMenuStyle = 'slide' | 'fade' | 'push';

export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

export type BorderStyle = 'none' | 'subtle' | 'normal' | 'thick';

export type LogoSize = 'small' | 'medium' | 'large';

export type CachePolicy = 'default' | 'aggressive' | 'no-cache' | 'short-term';

export type TwitterCard = 'summary' | 'summary_large_image' | 'app' | 'player';

export type RobotsPolicy =
  | 'index, follow'
  | 'noindex, nofollow'
  | 'index, nofollow'
  | 'noindex, follow';

export type CacheStrategy =
  | 'default'
  | 'networkFirst'
  | 'cacheFirst'
  | 'fastest'
  | 'cacheOnly'
  | 'networkOnly';

export type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

