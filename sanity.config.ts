/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/studio` route
 */

import { defineConfig } from 'sanity';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { dataset, projectId } from './sanity/env';
import {
  getPresentationAllowOrigins,
  getPresentationPreviewUrl,
  resolvePageHref,
} from './sanity/lib/visual-editing';
import { schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

const homeLocation = { title: 'Homepage', href: '/' };
const contactLocation = { title: 'Contact page', href: '/contact' };
const roomsLocation = { title: 'PG listing page', href: '/pgs' };

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,

  plugins: [
    structureTool({
      structure,
      title: 'Content',
    }),
    presentationTool({
      allowOrigins: getPresentationAllowOrigins(),
      previewUrl: getPresentationPreviewUrl(),
      resolve: {
        locations: {
          layoutSection: { locations: [homeLocation] },
          headerSection: { locations: [homeLocation] },
          footerSection: { locations: [homeLocation] },
          heroSection: { locations: [homeLocation] },
          amenitiesSection: { locations: [homeLocation] },
          facilitiesSection: { locations: [homeLocation] },
          featuresCtaSection: { locations: [homeLocation] },
          pageSection: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (document) => ({
              locations: [
                {
                  title: document?.title || 'Page',
                  href: resolvePageHref(document?.slug),
                },
              ],
            }),
          }),
          contactSection: { locations: [contactLocation] },
          contactLocationSection: { locations: [contactLocation] },
          faqSection: { locations: [contactLocation] },
          contactDetails: { locations: [contactLocation] },
          roomPricingIncludesSection: { locations: [roomsLocation] },
          pg: defineLocations({
            select: {
              title: 'name',
              dbId: 'dbId',
              slug: 'slug.current',
            },
            resolve: (document) => {
              let previewHref = resolvePageHref('/pgs');

              if (document?.dbId) {
                previewHref = `/pg/${document.dbId}`;
              }

              if (document?.slug) {
                previewHref = `/pgs/${document.slug}/rooms`;
              }

              return {
                locations: [
                  {
                    title: document?.title || 'PG details',
                    href: previewHref,
                  },
                  roomsLocation,
                ],
              };
            },
          }),
          room: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (document) => ({
              locations: [
                {
                  title: document?.title || 'Room details',
                  href: document?.slug
                    ? `/rooms/${document.slug}`
                    : roomsLocation.href,
                },
              ],
            }),
          }),
        },
      },
    }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],

  schema: {
    types: schemaTypes,
  },
});

