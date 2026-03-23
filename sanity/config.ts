import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';

import { projectId, dataset } from './env';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'ViralEdits Studio',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});

