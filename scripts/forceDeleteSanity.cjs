const { createClient } = require('@sanity/client');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load .env manually
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const roomId = 'room-830af3d3-f774-413c-803f-794027faa9be';
const pgId = 'pg-dec79c34-3e47-400e-817f-e528c3d07bfc';

async function forceDelete() {
  // Step 1: Find ALL documents referencing the PG
  console.log('Finding all references to PG...');
  const refs = await client.fetch(`*[references("${pgId}")]{ _id, _type }`);
  console.log('Found references:', refs);

  // Step 2: For each referencing doc, remove the reference fields
  for (const ref of refs) {
    console.log(`Cleaning reference in ${ref._id} (${ref._type})...`);
    try {
      await client.patch(ref._id).unset(['pgReference', 'pgId']).commit();
      console.log(`  Removed pgReference from ${ref._id}`);
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
  }

  // Step 3: Delete the PG document
  console.log('Deleting PG document...');
  try {
    await client.delete(pgId);
    console.log('PG deleted.');
  } catch (e) {
    console.log('PG delete failed:', e.message);
  }

  console.log('Done.');
}

forceDelete();

