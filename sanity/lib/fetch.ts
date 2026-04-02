import 'server-only';

import { getClient } from './client-draft';

export interface SanityFetchOptions {
  params?: Record<string, unknown>;
  stega?: boolean;
}

export async function fetchSanityQuery<T>({
  query,
  params = {},
  stega = true,
}: {
  query: string;
  params?: Record<string, unknown>;
  stega?: boolean;
}): Promise<T> {
  const client = await getClient();
  const configuredClient = stega ? client : client.withConfig({ stega: false });

  return configuredClient.fetch<T>(query, params);
}
