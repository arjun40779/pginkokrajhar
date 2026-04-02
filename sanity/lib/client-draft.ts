import { createClient } from 'next-sanity';
import { draftMode } from 'next/headers';

import { apiVersion, dataset, projectId } from '../env';
import { studioUrl } from './visual-editing';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable the CDN so ISR and revalidation always talk to the Sanity API directly
  useCdn: false,
});

// Client for draft mode with token
export async function getClient(preview = false) {
  const draft = draftMode();
  const isDraftMode = draft.isEnabled || preview;

  if (isDraftMode && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error(
      'SANITY_API_READ_TOKEN is required to fetch draft content in visual editing mode.',
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    studioUrl,
    perspective: isDraftMode ? 'previewDrafts' : 'published',
    token: isDraftMode ? process.env.SANITY_API_READ_TOKEN : undefined,
    stega: {
      enabled: isDraftMode,
      studioUrl,
    },
  });
}

// Helper to check if we're in draft mode
export async function isDraftMode() {
  const draft = draftMode();
  return draft.isEnabled;
}

