import { client } from '@/sanity/lib/client';
import { layoutQuery } from './layoutSection';
import type { LayoutSection } from '@/sanity/types';

export async function getLayoutSection(): Promise<LayoutSection | null> {
  try {
    const layout = await client.fetch(layoutQuery);
    return layout;
  } catch (error) {
    console.error('Error fetching layout section:', error);
    return null;
  }
}

