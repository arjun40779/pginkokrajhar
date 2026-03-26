import { defineField, defineType } from 'sanity';

export const roomSchema = defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  fields: [
    // Read-only ID field
    defineField({
      name: 'dbId',
      title: 'Database ID',
      type: 'string',
      readOnly: true,
      description: 'Auto-generated database ID - cannot be edited',
    }),

    // Basic Info
    defineField({
      name: 'roomNumber',
      title: 'Room Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'roomNumber',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Room Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),

    // Room Details
    defineField({
      name: 'roomType',
      title: 'Room Type',
      type: 'string',
      options: {
        list: [
          { title: 'Single', value: 'SINGLE' },
          { title: 'Double', value: 'DOUBLE' },
          { title: 'Triple', value: 'TRIPLE' },
          { title: 'Dormitory', value: 'DORMITORY' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'maxOccupancy',
      title: 'Maximum Occupancy',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'currentOccupancy',
      title: 'Current Occupancy',
      type: 'number',
      readOnly: true,
      description:
        'Current occupancy is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'floor',
      title: 'Floor Number',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'roomSize',
      title: 'Room Size (sq ft)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),

    // Features
    defineField({
      name: 'hasBalcony',
      title: 'Has Balcony',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasAttachedBath',
      title: 'Has Attached Bath',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasAC',
      title: 'Has Air Conditioning',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'hasFan',
      title: 'Has Fan',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'windowDirection',
      title: 'Window Direction',
      type: 'string',
      options: {
        list: [
          { title: 'North', value: 'NORTH' },
          { title: 'South', value: 'SOUTH' },
          { title: 'East', value: 'EAST' },
          { title: 'West', value: 'WEST' },
          { title: 'Northeast', value: 'NORTHEAST' },
          { title: 'Northwest', value: 'NORTHWEST' },
          { title: 'Southeast', value: 'SOUTHEAST' },
          { title: 'Southwest', value: 'SOUTHWEST' },
        ],
      },
    }),

    // Read-only Pricing (from database)
    defineField({
      name: 'monthlyRent',
      title: 'Monthly Rent (₹)',
      type: 'number',
      readOnly: true,
      description: 'Rent is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'securityDeposit',
      title: 'Security Deposit (₹)',
      type: 'number',
      readOnly: true,
      description: 'Deposit is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'maintenanceCharges',
      title: 'Maintenance Charges (₹)',
      type: 'number',
      readOnly: true,
      description: 'Charges are managed in database - cannot be edited here',
    }),
    defineField({
      name: 'electricityIncluded',
      title: 'Electricity Included in Rent',
      type: 'boolean',
      initialValue: true,
    }),

    // Availability
    defineField({
      name: 'availabilityStatus',
      title: 'Availability Status',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'AVAILABLE' },
          { title: 'Occupied', value: 'OCCUPIED' },
          { title: 'Under Maintenance', value: 'MAINTENANCE' },
          { title: 'Reserved', value: 'RESERVED' },
        ],
        layout: 'radio',
      },
      readOnly: true,
      description: 'Status is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'availableFrom',
      title: 'Available From Date',
      type: 'datetime',
      readOnly: true,
      description:
        'Availability date is managed in database - cannot be edited here',
    }),

    // PG Reference
    defineField({
      name: 'pgReference',
      title: 'PG Reference',
      type: 'reference',
      to: [{ type: 'pg' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pgId',
      title: 'PG Database ID',
      type: 'string',
      readOnly: true,
      description: 'PG ID from database - cannot be edited here',
    }),

    // Meta
    defineField({
      name: 'featured',
      title: 'Featured Room',
      type: 'boolean',
      initialValue: false,
    }),

    // Images
    defineField({
      name: 'images',
      title: 'Room Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    }),

    // Room Features (detailed)
    defineField({
      name: 'features',
      title: 'Room Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Feature Name',
              type: 'string',
            },
            {
              name: 'available',
              title: 'Available',
              type: 'boolean',
              initialValue: true,
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
            },
          ],
        },
      ],
    }),

    // Additional Content
    defineField({
      name: 'content',
      title: 'Additional Content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'roomNumber',
      roomType: 'roomType',
      media: 'images.0',
      pgName: 'pgReference.name',
      isActive: 'isActive',
      availabilityStatus: 'availabilityStatus',
    },
    prepare({ title, roomType, media, pgName, isActive, availabilityStatus }) {
      let subtitle = roomType ? roomType.toLowerCase() : '';
      if (pgName) {
        subtitle += ` • ${pgName}`;
      }
      if (!isActive) {
        subtitle += ' (Inactive)';
      } else if (availabilityStatus && availabilityStatus !== 'AVAILABLE') {
        subtitle += ` (${availabilityStatus.toLowerCase()})`;
      }

      return {
        title: `Room ${title}`,
        subtitle,
        media,
      };
    },
  },

  orderings: [
    {
      title: 'Room Number A-Z',
      name: 'roomNumberAsc',
      by: [{ field: 'roomNumber', direction: 'asc' }],
    },
    {
      title: 'Room Number Z-A',
      name: 'roomNumberDesc',
      by: [{ field: 'roomNumber', direction: 'desc' }],
    },
    {
      title: 'Newest First',
      name: 'newest',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'Floor (Low to High)',
      name: 'floorAsc',
      by: [{ field: 'floor', direction: 'asc' }],
    },
  ],
});
