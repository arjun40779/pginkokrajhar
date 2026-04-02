import { AmenitiesSection as AmenitiesSectionType } from '@/sanity/types';
import { stegaClean } from '@sanity/client/stega';
import {
  BookOpen,
  Car,
  Clock,
  Heart,
  MapPin,
  Refrigerator,
  Shield,
  Users,
  Utensils,
  WashingMachine,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

const AmenitiesSection = ({
  sectionData,
}: {
  sectionData: AmenitiesSectionType;
}) => {
  const { amenities, sectionTitle, sectionSubtitle } = sectionData;

  const iconMap: Record<string, LucideIcon> = {
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
  };
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((benefit, index) => {
            const benefitIcon = cleanCmsString(benefit.icon);
            const Icon = iconMap[benefitIcon] || Wifi;
            return (
              <div
                key={cleanCmsString(benefit?.title) || String(index)}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-[18px]">
                  {benefit?.title}
                </h3>
                <p className="text-gray-600 text-sm">{benefit?.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;

