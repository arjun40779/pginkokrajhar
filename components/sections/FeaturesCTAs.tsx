import { CheckCircle, ArrowRight, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { FeaturesCtaSection } from '@/sanity/types';

const FeaturesCTAs = ({ data }: { data: FeaturesCtaSection }) => {
  const { featuresTitle, ctaCards, features } = data;

  // Debug log to check if features are being passed correctly
  console.log('FeaturesCTAs data:', { featuresTitle, features, ctaCards });

  const card1 = ctaCards?.[0];
  const card2 = ctaCards?.[1];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {featuresTitle}
            </h2>
            <div className="space-y-4">
              {features && features.length > 0 ? (
                features.map((feature, index) => (
                  <div
                    key={feature?.text || index}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature?.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">
                  No features available
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {card1 ? (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {card1?.title}
                </h3>
                <p className="text-gray-700 mb-6">{card1?.description}</p>
                <Link href={card1?.buttonUrl || '#'} className="w-full ">
                  <Button size="lg" className="w-full bg-black text-white">
                    {card1?.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-sm text-gray-600 text-center">
                    {card1?.footerText &&
                    card1?.footerLinkText &&
                    card1?.footerLinkUrl ? (
                      <>
                        {card1.footerText.split(card1.footerLinkText)[0]}
                        <Link
                          href={card1.footerLinkUrl}
                          className="text-blue-600 hover:underline "
                        >
                          {card1.footerLinkText}
                        </Link>
                        {card1.footerText.split(card1.footerLinkText)[1]}
                      </>
                    ) : (
                      card1?.footerText
                    )}
                  </p>
                </div>
              </div>
            ) : null}

            {card2 ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <UserCircle className="h-6 w-6 mr-2" />
                  {card2?.title}
                </h3>
                <p className="text-gray-700 mb-6">{card2?.description}</p>
                <Link href={card2?.buttonUrl || '#'}>
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {card2?.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesCTAs;

