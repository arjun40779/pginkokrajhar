import { defineField, defineType } from 'sanity';

export const pgGridSection = defineType({
  name: 'pgGridSection',
  title: 'PG Grid Section',
  type: 'document',
  icon: () => '🏠',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description:
        'Title shown centered above the PG grid (e.g., "Available PGs").',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
    },
    prepare({ title, isActive }) {
      return {
        title: title || 'PG Grid Section',
        subtitle: isActive ? '✅ Active' : '❌ Inactive',
      };
    },
  },
});

