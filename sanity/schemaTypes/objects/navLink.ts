// sanity/schemas/objects/navLink.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "navLink",
  title: "Navigation Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link URL",
      type: "string",
      description: "Example: /services",
      validation: (Rule) => Rule.required(),
    }),
  ],
});