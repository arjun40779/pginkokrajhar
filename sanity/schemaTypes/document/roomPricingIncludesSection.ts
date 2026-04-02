import { defineField, defineType } from 'sanity';

export const roomPricingIncludesSection = defineType({
  name: 'roomPricingIncludesSection',
  title: 'Room Pricing Includes Section',
  type: 'document',
  icon: () => '💡',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this section.',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'roomAmenities',
      title: 'Room Amenities',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'commonFacilities',
      title: 'Common Facilities',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
      roomAmenities: 'roomAmenities',
      commonFacilities: 'commonFacilities',
    },
    prepare({ title, isActive, roomAmenities, commonFacilities }) {
      const roomAmenityCount = Array.isArray(roomAmenities)
        ? roomAmenities.length
        : 0;
      const commonFacilitiesCount = Array.isArray(commonFacilities)
        ? commonFacilities.length
        : 0;

      return {
        title: title || 'Room Pricing Includes Section',
        subtitle: `${isActive ? '✅' : '❌'} ${roomAmenityCount} room amenities, ${commonFacilitiesCount} common facilities`,
      };
    },
  },
});
