import { client } from '@/sanity/lib/client';
import type { HeaderSection } from '@/sanity/types';

// GROQ query to fetch the active header section
const headerSectionQuery = `
  *[_type == "headerSection" && isActive == true][0] {
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
      homeUrl
    },
    navigation[] {
      label,
      url,
      icon,
      openInNewTab,
      highlighted,
      mobileOnly,
      desktopOnly,
      order
    } | order(order asc),
    styling {
      backgroundColor,
      textColor,
      shadow,
      isSticky,
      activeStateColor
    },
    mobileMenu {
      enabled,
      menuIcon,
      closeIcon
    },
    isActive
  }
`;

// Function to fetch header section data
export async function getHeaderSection(): Promise<HeaderSection | null> {
  try {
    const headerData = await client.fetch<HeaderSection>(headerSectionQuery);
    return headerData;
  } catch (error) {
    console.error('Error fetching header section:', error);
    return null;
  }
}

