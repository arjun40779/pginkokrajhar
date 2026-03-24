import { defineType, defineField } from 'sanity';

export const footerSection = defineType({
  name: 'footerSection',
  title: 'Footer Section',
  type: 'document',
  icon: () => '🦶',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this footer',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this footer on/off',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'brandSection',
      title: 'Brand Section',
      type: 'object',
      fields: [
        {
          name: 'logo',
          title: 'Logo Image',
          type: 'image',
          description: 'Upload your brand logo (JPG, PNG, or SVG recommended)',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
            },
          ],
        },
        {
          name: 'companyName',
          title: 'Company Name',
          type: 'string',
          validation: (rule) => rule.required().max(50),
        },
        {
          name: 'description',
          title: 'Company Description',
          type: 'text',
          validation: (rule) => rule.required().max(300),
        },
      ],
    }),
    defineField({
      name: 'quickLinks',
      title: 'Quick Links Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Quick Links',
          validation: (rule) => rule.required(),
        },
        {
          name: 'links',
          title: 'Navigation Links',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'navLink',
              title: 'Navigation Link',
              fields: [
                {
                  name: 'label',
                  title: 'Link Label',
                  type: 'string',
                  validation: (rule) => rule.required().max(30),
                },
                {
                  name: 'url',
                  title: 'Link URL',
                  type: 'string',
                  description: 'Internal path (e.g., /rooms) or external URL',
                  validation: (rule) => rule.required(),
                },
                {
                  name: 'openInNewTab',
                  title: 'Open in New Tab',
                  type: 'boolean',
                  description: 'Open this link in a new tab',
                  initialValue: false,
                },
              ],
              preview: {
                select: {
                  title: 'label',
                  subtitle: 'url',
                  order: 'order',
                },
                prepare({ title, subtitle, order }) {
                  return {
                    title: `${order ? `${order}. ` : ''}${title}`,
                    subtitle: subtitle,
                  };
                },
              },
            },
          ],
          validation: (rule) => rule.min(1).max(10),
        },
      ],
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Contact Info',
          validation: (rule) => rule.required(),
        },
        {
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
          validation: (rule) => rule.required(),
        },
        {
          name: 'email',
          title: 'Email Address',
          type: 'string',
          validation: (rule) => rule.required().email(),
        },
        {
          name: 'address',
          title: 'Physical Address',
          type: 'text',
          validation: (rule) => rule.required().max(200),
        },
      ],
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      companyName: 'brandSection.companyName',
      isActive: 'isActive',
      linksCount: 'quickLinks.links',
    },
    prepare({ title, companyName, isActive, linksCount }) {
      const linkCount = Array.isArray(linksCount) ? linksCount.length : 0;
      return {
        title: title || 'Footer Section',
        subtitle: `${isActive ? '✅' : '❌'} ${companyName} (${linkCount} links)`,
      };
    },
  },
});

