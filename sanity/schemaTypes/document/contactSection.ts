import { defineType, defineField } from 'sanity';

export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sectionTitle',
      title: 'Main Title',
      type: 'string',
      description: 'Main heading (e.g., "Get In Touch")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sectionSubtitle',
      title: 'Subtitle',
      type: 'text',
      description: 'Description text below the main title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactCards',
      title: 'Contact Information Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contactCard',
          title: 'Contact Card',
          fields: [
            defineField({
              name: 'type',
              title: 'Card Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Phone', value: 'phone' },
                  { title: 'Email', value: 'email' },
                  { title: 'Address', value: 'address' },
                  { title: 'Office Hours', value: 'hours' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Phone', value: 'Phone' },
                  { title: 'Mail', value: 'Mail' },
                  { title: 'MapPin', value: 'MapPin' },
                  { title: 'Clock', value: 'Clock' },
                  { title: 'Building2', value: 'Building2' },
                  { title: 'Calendar', value: 'Calendar' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Card Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'details',
              title: 'Contact Details',
              type: 'array',
              of: [{ type: 'string' }],
              description:
                'List of contact details (phone numbers, emails, address lines, etc.)',
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: 'description',
              title: 'Additional Description',
              type: 'string',
              description: 'Additional info like hours, response time, etc.',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              order: 'order',
            },
            prepare({ title, type, order }) {
              return {
                title: title,
                subtitle: `${type} - Order: ${order}`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sectionTitle: 'sectionTitle',
      isActive: 'isActive',
    },
    prepare({ title, sectionTitle, isActive }) {
      return {
        title: title || sectionTitle,
        subtitle: `Contact Section ${isActive ? '(Active)' : '(Inactive)'}`,
      };
    },
  },
});

