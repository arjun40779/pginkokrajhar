// sanity/schemaTypes/objects/testimonialPageSection.ts

import { defineType, defineField } from 'sanity';
import { MessageCircle } from 'lucide-react';

export default defineType({
  name: 'testimonialPageSection',
  title: 'Testimonial Section',
  type: 'object',
  icon: MessageCircle,
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
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [{ type: 'testimonialItem' }],
      validation: (Rule) => Rule.min(1).max(10),
    }),

    defineField({
      name: 'displayStyle',
      title: 'Display Style',
      type: 'string',
      options: {
        list: [
          { title: 'Carousel', value: 'carousel' },
          { title: 'Grid', value: 'grid' },
          { title: 'Single Featured', value: 'featured' },
        ],
      },
      initialValue: 'carousel',
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
      title: 'title',
      testimonialsCount: 'testimonials',
      style: 'displayStyle',
    },
    prepare({ title, testimonialsCount, style }) {
      return {
        title: 'Testimonial Section',
        subtitle: `${title || 'No title'} - ${testimonialsCount?.length || 0} testimonials (${style})`,
        media: MessageCircle,
      };
    },
  },
});
