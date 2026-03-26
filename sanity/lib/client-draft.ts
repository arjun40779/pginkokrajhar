import { createClient } from 'next-sanity';
import { draftMode } from 'next/headers';

import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable the CDN so ISR and revalidation always talk to the Sanity API directly
  useCdn: false,
});

// Client for draft mode with token
export async function getClient(preview = false) {
  const draft = await draftMode();
  const isDraftMode = draft.isEnabled || preview;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: isDraftMode ? 'previewDrafts' : 'published',
    token: isDraftMode ? process.env.SANITY_API_READ_TOKEN : undefined,
    stega: {
      enabled: isDraftMode,
      studioUrl: '/studio',
    },
  });
}

// Helper to check if we're in draft mode
export async function isDraftMode() {
  const draft = await draftMode();
  return draft.isEnabled;
}

