// sanity/schemas/documents/hero.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "hero",
  title: "Hero Section",
  type: "document",
  fields: [
    // Badge
    defineField({
      name: "badgeText",
      title: "Badge Text",
      type: "string",
    }),

    // Headline
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    // Subheading
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "text",
      rows: 3,
    }),

    // Buttons
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [{ type: "heroButton" }],
      validation: (Rule) => Rule.max(2),
    }),

    // Stats
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [{ type: "heroStat" }],
      validation: (Rule) => Rule.max(4),
    }),

    // Background Image
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),

    // Background Video (Upload)
    defineField({
      name: "backgroundVideo",
      title: "Background Video",
      type: "file",
      options: {
        accept: "video/*",
      },
    }),

    // Or Video URL (YouTube/Vimeo/self-hosted)
    defineField({
      name: "backgroundVideoUrl",
      title: "Background Video URL",
      type: "url",
    }),

    // Overlay Opacity
    defineField({
      name: "overlayOpacity",
      title: "Overlay Opacity (0 - 1)",
      type: "number",
      initialValue: 0.4,
      validation: (Rule) => Rule.min(0).max(1),
    }),
  ],
});