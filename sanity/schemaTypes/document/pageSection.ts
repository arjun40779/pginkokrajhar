import { defineType, defineField } from 'sanity';

export const pageSection = defineType({
  name: 'pageSection',
  title: 'Page Configuration',
  type: 'document',
  icon: () => '📄',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Internal reference and page title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Page Slug',
      type: 'slug',
      description: 'URL slug for this page (e.g., "home", "about")',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this page on/off',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageMetadata',
      title: 'Page-Specific Metadata',
      type: 'object',
      description: 'Overrides for this specific page',
      fields: [
        {
          name: 'pageTitle',
          title: 'Page Title (SEO)',
          type: 'string',
          description: 'Override default site title for this page',
          validation: (rule) => rule.max(60),
        },
        {
          name: 'pageDescription',
          title: 'Page Description (SEO)',
          type: 'text',
          description: 'Override default meta description for this page',
          validation: (rule) => rule.max(160),
        },
        {
          name: 'ogImage',
          title: 'Social Share Image',
          type: 'image',
          description: 'Override default social share image for this page',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'customMetaTags',
          title: 'Custom Meta Tags',
          type: 'text',
          description: 'Additional meta tags for this page',
        },
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      description:
        'Configure which sections appear on this page and their order',
      of: [
        {
          type: 'object',
          name: 'sectionReference',
          title: 'Section',
          fields: [
            {
              name: 'sectionType',
              title: 'Section Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Hero Section', value: 'hero' },
                  { title: 'Amenities Section', value: 'amenities' },
                  { title: 'Facilities Section', value: 'facilities' },
                  { title: 'Features & CTA Section', value: 'featuresCta' },
                ],
              },
              validation: (rule) => rule.required(),
            },
            {
              name: 'sectionRef',
              title: 'Section Reference',
              type: 'reference',
              to: [
                { type: 'heroSection' },
                { type: 'amenitiesSection' },
                { type: 'facilitiesSection' },
                { type: 'featuresCtaSection' },
              ],
              validation: (rule) => rule.required(),
            },
            {
              name: 'isVisible',
              title: 'Is Visible',
              type: 'boolean',
              description: 'Show/hide this section on the page',
              initialValue: true,
            },
            {
              name: 'customSettings',
              title: 'Custom Section Settings',
              type: 'object',
              description: 'Override section-specific settings for this page',
              fields: [
                {
                  name: 'backgroundColor',
                  title: 'Background Color Override',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Default (No Override)', value: '' },
                      { title: 'White', value: 'bg-white' },
                      { title: 'Gray 50', value: 'bg-gray-50' },
                      { title: 'Blue 50', value: 'bg-blue-50' },
                      { title: 'Green 50', value: 'bg-green-50' },
                    ],
                  },
                },
                {
                  name: 'paddingOverride',
                  title: 'Padding Override',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Default (No Override)', value: '' },
                      { title: 'Small (py-8)', value: 'py-8' },
                      { title: 'Medium (py-16)', value: 'py-16' },
                      { title: 'Large (py-24)', value: 'py-24' },
                      { title: 'Extra Large (py-32)', value: 'py-32' },
                    ],
                  },
                },
                {
                  name: 'marginOverride',
                  title: 'Margin Override',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Default (No Override)', value: '' },
                      { title: 'No Margin', value: 'mt-0' },
                      { title: 'Small (mt-8)', value: 'mt-8' },
                      { title: 'Medium (mt-16)', value: 'mt-16' },
                    ],
                  },
                },
              ],
            },
            {
              name: 'order',
              title: 'Display Order',
              type: 'number',
              description:
                'Order of this section on the page (lower numbers appear first)',
              validation: (rule) => rule.min(0),
            },
          ],
          preview: {
            select: {
              sectionType: 'sectionType',
              isVisible: 'isVisible',
              order: 'order',
              sectionRef: 'sectionRef.title',
            },
            prepare({ sectionType, isVisible, order, sectionRef }) {
              const typeLabels = {
                hero: 'Hero',
                amenities: 'Amenities',
                facilities: 'Facilities',
                featuresCta: 'Features & CTA',
              };
              return {
                title: `${order ? `${order}. ` : ''}${typeLabels[sectionType as keyof typeof typeLabels] || sectionType}`,
                subtitle: `${isVisible ? '👁️' : '🚫'} ${sectionRef || 'No section selected'}`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      isActive: 'isActive',
      sectionsCount: 'sections',
    },
    prepare({ title, slug, isActive, sectionsCount }) {
      const sectionCount = Array.isArray(sectionsCount)
        ? sectionsCount.length
        : 0;
      return {
        title: title || 'Untitled Page',
        subtitle: `${isActive ? '✅' : '❌'} /${slug || 'no-slug'} (${sectionCount} sections)`,
      };
    },
  },
});

