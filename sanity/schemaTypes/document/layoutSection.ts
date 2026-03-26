import { defineType, defineField } from 'sanity';

export const layoutSection = defineType({
  name: 'layoutSection',
  title: 'Layout Configuration',
  type: 'document',
  icon: () => '🏗️',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this layout',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this layout configuration on/off',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteMetadata',
      title: 'Site Metadata',
      type: 'object',
      fields: [
        {
          name: 'siteName',
          title: 'Site Name',
          type: 'string',
          validation: (rule) => rule.required(),
        },
        {
          name: 'siteDescription',
          title: 'Site Description',
          type: 'text',
          description: 'Default meta description for SEO',
          validation: (rule) => rule.required().max(160),
        },
        {
          name: 'siteUrl',
          title: 'Site URL',
          type: 'url',
          description: 'Base URL of the website',
        },
        {
          name: 'favicon',
          title: 'Favicon',
          type: 'image',
          description: 'Site favicon (32x32px recommended)',
          options: {
            hotspot: false,
          },
        },
        {
          name: 'appleTouchIcon',
          title: 'Apple Touch Icon',
          type: 'image',
          description: 'Apple touch icon (180x180px recommended)',
          options: {
            hotspot: false,
          },
        },
        {
          name: 'ogImage',
          title: 'Default Social Share Image',
          type: 'image',
          description: 'Default image for social media sharing',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'header',
      title: 'Header Configuration',
      type: 'reference',
      to: [{ type: 'headerSection' }],
      description: 'Reference to the header configuration',
    }),
    defineField({
      name: 'footer',
      title: 'Footer Configuration',
      type: 'reference',
      to: [{ type: 'footerSection' }],
      description: 'Reference to the footer configuration',
    }),

    defineField({
      name: 'seo',
      title: 'SEO Configuration',
      type: 'object',
      fields: [
        {
          name: 'robotsPolicy',
          title: 'Robots Policy',
          type: 'string',
          options: {
            list: [
              { title: 'Index, Follow (Default)', value: 'index,follow' },
              { title: 'No Index, No Follow', value: 'noindex,nofollow' },
              { title: 'Index, No Follow', value: 'index,nofollow' },
              { title: 'No Index, Follow', value: 'noindex,follow' },
            ],
          },
          initialValue: 'index,follow',
        },
        {
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'Canonical URL for this site (optional)',
        },
        {
          name: 'structuredData',
          title: 'JSON-LD Structured Data',
          type: 'text',
          description: 'Custom structured data for rich snippets',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      siteName: 'siteMetadata.siteName',
      isActive: 'isActive',
    },
    prepare({ title, siteName, isActive }) {
      return {
        title: title || 'Layout Configuration',
        subtitle: `${isActive ? '✅' : '❌'} ${siteName || 'No site name'}`,
      };
    },
  },
});

