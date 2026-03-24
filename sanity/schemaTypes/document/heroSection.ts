import { defineType, defineField } from 'sanity';

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this hero section',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this section on/off',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'object',
      fields: [
        {
          name: 'show',
          title: 'Show Badge',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'icon',
          title: 'Badge Icon',
          type: 'string',
          initialValue: '⭐',
        },
        {
          name: 'text',
          title: 'Badge Text',
          type: 'string',
          placeholder: 'Rated 4.8/5 by 500+ residents',
        },
      ],
    }),
    defineField({
      name: 'mainTitle',
      title: 'Main Title',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(100),
      description: 'The main hero headline',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(200),
      description: 'Supporting text below the main title',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Important for accessibility and SEO',
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaButtons',
      title: 'Call-to-Action Buttons',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'ctaButton',
          title: 'CTA Button',
          fields: [
            {
              name: 'text',
              title: 'Button Text',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'url',
              title: 'Button URL',
              type: 'string',
              description: 'Internal path (e.g., /rooms) or external URL',
            },
            {
              name: 'style',
              title: 'Button Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Secondary', value: 'secondary' },
                  { title: 'Outline', value: 'outline' },
                ],
              },
              initialValue: 'primary',
            },
            {
              name: 'icon',
              title: 'Button Icon',
              type: 'string',
              description: 'Optional icon name (e.g., arrow-right)',
            },
          ],
        },
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stat',
          title: 'Statistic',
          fields: [
            {
              name: 'number',
              title: 'Number/Value',
              type: 'string',
              validation: (rule) => rule.required(),
              description: 'e.g., "500+", "50+", "24/7"',
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
              description: 'e.g., "Happy Residents", "Rooms Available"',
            },
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description: 'Optional icon name',
            },
          ],
          preview: {
            select: {
              number: 'number',
              label: 'label',
            },
            prepare({ number, label }) {
              return {
                title: `${number} ${label}`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      mainTitle: 'mainTitle',
      media: 'heroImage',
      isActive: 'isActive',
    },
    prepare({ title, mainTitle, media, isActive }) {
      return {
        title: title || mainTitle,
        subtitle: isActive ? '✅ Active' : '📝 Draft',
        media,
      };
    },
  },
});

