// sanity/schemas/objects/ctaButton.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "ctaButton",
  title: "CTA Button",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Button Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Button Link",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Style Variant",
      type: "string",
      options: {
        list: [
          { title: "Primary (Gradient)", value: "primary" },
          { title: "Secondary", value: "secondary" },
        ],
      },
      initialValue: "primary",
    }),
  ],
});