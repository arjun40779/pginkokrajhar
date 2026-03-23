// sanity/schemas/objects/heroButton.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroButton",
  title: "Hero Button",
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
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      options: {
        list: [
          { title: "Primary", value: "primary" },
          { title: "Outline", value: "outline" },
        ],
      },
      initialValue: "primary",
    }),
  ],
});