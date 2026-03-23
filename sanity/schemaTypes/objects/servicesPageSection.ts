// sanity/schemaTypes/objects/servicesPageSection.ts

import { defineType, defineField } from 'sanity';
import { Settings } from 'lucide-react';

export default defineType({
  name: 'servicesPageSection',
  title: 'Services Section',
  type: 'object',
  icon: Settings,
  fields: [
    defineField({
      name: 'sectionId',
      title: 'Section ID',
      type: 'string',
      description: 'Optional ID for linking/navigation',
    }),

    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),

    defineField({
      name: 'services',
      title: 'Service Cards',
      type: 'array',
      of: [{ type: 'serviceCard' }],
      validation: (Rule) => Rule.min(1).max(12),
    }),

    defineField({
      name: 'backgroundStyle',
      title: 'Background Style',
      type: 'string',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Light Gray', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
      initialValue: 'default',
    }),

    defineField({
      name: 'isVisible',
      title: 'Show Section',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      servicesCount: 'services',
    },
    prepare({ title, servicesCount }) {
      return {
        title: 'Services Section',
        subtitle: `${title || 'No title'} - ${servicesCount?.length || 0} services`,
        media: Settings,
      };
    },
  },
});
