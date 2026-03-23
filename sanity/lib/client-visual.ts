import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '../env';

// Client-side client for visual editing
export const visualEditingClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  stega: {
    enabled: true,
    studioUrl: '/studio',
  },
});