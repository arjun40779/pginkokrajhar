// sanity/schemaTypes/objects/contactPageSection.ts

import { defineType, defineField } from 'sanity';
import { Mail } from 'lucide-react';

export default defineType({
  name: 'contactPageSection',
  title: 'Contact Section',
  type: 'object',
  icon: Mail,
  fields: [
    defineField({
      name: 'sectionId',
      title: 'Section ID',
      type: 'string',
      description: 'Optional ID for linking/navigation',
    }),

    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        defineField({
          name: 'email',
          title: 'Email Address',
          type: 'string',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
        }),
        defineField({
          name: 'address',
          title: 'Address',
          type: 'text',
          rows: 2,
        }),
      ],
    }),

    defineField({
      name: 'showForm',
      title: 'Show Contact Form',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'formFields',
      title: 'Form Configuration',
      type: 'object',
      hidden: ({ parent }) => !parent?.showForm,
      fields: [
        defineField({
          name: 'nameField',
          title: 'Show Name Field',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'emailField',
          title: 'Show Email Field',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'messageField',
          title: 'Show Message Field',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'submitButtonText',
          title: 'Submit Button Text',
          type: 'string',
          initialValue: 'Send Message',
        }),
      ],
    }),

    defineField({
      name: 'isVisible',
      title: 'Show Section',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      heading: 'heading',
      showForm: 'showForm',
    },
    prepare({ heading, showForm }) {
      return {
        title: 'Contact Section',
        subtitle: `${heading || 'No heading'} ${showForm ? '(with form)' : '(info only)'}`,
        media: Mail,
      };
    },
  },
});
