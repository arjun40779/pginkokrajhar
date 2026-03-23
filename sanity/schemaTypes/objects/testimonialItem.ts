import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonialItem',
  title: 'Testimonial Item',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video', value: 'video' },
          { title: 'Text', value: 'text' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Client Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Role / Company',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'content',
      title: 'Testimonial Text',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
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
      name: 'thumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      description:
        'Thumbnail image for video testimonials (recommended for video type)',
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
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description:
        'YouTube, Vimeo or hosted video URL (for video testimonials)',
    }),
    defineField({
      name: 'videoFile',
      title: 'Upload Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    }),
  ],
});

