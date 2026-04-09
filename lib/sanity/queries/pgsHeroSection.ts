import { client } from '@/sanity/lib/client';
import type { PgsHeroSection } from '@/sanity/types';

const pgsHeroSectionQuery = `
  *[_type == "pgsHeroSection" && isActive == true][0] {
    _id,
    title,
    eyebrow,
    mainTitle,
    subtitle,
    isActive
  }
`;

export async function getPgsHeroSection(): Promise<PgsHeroSection | null> {
  try {
    const data = await client.fetch<PgsHeroSection | null>(pgsHeroSectionQuery);
    return data;
  } catch (error) {
    console.error('Error fetching PGs hero section from Sanity:', error);
    return null;
  }
}

