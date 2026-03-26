import { IconType } from '@/sanity/types';
import {
  ArrowRight,
  BookOpen,
  Car,
  CheckCircle,
  ChevronDown,
  Clock,
  ExternalLink,
  Facebook,
  Heart,
  Home,
  Instagram,
  Linkedin,
  LucideIcon,
  Mail,
  MapPin,
  Menu,
  Phone,
  Refrigerator,
  Shield,
  Star,
  Twitter,
  UserCircle,
  Users,
  Utensils,
  WashingMachine,
  Wifi,
  X,
  Youtube,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Amenity Icons
  Utensils: Utensils,
  Wifi: Wifi,
  Shield: Shield,
  WashingMachine: WashingMachine,
  BookOpen: BookOpen,
  Users: Users,
  Zap: Zap,
  Refrigerator: Refrigerator,
  Car: Car,
  Heart: Heart,
  Clock: Clock,
  MapPin: MapPin,
  // Social Media Icons
  Facebook: Facebook,
  Twitter: Twitter,
  Instagram: Instagram,
  Linkedin: Linkedin,
  Youtube: Youtube,
  // General Icons
  Phone: Phone,
  Mail: Mail,
  ExternalLink: ExternalLink,
  ArrowRight: ArrowRight,
  Menu: Menu,
  X: X,
  ChevronDown: ChevronDown,
  Home: Home,
  CheckCircle: CheckCircle,
  UserCircle: UserCircle,
  Star: Star,
};

interface IconProps {
  name: IconType;
  className?: string;
  size?: number;
}

const Icon = ({
  name,
  className,
  size = 24,
  ...props
}: IconProps & React.SVGProps<SVGSVGElement>) => {
  const Element = iconMap[name];
  if (!Element) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <Element className={className} size={size} {...props} />;
};

export default Icon;

