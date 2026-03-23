// sanity/schemaTypes/documents/pageLayout.ts

import { defineType, defineField } from 'sanity';
import { Layout } from 'lucide-react';

export default defineType({
  name: 'pageLayout',
  title: 'Page Layout',
  type: 'document',
  icon: Layout,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.max(60),
    }),

    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),

    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a favicon image (preferably 32x32 or 16x16 pixels)',
      options: {
        hotspot: false,
      },
    }),

    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'hero' },
            { type: 'servicesSection' },
            { type: 'ourWorkSection' },
            { type: 'testimonial' },
            { type: 'contactSection' },
          ],
        },
      ],
      options: {
        sortable: true, // This enables drag and drop reordering
      },
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: 'isHomepage',
      title: 'Is Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Mark this page as the homepage',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      sections: 'sections',
      isHomepage: 'isHomepage',
    },
    prepare({ title, sections, isHomepage }) {
      const sectionCount = sections?.length || 0;
      const homepageLabel = isHomepage ? '🏠 ' : '';

      return {
        title: `${homepageLabel}${title || 'Untitled Page'}`,
        subtitle: `${sectionCount} section${sectionCount === 1 ? '' : 's'}`,
        media: Layout,
      };
    },
  },

  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Created (Newest First)',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
});

