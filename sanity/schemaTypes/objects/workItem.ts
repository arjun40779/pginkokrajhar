// sanity/schemas/objects/workItem.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "workItem",
  title: "Work Item",
  type: "object",
  fields: [
    // Title
    defineField({
      name: "title",
      title: "Video Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    // Platform Badge
    defineField({
      name: "platform",
      title: "Platform Badge",
      type: "string",
      options: {
        list: [
          { title: "TikTok", value: "tiktok" },
          { title: "Instagram Reels", value: "instagram" },
          { title: "YouTube Shorts", value: "youtube" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Thumbnail Image
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),

    // Uploaded Video
    defineField({
      name: "videoFile",
      title: "Upload Video",
      type: "file",
      options: {
        accept: "video/*",
      },
    }),

    // Or External Video URL
    defineField({
      name: "videoUrl",
      title: "Video URL (Optional)",
      type: "url",
    }),

    // Views
    defineField({
      name: "views",
      title: "Views",
      type: "string",
      description: "Example: 2.4M",
    }),

    // Likes
    defineField({
      name: "likes",
      title: "Likes",
      type: "string",
      description: "Example: 340K",
    }),
  ],
});