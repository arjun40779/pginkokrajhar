import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'brandName',
      title: 'Brand Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        defineField({
          name: 'socialLink',
          title: 'Social Link',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Twitter', value: 'twitter' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'LinkedIn', value: 'linkedin' },
                ],
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'quickLinks',
      title: 'Quick Links',
      type: 'array',
      of: [
        defineField({
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              description: 'Anchor link, e.g. #services',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'primaryEmail',
      title: 'Primary Email',
      type: 'string',
    }),
    defineField({
      name: 'secondaryEmail',
      title: 'Secondary Email',
      type: 'string',
    }),
    defineField({
      name: 'availability',
      title: 'Availability Text',
      type: 'string',
      description: 'e.g. Available 24/7',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'e.g. © 2024 Your Company. All rights reserved.',
    }),
  ],
});
