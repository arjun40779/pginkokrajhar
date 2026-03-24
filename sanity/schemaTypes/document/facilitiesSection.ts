import { defineType, defineField } from 'sanity';

export const facilitiesSection = defineType({
  name: 'facilitiesSection',
  title: 'Facilities Gallery Section',
  type: 'document',
  icon: () => '🏢',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this facilities section',
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
      name: 'sectionTitle',
      title: 'Section Title',
      type: 'string',
      description: 'The main title for the facilities section',
      placeholder: 'Our Facilities',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'sectionSubtitle',
      title: 'Section Subtitle',
      type: 'text',
      description: 'Supporting text below the section title',
      placeholder:
        'Take a look at our well-maintained common areas and facilities',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'facilities',
      title: 'Facility Images',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'facility',
          title: 'Facility',
          fields: [
            {
              name: 'title',
              title: 'Facility Title',
              type: 'string',
              validation: (rule) => rule.required().max(50),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              description: 'Optional description of the facility',
              validation: (rule) => rule.max(200),
            },
            {
              name: 'image',
              title: 'Facility Image',
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
                  validation: (rule) => rule.required(),
                },
              ],
              validation: (rule) => rule.required(),
            },
            {
              name: 'featured',
              title: 'Featured',
              type: 'boolean',
              description: 'Highlight this facility as a key feature',
              initialValue: false,
            },
            {
              name: 'category',
              title: 'Category',
              type: 'string',
              description: 'Category type for grouping facilities',
              options: {
                list: [
                  { title: 'Living Spaces', value: 'living' },
                  { title: 'Study Areas', value: 'study' },
                  { title: 'Recreation', value: 'recreation' },
                  { title: 'Services', value: 'services' },
                  { title: 'Kitchen & Dining', value: 'kitchen' },
                  { title: 'Common Areas', value: 'common' },
                ],
              },
            },
            {
              name: 'order',
              title: 'Display Order',
              type: 'number',
              description: 'Order of display (lower numbers appear first)',
              validation: (rule) => rule.min(0),
            },
          ],
          preview: {
            select: {
              title: 'title',
              description: 'description',
              image: 'image',
              order: 'order',
              category: 'category',
            },
            prepare({ title, description, image, order, category }) {
              return {
                title: `${order ? `${order}. ` : ''}${title}`,
                subtitle: `${category ? `[${category}] ` : ''}${description || 'No description'}`,
                media: image,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).max(12),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sectionTitle: 'sectionTitle',
      isActive: 'isActive',
      facilitiesCount: 'facilities',
    },
    prepare({ title, sectionTitle, isActive, facilitiesCount }) {
      const count = Array.isArray(facilitiesCount) ? facilitiesCount.length : 0;
      return {
        title: title || 'Facilities Section',
        subtitle: `${isActive ? '✅' : '❌'} ${sectionTitle} (${count} facilities)`,
      };
    },
  },
});

