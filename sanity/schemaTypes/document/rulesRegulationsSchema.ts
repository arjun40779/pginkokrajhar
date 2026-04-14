import { defineField, defineType } from 'sanity';

export const rulesRegulationsSchema = defineType({
  name: 'rulesRegulations',
  title: 'Rules & Regulations',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(200),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'heading',
              title: 'Section Heading',
              type: 'string',
              validation: (Rule: { required: () => unknown }) =>
                Rule.required(),
            },
            {
              name: 'rules',
              title: 'Rules',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
          preview: {
            select: {
              title: 'heading',
              rules: 'rules',
            },
            prepare({ title, rules }: { title?: string; rules?: string[] }) {
              return {
                title: title || 'Untitled Section',
                subtitle: `${rules?.length || 0} rule(s)`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'declaration',
      title: 'Declaration Text',
      type: 'text',
      rows: 3,
      initialValue:
        'I hereby agree to follow all the above rules and regulations. I understand that failure to comply may result in disciplinary action.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
    },
    prepare({ title, isActive }: { title?: string; isActive?: boolean }) {
      return {
        title: title || 'Untitled',
        subtitle: isActive ? '✅ Active' : '❌ Inactive',
      };
    },
  },
});

