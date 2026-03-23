// sanity/schemas/objects/serviceCard.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "serviceCard",
  title: "Service Card",
  type: "object",
  fields: [
    // Icon Upload
    defineField({
      name: "icon",
      title: "Icon Image",
      type: "image",
      options: { hotspot: true },
    }),

    // Optional: Icon Name (if using Lucide/React Icons instead)
    defineField({
      name: "iconName",
      title: "Icon Name (Optional)",
      type: "string",
      description: "Example: video, scissors, trending-up",
    }),

    defineField({
      name: "title",
      title: "Service Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "highlight",
      title: "Highlight Card",
      type: "boolean",
      description: "Enable special styling",
      initialValue: false,
    }),
  ],
});