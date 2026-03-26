import ContactFormSection from '@/components/sections/ContactFormSection';
import ContactLocationSection from '@/components/sections/ContactLocationSection';
import FAQSection from '@/components/sections/FAQSection';
import { getPageSection } from '@/lib/sanity/queries/getPageSection';
import type { PageSectionResponse } from '@/sanity/types';

export default async function ContactPage() {
  // Fetch page section data for contact page
  const pageData: PageSectionResponse | null = await getPageSection('/contact');

  if (!pageData?.sections || pageData.sections.length === 0) {
    return (
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Information Coming Soon
            </h2>
            <p className="text-gray-600">
              We're currently updating our contact information. Please check
              back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {pageData.sections.map((section, index) => {
          const { sectionData, customSettings } = section;

          if (!sectionData) return null;

          // Apply custom styling
          const customClasses = customSettings?.backgroundColor || '';
          const paddingClasses = customSettings?.paddingOverride || 'py-12';
          const marginClasses =
            customSettings?.marginOverride || (index > 0 ? 'mt-12' : '');

          const containerClasses =
            `${customClasses} ${paddingClasses} ${marginClasses}`.trim();

          switch (sectionData._type) {
            case 'contactSection':
              return (
                <div key={sectionData._id} className={containerClasses}>
                  <ContactFormSection data={sectionData} />
                </div>
              );

            case 'contactLocationSection':
              return (
                <div key={sectionData._id} className={containerClasses}>
                  <ContactLocationSection data={sectionData} />
                </div>
              );

            case 'faqSection':
              return (
                <div key={sectionData._id} className={containerClasses}>
                  <FAQSection data={sectionData} />
                </div>
              );

            default:
              console.warn(`Unknown section type: ${sectionData._type}`);
              return null;
          }
        })}
      </div>
    </div>
  );
}

