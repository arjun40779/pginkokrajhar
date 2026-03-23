export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-02-22';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
);

console.log('Sanity environment variables:');
console.log('NEXT_PUBLIC_SANITY_API_VERSION:', apiVersion);
console.log('NEXT_PUBLIC_SANITY_DATASET:', dataset);
console.log('NEXT_PUBLIC_SANITY_PROJECT_ID:', projectId);
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}

