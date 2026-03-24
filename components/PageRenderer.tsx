import React from 'react';
import {
  PageData,
  PageSection,
  HeroSectionData,
} from '@/lib/sanity/queries/pageSection';

// Import all section components
import { Hero } from '@/components/sections/Hero';
import AmenitiesSection from './sections/AmenitiesSection';
import FacilitiesSection from './sections/FacilitiesSection';
import FeaturesCTAs from './sections/FeaturesCTAs';

interface PageRendererProps {
  pageData: PageData;
}

interface SectionWrapperProps {
  section: PageSection;
  children: React.ReactNode;
}

// Wrapper component to apply custom settings per section
function SectionWrapper({ section, children }: SectionWrapperProps) {
  const customBgClass = section.customSettings?.backgroundColor || '';
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
function HeroRenderer({ sectionData }: { sectionData: HeroSectionData }) {
  return <Hero heroData={sectionData as any} />;
}

// Main section renderer that decides which component to use
function SectionRenderer({ section }: { section: PageSection }) {
  const { sectionData } = section;

  switch (sectionData._type) {
    case 'heroSection':
      return <HeroRenderer sectionData={sectionData as HeroSectionData} />;
    case 'amenitiesSection':
      return <AmenitiesSection sectionData={sectionData as any} />;
    case 'facilitiesSection':
      return <FacilitiesSection data={sectionData as any} />;
    case 'featuresCtaSection':
      return <FeaturesCTAs data={sectionData as any} />;
    default:
      console.warn(`Unknown section type: ${(sectionData as any)._type}`);
      return null;
  }
}

export function PageRenderer({ pageData }: PageRendererProps) {
  if (!pageData || !pageData?.sections || pageData?.sections?.length === 0) {
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
          key={`${section.sectionType}-${index}`}
          section={section}
        >
          <SectionRenderer section={section} />
        </SectionWrapper>
      ))}
    </main>
  );
}

