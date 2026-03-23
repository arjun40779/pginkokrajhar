// sanity/schemaTypes/objects/ourWorkPageSection.ts

import { defineType, defineField } from 'sanity';
import { Briefcase } from 'lucide-react';

export default defineType({
  name: 'ourWorkPageSection',
  title: 'Our Work Section',
  type: 'object',
  icon: Briefcase,
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
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'workItems',
      title: 'Work Items',
      type: 'array',
      of: [{ type: 'workItem' }],
      validation: (Rule) => Rule.min(1).max(12),
    }),

    defineField({
      name: 'layout',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          { title: 'Grid (2x2)', value: 'grid' },
          { title: 'Masonry', value: 'masonry' },
          { title: 'Slider', value: 'slider' },
        ],
      },
      initialValue: 'grid',
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
      workCount: 'workItems',
      layout: 'layout',
    },
    prepare({ title, workCount, layout }) {
      return {
        title: 'Our Work Section',
        subtitle: `${title || 'No title'} - ${workCount?.length || 0} items (${layout})`,
        media: Briefcase,
      };
    },
  },
});
