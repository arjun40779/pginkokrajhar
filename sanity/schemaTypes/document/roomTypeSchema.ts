import { defineField, defineType } from 'sanity';

export const roomTypeSchema = defineType({
  name: 'roomType',
  title: 'Room Type',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Type Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. Single, Double, Triple, Dormitory',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Type Code',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Backend enum value: SINGLE, DOUBLE, TRIPLE, DORMITORY',
      options: {
        list: [
          { title: 'Single', value: 'SINGLE' },
          { title: 'Double', value: 'DOUBLE' },
          { title: 'Triple', value: 'TRIPLE' },
          { title: 'Dormitory', value: 'DORMITORY' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Marketing description shown on customer pages',
    }),
    defineField({
      name: 'defaultOccupancy',
      title: 'Default Max Occupancy',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Lucide icon name (e.g. "User", "Users", "Building")',
    }),
    defineField({
      name: 'image',
      title: 'Type Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'features',
      title: 'Default Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Feature Name',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'string',
            },
          ],
        },
      ],
      description: 'Default features typically included with this room type',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
      description: 'Lower numbers appear first',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'code',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
});
