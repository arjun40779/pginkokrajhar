import { defineType, defineField } from 'sanity';

export const featuresCtaSection = defineType({
  name: 'featuresCtaSection',
  title: 'Features & CTA Section',
  type: 'document',
  icon: () => '✅',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this section',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle this section on/off',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuresTitle',
      title: 'Features Section Title',
      type: 'string',
      description: 'Title for the features list (left side)',
      placeholder: 'Everything You Need Under One Roof',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'features',
      title: 'Feature List',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'feature',
          title: 'Feature',
          fields: [
            {
              name: 'text',
              title: 'Feature Text',
              type: 'string',
              validation: (rule) => rule.required().max(100),
            },
          ],
          preview: {
            select: {
              title: 'text',
              icon: 'icon',
              order: 'order',
            },
            prepare({ title, icon, order }) {
              return {
                title: `${order ? `${order}. ` : ''}${title}`,
                subtitle: `Icon: ${icon}`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).max(15),
    }),
    defineField({
      name: 'ctaCards',
      title: 'Call-to-Action Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'ctaCard',
          title: 'CTA Card',
          fields: [
            {
              name: 'title',
              title: 'Card Title',
              type: 'string',
              validation: (rule) => rule.required().max(50),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (rule) => rule.required().max(200),
            },
            {
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              validation: (rule) => rule.required().max(30),
            },
            {
              name: 'buttonUrl',
              title: 'Button URL',
              type: 'string',
              description: 'Internal path (e.g., /rooms) or external URL',
              validation: (rule) => rule.required(),
            },

            {
              name: 'footerText',
              title: 'Footer Text',
              type: 'text',
              description:
                'Optional footer text with link (e.g., "Have questions? Contact us")',
            },
            {
              name: 'footerLinkText',
              title: 'Footer Link Text',
              type: 'string',
              description: 'Text for the footer link',
            },
            {
              name: 'footerLinkUrl',
              title: 'Footer Link URL',
              type: 'string',
              description: 'URL for the footer link',
            },
          ],
          preview: {
            select: {
              title: 'title',
              description: 'description',
              backgroundColor: 'backgroundColor',
              order: 'order',
            },
            prepare({ title, description, backgroundColor, order }) {
              return {
                title: `${order ? `${order}. ` : ''}${title}`,
                subtitle: `${backgroundColor} - ${description?.substring(0, 50)}...`,
              };
            },
          },
        },
      ],
      validation: (rule) => rule.min(1).max(5),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      featuresTitle: 'featuresTitle',
      isActive: 'isActive',
      featuresCount: 'features',
      ctaCount: 'ctaCards',
    },
    prepare({ title, featuresTitle, isActive, featuresCount, ctaCount }) {
      const fCount = Array.isArray(featuresCount) ? featuresCount.length : 0;
      const cCount = Array.isArray(ctaCount) ? ctaCount.length : 0;
      return {
        title: title || 'Features & CTA Section',
        subtitle: `${isActive ? '✅' : '❌'} ${featuresTitle} (${fCount} features, ${cCount} CTAs)`,
      };
    },
  },
});

