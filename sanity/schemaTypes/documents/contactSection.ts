import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Main Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: "Let's Create Something Viral",
    }),

    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
      initialValue:
        'Ready to take your content to the next level? Get in touch with us today.',
    }),

    defineField({
      name: 'emailSection',
      title: 'Email Section',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Email Us',
        }),
        defineField({
          name: 'primaryEmail',
          title: 'Primary Email',
          type: 'string',
          validation: (Rule) => Rule.email(),
          initialValue: 'contact@horizonvisiongroup.in',
        }),
        defineField({
          name: 'supportEmail',
          title: 'Support Email',
          type: 'string',
          validation: (Rule) => Rule.email(),
          initialValue: 'support@horizonvisiongroup.in',
        }),
      ],
    }),

    defineField({
      name: 'liveChatSection',
      title: 'Live Chat Section',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Live Chat',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'string',
          initialValue: 'Get instant answers to your questions',
        }),
        defineField({
          name: 'buttonText',
          title: 'Button Text',
          type: 'string',
          initialValue: 'Start Chat',
        }),
      ],
    }),

    defineField({
      name: 'quickTurnaroundSection',
      title: 'Quick Turnaround Section',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Quick Turnaround',
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
          initialValue:
            'Need your video edited ASAP? We offer 24-hour rush service for urgent projects.',
        }),
        defineField({
          name: 'availabilityStatus',
          title: 'Availability Status',
          type: 'string',
          initialValue: 'Available now',
        }),
        defineField({
          name: 'isAvailable',
          title: 'Currently Available',
          type: 'boolean',
          description: 'Shows green dot and availability status',
          initialValue: true,
        }),
      ],
    }),

    defineField({
      name: 'formEmail',
      title: 'Form Submissions Email',
      type: 'string',
      description: 'Email address where form submissions will be sent',
      validation: (Rule) => Rule.required().email(),
      initialValue: 'contact@horizonvisiongroup.in',
    }),
  ],
});

