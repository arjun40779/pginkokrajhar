import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '../env';
import { studioUrl } from './visual-editing';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable the CDN so ISR and revalidation always talk to the Sanity API directly
  useCdn: false,
  studioUrl,
  encodeSourceMap:
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
});

