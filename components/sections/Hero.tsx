import { Star, ArrowRight } from 'lucide-react';
import { stegaClean } from '@sanity/client/stega';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { HeroSection } from '@/sanity/types';

interface HeroProps {
  heroData: HeroSection | null;
}

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

export function Hero({ heroData }: Readonly<HeroProps>) {
  // Fallback data if no Sanity content is available
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white flex justify-center items-center ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {heroData?.badge ? (
              <div className="inline-flex items-center space-x-2 bg-blue-400 bg-opacity-30 px-4 py-2 rounded-full mb-6">
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
              {heroData?.ctaButtons?.length
                ? heroData.ctaButtons.map((button) => {
                    const buttonHref = cleanCmsString(
                      'url' in button
                        ? button.url
                        : (button as { link?: string }).link,
                    );
                    const buttonStyle = cleanCmsString(button.style);
                    const buttonText = cleanCmsString(button.text);

                    return (
                      <Link
                        key={`${buttonText}-${buttonHref}`}
                        href={buttonHref || '/contact'}
                      >
                        <Button
                          size="lg"
                          className={cn(
                            'text-blue-600 hover:bg-gray-100',
                            buttonStyle === 'primary'
                              ? 'bg-white'
                              : 'border-white text-white hover:bg-white hover:text-blue-600',
                          )}
                        >
                          {buttonText}
                          {button.icon && (
                            <ArrowRight className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </Link>
                    );
                  })
                : null}
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {heroData?.stats?.map((stat) => (
                <div
                  key={`${cleanCmsString(stat.number)}-${cleanCmsString(stat.label)}`}
                >
                  <div className="text-3xl font-bold">{stat.number}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            {heroData?.heroImage ? (
              <Image
                src={heroData?.heroImage?.asset?.url || ''}
                alt="Modern PG Room"
                className="rounded-lg shadow-2xl"
                width={
                  heroData?.heroImage?.asset?.metadata?.dimensions?.width || 800
                }
                height={
                  heroData?.heroImage?.asset?.metadata?.dimensions?.height ||
                  600
                }
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

