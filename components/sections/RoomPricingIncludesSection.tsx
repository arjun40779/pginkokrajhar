import { CheckCircle } from 'lucide-react';
import type { RoomPricingIncludesSection as RoomPricingIncludesSectionType } from '@/sanity/types';

interface RoomPricingIncludesSectionProps {
  sectionData: RoomPricingIncludesSectionType;
}

function RoomPricingIncludesSection({
  sectionData,
}: Readonly<RoomPricingIncludesSectionProps>) {
  if (!sectionData?.isActive) return null;

  const { title, roomAmenities = [], commonFacilities = [] } = sectionData;

  if (roomAmenities.length === 0 && commonFacilities.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6  text-2xl font-bold text-gray-900">
            {"What's Included in the Price?"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {roomAmenities.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Room Amenities
                </h3>
                <ul className="space-y-2">
                  {roomAmenities.map((item) => (
                    <li key={item} className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {commonFacilities.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Common Facilities
                </h3>
                <ul className="space-y-2">
                  {commonFacilities.map((item) => (
                    <li key={item} className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoomPricingIncludesSection;

