import {
  Utensils,
  Wifi,
  Shield,
  WashingMachine,
  BookOpen,
  Users,
  Zap,
  Refrigerator,
  ArrowRight,
  CheckCircle,
  Star,
  UserCircle,
  Car,
  Dumbbell,
  Tv,
  Clock,
  Heart,
  ThumbsUp,
  ExternalLink,
  User,
  Calendar,
  Phone,
  Home as HomeIcon,
  Key,
  Mail,
} from 'lucide-react';
import { benefits } from '../data/roomsData';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Hero } from '../sections/Hero';
import { HeroSection } from '../../lib/sanity/queries/heroSection';
import {
  AmenitiesSection,
  fallbackAmenities,
} from '../../lib/sanity/queries/amenitiesSection';
import {
  FacilitiesSection,
  fallbackFacilities,
  getFacilityImageUrl,
} from '../../lib/sanity/queries/facilitiesSection';
import {
  FeaturesCtaSection,
  fallbackFeatures,
  fallbackCtaCards,
} from '../../lib/sanity/queries/featuresCtaSection';

interface HomeProps {
  heroData: HeroSection | null;
  amenitiesData: AmenitiesSection | null;
  facilitiesData: FacilitiesSection | null;
  featuresCtaData: FeaturesCtaSection | null;
}

export function Home({
  heroData,
  amenitiesData,
  facilitiesData,
  featuresCtaData,
}: HomeProps) {
  const iconMap: Record<string, React.ElementType> = {
    Utensils,
    Wifi,
    Shield,
    WashingMachine,
    BookOpen,
    Users,
    Zap,
    Refrigerator,
    Car,
    Dumbbell,
    Tv,
    Clock,
    CheckCircle,
    Star,
    Heart,
    ThumbsUp,
    ArrowRight,
    ExternalLink,
    User,
    Calendar,
    Phone,
    UserCircle,
    HomeIcon,
    Key,
    Mail,
  };

  // Use Sanity data if available, otherwise fall back to default data
  const amenities = amenitiesData?.amenities || fallbackAmenities;
  const sectionTitle =
    amenitiesData?.sectionTitle || 'Why Choose ComfortStay PG?';
  const sectionSubtitle =
    amenitiesData?.sectionSubtitle ||
    'We provide all the amenities and services you need for a comfortable and hassle-free stay';

  // Facilities data with fallback
  const facilities = facilitiesData?.facilities || [];
  const facilitiesSectionTitle =
    facilitiesData?.sectionTitle || 'Our Facilities';
  const facilitiesSectionSubtitle =
    facilitiesData?.sectionSubtitle ||
    'Take a look at our well-maintained common areas and facilities';
  const facilitiesLayout = facilitiesData?.layout || 'grid-3';

  // Fallback facility images if no Sanity data
  const facilityImages =
    facilities.length > 0
      ? facilities
      : fallbackFacilities.map((f) => ({
          url: f.url,
          label: f.label,
        }));

  // Get grid class based on layout
  const getGridClass = (layout: string) => {
    switch (layout) {
      case 'grid-2':
        return 'md:grid-cols-2';
      case 'grid-4':
        return 'md:grid-cols-2 lg:grid-cols-4';
      case 'masonry':
        return 'md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'md:grid-cols-3';
    }
  };

  // Features CTA data with fallback
  const features = featuresCtaData?.features || fallbackFeatures;
  const featuresTitle =
    featuresCtaData?.featuresTitle || 'Everything You Need Under One Roof';
  const ctaCards = featuresCtaData?.ctaCards || fallbackCtaCards;
  const featuresCtaLayout = featuresCtaData?.layout || 'left-right';

  // Get background class for CTA cards
  const getCardBackgroundClass = (backgroundColor: string) => {
    switch (backgroundColor) {
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100';
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-orange-100';
      case 'gray':
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
      default:
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
    }
  };

  // Get button class for CTA cards
  const getButtonClass = (backgroundColor: string) => {
    switch (backgroundColor) {
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'orange':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'gray':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Dynamic Hero Section */}
      <Hero heroData={heroData} />

      {/* Benefits Section */}

      {/* Facilities Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {facilitiesSectionTitle}
            </h2>
            <p className="text-lg text-gray-600">{facilitiesSectionSubtitle}</p>
          </div>

          <div className={`grid gap-6 ${getGridClass(facilitiesLayout)}`}>
            {facilities.length > 0
              ? facilities.map((facility, index) => (
                  <div
                    key={index}
                    className={`relative group overflow-hidden rounded-lg shadow-md ${
                      facility.featured ? 'ring-2 ring-blue-200' : ''
                    }`}
                  >
                    <img
                      src={getFacilityImageUrl(facility, 600, 400)}
                      alt={facility.image.alt}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4">
                        <p className="text-white font-semibold text-lg mb-1">
                          {facility.title}
                        </p>
                        {facility.description && (
                          <p className="text-gray-200 text-sm">
                            {facility.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              : // Fallback to hardcoded images if no Sanity data
                facilityImages.map((facility, index) => (
                  <div
                    key={index}
                    className="relative group overflow-hidden rounded-lg shadow-md"
                  >
                    <img
                      src={facility.url}
                      alt={facility.label}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <p className="text-white font-semibold text-lg p-4">
                        {facility.label}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Features & CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid gap-12 items-center ${
              featuresCtaLayout === 'top-bottom'
                ? 'grid-cols-1'
                : featuresCtaLayout === 'right-left'
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-2'
            }`}
          >
            {/* Features List */}
            {featuresCtaLayout !== 'cta-only' && (
              <div
                className={
                  featuresCtaLayout === 'right-left' ? 'md:order-2' : ''
                }
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {featuresTitle}
                </h2>
                <div className="space-y-4">
                  {features.map((feature, index) => {
                    const Icon = iconMap[feature.icon] || CheckCircle;
                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 ${
                          feature.highlighted
                            ? 'bg-green-50 p-3 rounded-lg border-l-4 border-green-500'
                            : ''
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                            feature.highlighted
                              ? 'text-green-700'
                              : 'text-green-600'
                          }`}
                        />
                        <span
                          className={`${
                            feature.highlighted
                              ? 'text-green-900 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA Cards */}
            {featuresCtaLayout !== 'features-only' && (
              <div className="space-y-6">
                {ctaCards.map((card, index) => {
                  const ButtonIcon = iconMap[card.buttonIcon] || ArrowRight;
                  const CardIcon = card.cardIcon
                    ? iconMap[card.cardIcon]
                    : null;

                  return (
                    <div
                      key={index}
                      className={`${getCardBackgroundClass(card.backgroundColor)} p-8 rounded-lg`}
                    >
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        {CardIcon && <CardIcon className="h-6 w-6 mr-2" />}
                        {card.title}
                      </h3>
                      <p className="text-gray-700 mb-6">{card.description}</p>
                      <Link href={card.buttonUrl}>
                        <Button
                          size="lg"
                          className={`w-full ${getButtonClass(card.backgroundColor)}`}
                        >
                          {card.buttonText}
                          <ButtonIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      {card.footerText && (
                        <div className="mt-6 pt-6 border-t border-opacity-20 border-gray-400">
                          <p className="text-sm text-gray-600 text-center">
                            {card.footerText}{' '}
                            {card.footerLinkText && card.footerLinkUrl && (
                              <Link
                                href={card.footerLinkUrl}
                                className="text-blue-600 hover:underline"
                              >
                                {card.footerLinkText}
                              </Link>
                            )}
                            {card.footerText.includes('property visit') &&
                              !card.footerLinkText &&
                              ' for a property visit'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

