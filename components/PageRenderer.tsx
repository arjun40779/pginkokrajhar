import React from 'react';
import { stegaClean } from '@sanity/client/stega';
import type { PageSectionResponse } from '@/sanity/types';

// Import all section components
import { Hero } from '@/components/sections/Hero';
import AmenitiesSection from './sections/AmenitiesSection';
import FacilitiesSection from './sections/FacilitiesSection';
import FeaturesCTAs from './sections/FeaturesCTAs';
import ContactLocationSection from './sections/ContactLocationSection';
import RoomPricingIncludesSection from './sections/RoomPricingIncludesSection';
import { PgGridSection } from './sections/PgGridSection';

interface PageRendererProps {
  pageData: PageSectionResponse;
}

interface SectionWrapperProps {
  section: PageSectionResponse['sections'][number];
  children: React.ReactNode;
}

function cleanCmsString(value?: string | null): string {
  return typeof value === 'string' ? stegaClean(value) : '';
}

// Wrapper component to apply custom settings per section
function SectionWrapper({ section, children }: Readonly<SectionWrapperProps>) {
  const customBgClass = cleanCmsString(section.customSettings?.backgroundColor);
  const customPaddingClass = section.customSettings?.paddingOverride || '';
  const customMarginClass = section.customSettings?.marginOverride || '';

  const wrapperClasses = [customBgClass, customPaddingClass, customMarginClass]
    .filter(Boolean)
    .join(' ');

  if (wrapperClasses) {
    return <div className={wrapperClasses}>{children}</div>;
  }

  return <>{children}</>;
}

// Individual section renderers
function HeroRenderer({
  sectionData,
}: Readonly<{
  sectionData: PageSectionResponse['sections'][number]['sectionData'];
}>) {
  return <Hero heroData={sectionData as any} />;
}

// Main section renderer that decides which component to use
function SectionRenderer({
  section,
}: Readonly<{ section: PageSectionResponse['sections'][number] }>) {
  const { sectionData } = section;
  const sectionType = cleanCmsString(sectionData?._type);

  switch (sectionType) {
    case 'heroSection':
      return <HeroRenderer sectionData={sectionData} />;
    case 'amenitiesSection':
      return <AmenitiesSection sectionData={sectionData as any} />;
    case 'facilitiesSection':
      return <FacilitiesSection data={sectionData as any} />;
    case 'featuresCtaSection':
      return <FeaturesCTAs data={sectionData as any} />;
    case 'contactLocationSection':
      return <ContactLocationSection data={sectionData as any} />;
    case 'roomPricingIncludesSection':
      return <RoomPricingIncludesSection sectionData={sectionData as any} />;
    case 'pgGridSection':
      return <PgGridSection sectionData={sectionData as any} />;
    default:
      console.warn(`Unknown section type: ${sectionType}`);
      return null;
  }
}

export function PageRenderer({ pageData }: Readonly<PageRendererProps>) {
  if (!pageData?.sections?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            The requested page could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow">
      {pageData.sections.map((section, index) => (
        <SectionWrapper
          key={`${cleanCmsString(section.sectionType)}-${index}`}
          section={section}
        >
          <SectionRenderer section={section} />
        </SectionWrapper>
      ))}
    </main>
  );
}

