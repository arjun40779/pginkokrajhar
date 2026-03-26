import { defineType, defineField } from 'sanity';

export const contactLocationSection = defineType({
  name: 'contactLocationSection',
  title: 'Contact Location Section',
  type: 'document',
  icon: () => '📍',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this contact location section',
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
      description:
        'Main heading for the location section (e.g., "Visit Our Location")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sectionSubtitle',
      title: 'Section Subtitle',
      type: 'text',
      description: 'Optional subtitle or description for the location section',
    }),

    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({
          name: 'addressLine1',
          title: 'Address Line 1',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'addressLine2',
          title: 'Address Line 2',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'addressLine3',
          title: 'Address Line 3',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'mapEmbedUrl',
      title: 'Map Embed URL',
      type: 'url',
      description: 'Google Maps embed URL or similar map service URL',
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
        subtitle: `Contact Location ${isActive ? '(Active)' : '(Inactive)'}`,
      };
    },
  },
});

