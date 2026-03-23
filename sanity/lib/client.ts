import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable the CDN so ISR and revalidation always talk to the Sanity API directly
  useCdn: false,
})
