import { defineType, defineField } from 'sanity';

export const headerSection = defineType({
  name: 'headerSection',
  title: 'Header Section',
  type: 'document',
  icon: () => '📋',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this header',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this header on/off',
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
          name: 'homeUrl',
          title: 'Logo Link URL',
          type: 'string',
          description: 'URL when logo is clicked (usually "/")',
          initialValue: '/',
          validation: (rule) => rule.required(),
        },
      ],
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navItem',
          title: 'Navigation Item',
          fields: [
            {
              name: 'label',
              title: 'Navigation Label',
              type: 'string',
              validation: (rule) => rule.required().max(30),
            },
            {
              name: 'url',
              title: 'Navigation URL',
              type: 'string',
              description: 'Internal path (e.g., /rooms) or external URL',
              validation: (rule) => rule.required(),
            },
            {
              name: 'icon',
              title: 'Navigation Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Home', value: 'Home' },
                  { title: 'Building2 (Rooms)', value: 'Building2' },
                  { title: 'UserCircle (Profile)', value: 'UserCircle' },
                  { title: 'Phone (Contact)', value: 'Phone' },
                  { title: 'Mail', value: 'Mail' },
                  { title: 'Calendar', value: 'Calendar' },
                  { title: 'Settings', value: 'Settings' },
                  { title: 'Info', value: 'Info' },
                  { title: 'CreditCard (Payment)', value: 'CreditCard' },
                  { title: 'MapPin (Location)', value: 'MapPin' },
                ],
              },
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
              icon: 'icon',
            },
            prepare({ title, subtitle, icon }) {
              return {
                title: `${title}`,
                subtitle: `${icon} - ${subtitle}`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).max(10),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      companyName: 'brandSection.companyName',
      isActive: 'isActive',
      navCount: 'navigation',
    },
    prepare({ title, companyName, isActive, navCount }) {
      const navItemCount = Array.isArray(navCount) ? navCount.length : 0;
      return {
        title: title || 'Header Section',
        subtitle: `${isActive ? '✅' : '❌'} ${companyName} (${navItemCount} nav items)`,
      };
    },
  },
});

