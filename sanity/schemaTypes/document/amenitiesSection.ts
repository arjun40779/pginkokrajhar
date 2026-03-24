import { defineType, defineField } from 'sanity';

export const amenitiesSection = defineType({
  name: 'amenitiesSection',
  title: 'Amenities & Services Section',
  type: 'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this amenities section',
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
      description: 'The main title for the amenities section',
      placeholder: 'Why Choose ComfortStay PG?',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'sectionSubtitle',
      title: 'Section Subtitle',
      type: 'text',
      description: 'Supporting text below the section title',
      placeholder: 'We provide all the amenities and services you need...',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities & Services',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'amenity',
          title: 'Amenity',
          fields: [
            {
              name: 'title',
              title: 'Amenity Title',
              type: 'string',
              validation: (rule) => rule.required().max(50),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (rule) => rule.required().max(200),
            },
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description:
                'Icon identifier (e.g., Utensils, Wifi, Shield, etc.)',
              options: {
                list: [
                  { title: 'Utensils (Meals)', value: 'Utensils' },
                  { title: 'Wifi (Internet)', value: 'Wifi' },
                  { title: 'Shield (Security)', value: 'Shield' },
                  {
                    title: 'WashingMachine (Laundry)',
                    value: 'WashingMachine',
                  },
                  { title: 'BookOpen (Study Room)', value: 'BookOpen' },
                  { title: 'Users (Common Area)', value: 'Users' },
                  { title: 'Zap (Power Backup)', value: 'Zap' },
                  { title: 'Refrigerator (Kitchen)', value: 'Refrigerator' },
                  { title: 'Car (Parking)', value: 'Car' },
                  { title: 'Dumbbell (Gym)', value: 'Dumbbell' },
                  { title: 'Tv (Entertainment)', value: 'Tv' },
                  { title: 'Clock (24/7 Service)', value: 'Clock' },
                ],
              },
              validation: (rule) => rule.required(),
            },
            {
              name: 'featured',
              title: 'Featured',
              type: 'boolean',
              description: 'Highlight this amenity as a key feature',
              initialValue: false,
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
              icon: 'icon',
              order: 'order',
            },
            prepare({ title, description, icon, order }) {
              return {
                title: `${order ? `${order}. ` : ''}${title}`,
                subtitle: `${icon} - ${description}`,
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
      amenitiesCount: 'amenities',
    },
    prepare({ title, sectionTitle, isActive, amenitiesCount }) {
      const count = Array.isArray(amenitiesCount) ? amenitiesCount.length : 0;
      return {
        title: title || 'Amenities Section',
        subtitle: `${isActive ? '✅' : '❌'} ${sectionTitle} (${count} amenities)`,
      };
    },
  },
});
