import { client } from '@/sanity/lib/client';
import type { FooterSection } from '@/sanity/types';

// GROQ query to fetch the active footer section
const footerSectionQuery = `
  *[_type == "footerSection" && isActive == true][0] {
    _id,
    title,
    brandSection {
      logo {
        asset->{
          _id,
          url
        },
        alt
      },
      companyName,
      description
    },
    quickLinks {
      title,
      links[] {
        label,
        url,
        openInNewTab,
      } | order(order asc)
    },
    contactInfo {
      title,
      phone,
      email,
      address,
    },
    copyrightText,
    isActive
  }
`;

// Function to fetch footer section data
export async function getFooterSection(): Promise<FooterSection | null> {
  try {
    const footerData = await client.fetch<FooterSection>(footerSectionQuery);
    return footerData;
  } catch (error) {
    console.error('Error fetching footer section:', error);
    return null;
  }
}

