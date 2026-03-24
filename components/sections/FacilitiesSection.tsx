import { FacilitiesSection as FacilitiesSectionType } from '@/sanity/types';
import Image from 'next/image';

const FacilitiesSection = ({ data }: { data: FacilitiesSectionType }) => {
  console.log(
    data.facilities.map((facility) => facility.image),
    '--------------<<<<<>>>>>>>',
  );
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {data.sectionTitle}
          </h2>
          <p className="text-lg text-gray-600">{data.sectionSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data?.facilities?.map((facility, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-md"
            >
              <div className="h-64 w-full relative z-0">
                <Image
                  src={facility?.imageUrl}
                  alt={facility?.title}
                  fill
                  className="w-full  object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end z-10">
                <p className="text-white font-semibold text-lg p-4">
                  {facility?.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FacilitiesSection;

