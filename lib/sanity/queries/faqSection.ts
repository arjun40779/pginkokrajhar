import { client } from '@/sanity/lib/client';
import type { FAQSection } from '@/sanity/types';

// GROQ query to fetch the active FAQ section with all required fields
export const faqSectionQuery = `
  *[_type == "faqSection" && isActive == true][0] {
    _id,
    title,
    sectionTitle,
    sectionSubtitle,
    faqItems[] {
      _key,
      question,
      answer,
      order
    } | order(order asc),
    backgroundColor,
    isActive
  }
`;

// Function to fetch FAQ section data
export async function getFAQSection(): Promise<FAQSection | null> {
  try {
    console.log('🔍 Fetching FAQ section...');
    console.log('📋 Client config:', {
      projectId: client.config().projectId,
      dataset: client.config().dataset,
      apiVersion: client.config().apiVersion,
    });

    console.log('🔎 Main Query:', faqSectionQuery);

    const faqSection = await client.fetch<FAQSection>(
      faqSectionQuery,
      {},
      {
        // Disable caching for debugging
        cache: 'no-store',
      },
    );

    console.log('✅ Raw FAQ response:', faqSection);
    console.log('📊 Response type:', typeof faqSection);

    return faqSection;
  } catch (error) {
    console.error('❌ Error fetching FAQ section:', error);
    return null;
  }
}

// Function to fetch all FAQ sections (if supporting multiple FAQ sections)
export async function getAllFAQSections(): Promise<FAQSection[]> {
  try {
    console.log('🔍 Fetching all FAQ sections...');

    const query = `
      *[_type == "faqSection" && isActive == true] | order(_createdAt desc) {
        _id,
        title,
        sectionTitle,
        sectionSubtitle,
        faqItems[] {
          _key,
          question,
          answer,
          order
        } | order(order asc),
        backgroundColor,
        isActive
      }
    `;

    const faqSections = await client.fetch<FAQSection[]>(query);

    console.log('✅ All FAQ sections fetched:', faqSections.length);
    return faqSections || [];
  } catch (error) {
    console.error('❌ Error fetching all FAQ sections:', error);
    return [];
  }
}
