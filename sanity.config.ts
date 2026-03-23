/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/studio` route
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { dataset, projectId } from './sanity/env';
import { schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,

  plugins: [
    structureTool({
      structure,
      title: 'Content',
    }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],

  schema: {
    types: schemaTypes,
  },
});

