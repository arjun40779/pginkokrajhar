import { fetchSanityQuery, type SanityFetchOptions } from '@/sanity/lib/fetch';
import { layoutQuery } from './layoutSection';
import type { LayoutSection } from '@/sanity/types';

export async function getLayoutSection(
  options: SanityFetchOptions = {},
): Promise<LayoutSection | null> {
  try {
    const layout = await fetchSanityQuery<LayoutSection | null>({
      query: layoutQuery,
      stega: options.stega,
    });
    return layout;
  } catch (error) {
    console.error('Error fetching layout section:', error);
    return null;
  }
}

