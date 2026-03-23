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
} from 'lucide-react';
import { benefits } from '../data/roomsData';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Hero } from '../sections/Hero';
import { HeroSection } from '../../lib/sanity/queries/heroSection';

interface HomeProps {
  heroData: HeroSection | null;
}

export function Home({ heroData }: HomeProps) {
  const iconMap: Record<string, React.ElementType> = {
    Utensils,
    Wifi,
    Shield,
    WashingMachine,
    BookOpen,
    Users,
    Zap,
    Refrigerator,
  };

  const facilityImages = [
    {
      url: 'https://images.unsplash.com/photo-1758523417921-0f4884c38481?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaGFyZWQlMjBraXRjaGVufGVufDF8fHx8MTc3Mzc1NDg5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      label: 'Modern Kitchen',
    },
    {
      url: 'https://images.unsplash.com/photo-1749671232817-1f224147f0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMHJvb20lMjBsaWJyYXJ5JTIwZGVza3xlbnwxfHx8fDE3NzM3NTQ5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      label: 'Study Area',
    },
    {
      url: 'https://images.unsplash.com/photo-1758253382580-409c579742ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZhY2lsaXRpZXN8ZW58MXx8fHwxNzczNzU0ODk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      label: 'Laundry Service',
    },
  ];

  return (
    <div>
      {/* Dynamic Hero Section */}
      <Hero heroData={heroData} />

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ComfortStay PG?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide all the amenities and services you need for a
              comfortable and hassle-free stay
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Facilities
            </h2>
            <p className="text-lg text-gray-600">
              Take a look at our well-maintained common areas and facilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {facilityImages.map((facility, index) => (
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

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need Under One Roof
              </h2>
              <div className="space-y-4">
                {[
                  'Fully furnished rooms with modern amenities',
                  'Nutritious meals 3 times a day',
                  '24/7 security with CCTV surveillance',
                  'High-speed WiFi throughout the property',
                  'Regular housekeeping and maintenance',
                  'Flexible monthly and quarterly payment options',
                  'Power backup for uninterrupted supply',
                  'Common areas for recreation and socializing',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Ready to Move In?
                </h3>
                <p className="text-gray-700 mb-6">
                  Browse our available rooms and book your perfect accommodation
                  today. We offer flexible payment plans and instant
                  confirmation.
                </p>
                <Link href="/rooms">
                  <Button size="lg" className="w-full">
                    Explore Rooms & Pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-sm text-gray-600 text-center">
                    Have questions?{' '}
                    <Link
                      href="/contact"
                      className="text-blue-600 hover:underline"
                    >
                      Contact us
                    </Link>{' '}
                    for a property visit
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <UserCircle className="h-6 w-6 mr-2" />
                  Already a Resident?
                </h3>
                <p className="text-gray-700 mb-6">
                  Pay your monthly rent online or set up AutoPay for hassle-free
                  automatic payments.
                </p>
                <Link href="/resident-portal">
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Resident Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

