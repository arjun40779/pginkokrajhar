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

export function Home() {
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500 bg-opacity-30 px-4 py-2 rounded-full mb-6">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <span className="text-sm">Rated 4.8/5 by 500+ residents</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Perfect Home Away From Home
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Comfortable, secure, and affordable PG accommodation for
                students and working professionals in the heart of the city.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/rooms">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    View Rooms
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-blue-200">Happy Residents</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-blue-200">Rooms Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-blue-200">Support</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1721743169043-dda0212ce3d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaW5nbGUlMjBiZWRyb29tJTIwYWNjb21tb2RhdGlvbnxlbnwxfHx8fDE3NzM3NTQ4OTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern PG Room"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

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

