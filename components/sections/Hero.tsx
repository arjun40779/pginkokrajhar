import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { HeroSection, getImageUrl } from '../../lib/sanity/queries/heroSection';
import { cn } from '../ui/utils';

interface HeroProps {
  heroData: HeroSection | null;
}

export function Hero({ heroData }: HeroProps) {
  // Fallback data if no Sanity content is available

  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white flex justify-center items-center ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {heroData?.badge?.show ? (
              <div className="inline-flex items-center space-x-2 bg-blue-500 bg-opacity-30 px-4 py-2 rounded-full mb-6">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <span className="text-sm">{heroData.badge.text}</span>
              </div>
            ) : null}

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {heroData?.mainTitle || 'Your Perfect Home Away From Home'}
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              {heroData?.subtitle ||
                'Comfortable, secure, and affordable PG accommodation for students and working professionals in the heart of the city.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {heroData?.ctaButtons?.length ? (
                heroData.ctaButtons.map((button, index) => (
                  <Link key={index} href={button.url}>
                    <Button
                      size="lg"
                      className={cn(
                        'text-blue-600 hover:bg-gray-100',
                        button.style === 'primary'
                          ? 'bg-white'
                          : 'border-white text-white hover:bg-white hover:text-blue-600',
                      )}
                    >
                      {button.text}
                      {button.icon && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </Link>
                ))
              ) : (
                <>
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
                </>
              )}
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {heroData?.stats?.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold">{stat.number}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            {heroData?.heroImage ? (
              <Image
                src={getImageUrl(heroData.heroImage)}
                alt="Modern PG Room"
                className="rounded-lg shadow-2xl"
                width={heroData.heroImage.asset.metadata.dimensions.width}
                height={heroData.heroImage.asset.metadata.dimensions.height}
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1721743169043-dda0212ce3d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaW5nbGUlMjBiZWRyb29tJTIwYWNjb21tb2RhdGlvbnxlbnwxfHx8fDE3NzM3NTQ4OTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern PG Room"
                className="rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

