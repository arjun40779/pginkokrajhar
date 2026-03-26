import { defineType, defineField } from 'sanity';

export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
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
      description: 'Main heading (e.g., "Frequently Asked Questions")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sectionSubtitle',
      title: 'Subtitle',
      type: 'text',
      description: 'Optional description text below the main title',
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              validation: (rule) => rule.required().max(1000),
            }),
          ],
          preview: {
            select: {
              question: 'question',
            },
            prepare({ question, order }) {
              return {
                title: question,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          { title: 'White', value: 'bg-white' },
          { title: 'Gray 50', value: 'bg-gray-50' },
          { title: 'Blue 50', value: 'bg-blue-50' },
          { title: 'Green 50', value: 'bg-green-50' },
        ],
      },
      initialValue: 'bg-white',
    }),
  ],
  orderings: [
    {
      title: 'Creation Date',
      name: 'createdAt',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      sectionTitle: 'sectionTitle',
      faqCount: 'faqItems',
      isActive: 'isActive',
    },
    prepare({ title, sectionTitle, faqCount, isActive }) {
      const count = Array.isArray(faqCount) ? faqCount.length : 0;
      return {
        title: title || sectionTitle,
        subtitle: `FAQ Section - ${count} items ${isActive ? '(Active)' : '(Inactive)'}`,
      };
    },
  },
});

