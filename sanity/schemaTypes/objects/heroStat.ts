// sanity/schemas/objects/heroStat.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroStat",
  title: "Hero Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
});