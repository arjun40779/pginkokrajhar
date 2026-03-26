import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

import { projectId, dataset } from './env';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'PG IN KOKRAJHAR',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});

