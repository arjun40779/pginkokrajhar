import { defineType, defineField } from 'sanity';

export const pgsHeroSection = defineType({
  name: 'pgsHeroSection',
  title: 'PGs List Hero Section',
  type: 'document',
  icon: () => '🏘️',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this PGs hero section',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this hero section on/off',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow Label',
      type: 'string',
      description:
        'Small label shown above the main heading (e.g. "Browse Properties")',
    }),
    defineField({
      name: 'mainTitle',
      title: 'Main Title',
      type: 'string',
      description: 'Primary heading for the PGs listing page',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 3,
      description: 'Supporting copy displayed under the main title',
      validation: (rule) => rule.max(280),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      mainTitle: 'mainTitle',
      isActive: 'isActive',
    },
    prepare({ title, mainTitle, isActive }) {
      return {
        title: title || mainTitle || 'PGs List Hero Section',
        subtitle: isActive ? '✅ Active' : '🚫 Inactive',
      };
    },
  },
});

