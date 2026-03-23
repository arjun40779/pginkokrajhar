// sanity/schemas/documents/ourWorkSection.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "ourWorkSection",
  title: "Our Work Section",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Section Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),

    defineField({
      name: "items",
      title: "Work Items",
      type: "array",
      of: [{ type: "workItem" }],
      validation: (Rule) => Rule.min(1).max(20),
    }),

    // Optional background support
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});