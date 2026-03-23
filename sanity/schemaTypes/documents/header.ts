// sanity/schemas/documents/header.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "header",
  title: "Header",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Important for SEO and accessibility",
          validation: (Rule) => Rule.required(),
        },
      ],
    }),

    defineField({
      name: "logoLink",
      title: "Logo Link",
      type: "string",
      description: "Usually '/'",
      initialValue: "/",
    }),

    defineField({
      name: "logoText",
      title: "Fallback Logo Text",
      type: "string",
      description: "Used if image is not provided",
    }),

    defineField({
      name: "navigation",
      title: "Navigation Links",
      type: "array",
      of: [{ type: "navLink" }],
    }),

    defineField({
      name: "cta",
      title: "Call To Action Button",
      type: "ctaButton",
    }),
  ],
});