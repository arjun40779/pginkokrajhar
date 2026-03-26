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
      description: 'Configure which sections appear on this page',
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
                  { title: 'Hero Section', value: 'heroSection' },
                  { title: 'Amenities Section', value: 'amenitiesSection' },
                  { title: 'Facilities Section', value: 'facilitiesSection' },
                  {
                    title: 'Features & CTA Section',
                    value: 'featuresCtaSection',
                  },
                  { title: 'Contact Section', value: 'contactSection' },
                  {
                    title: 'Contact Location Section',
                    value: 'contactLocationSection',
                  },
                  { title: 'FAQ Section', value: 'faqSection' },
                ],
              },
              description: 'This helps categorize the section type',
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
                { type: 'contactSection' },
                { type: 'contactLocationSection' },
                { type: 'faqSection' },
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
          ],
          preview: {
            select: {
              sectionType: 'sectionType',
              isVisible: 'isVisible',
              title: 'sectionRef.title',
              type: 'sectionRef._type',
            },
            prepare({ sectionType, title, type, isVisible }) {
              const typeLabels = {
                heroSection: 'Hero',
                amenitiesSection: 'Amenities',
                facilitiesSection: 'Facilities',
                featuresCtaSection: 'Features & CTA',
                contactSection: 'Contact Form',
                contactLocationSection: 'Contact Location',
                faqSection: 'FAQ',
              };

              const displayType =
                typeLabels[sectionType as keyof typeof typeLabels] ||
                typeLabels[type as keyof typeof typeLabels] ||
                sectionType ||
                type ||
                'Unknown';
              const displayTitle = title || 'Untitled Section';

              return {
                title: displayType,
                subtitle: `${isVisible ? '👁️ Visible' : '🚫 Hidden'} • ${displayTitle}`,
              };
            },
          },
        },
      ],
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

