import { client } from '@/sanity/lib/client';
import type { ContactSection } from '@/sanity/types';

// GROQ query to fetch the active contact section with all required fields
export const contactSectionQuery = `
  *[_type == "contactSection" && isActive == true][0] {
    _id,
    title,
    sectionTitle,
    sectionSubtitle,
    contactCards[] {
      type,
      icon,
      title,
      details,
      description
    },
    backgroundColor,
    isActive
  }
`;

// Function to fetch contact section data
export async function getContactSection(): Promise<ContactSection | null> {
  try {
    console.log('🔍 Fetching contact section...');
    console.log('📋 Client config:', {
      projectId: client.config().projectId,
      dataset: client.config().dataset,
      apiVersion: client.config().apiVersion,
    });

    // Test basic connection first
    console.log('🧪 Testing basic connection...');
    const testQuery =
      '*[_type == "contactSection"][0...3]{_id, _type, isActive}';
    const testResult = await client.fetch(testQuery);
    console.log('🧪 Test result:', testResult);

    console.log('🔎 Main Query:', contactSectionQuery);

    const contactSection = await client.fetch<ContactSection>(
      contactSectionQuery,
      {},
      {
        // Disable caching for debugging
        cache: 'no-store',
      },
    );

    console.log('✅ Raw response:', contactSection);
    console.log('📊 Response type:', typeof contactSection);

    return contactSection;
  } catch (error) {
    console.error('❌ Error fetching contact section:', error);
    return null;
  }
}
