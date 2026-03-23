 // sanity/schemas/documents/servicesSection.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "servicesSection",
  title: "Services Section",
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
      name: "services",
      title: "Service Cards",
      type: "array",
      of: [{ type: "serviceCard" }],
      validation: (Rule) => Rule.min(1).max(12),
    }),

    // Optional background
    defineField({
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
    }),

    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Optional Tailwind class or hex",
    }),
  ],
});