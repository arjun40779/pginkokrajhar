// sanity/schemaTypes/objects/heroSection.ts

import { defineType, defineField } from 'sanity';
import { Star } from 'lucide-react';

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  icon: Star,
  fields: [
    defineField({
      name: 'sectionId',
      title: 'Section ID',
      type: 'string',
      description: 'Optional ID for linking/navigation',
    }),

    defineField({
      name: 'badgeText',
      title: 'Badge Text',
      type: 'string',
    }),

    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'buttons',
      title: 'Action Buttons',
      type: 'array',
      of: [{ type: 'heroButton' }],
      validation: (Rule) => Rule.max(2),
    }),

    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'array',
      of: [{ type: 'heroStat' }],
      validation: (Rule) => Rule.max(4),
    }),

    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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
      title: 'headline',
      badge: 'badgeText',
    },
    prepare({ title, badge }) {
      return {
        title: 'Hero Section',
        subtitle: title || badge || 'No headline set',
        media: Star,
      };
    },
  },
});
