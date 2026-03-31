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
      hidden: true,
    }),

    // Basic Info
    defineField({
      name: 'roomNumber',
      title: 'Room Number',
      type: 'string',
      readOnly: true,
      description: 'Room number is managed in database - cannot be edited here',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      validation: (Rule) => Rule.required(),
      // hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Room Title',
      type: 'string',
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
      readOnly: true,
      description:
        'Status is managed from the admin panel and database - cannot be edited here',
    }),

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
      },
      // readOnly: true,
      description: 'Room type is managed in database - cannot be edited here',
    }),

    defineField({
      name: 'maxOccupancy',
      title: 'Maximum Occupancy',
      type: 'number',
      readOnly: true,
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
    defineField({
      name: 'hasBalcony',
      title: 'Has Balcony',
      type: 'boolean',
      readOnly: true,
    }),
    defineField({
      name: 'hasAttachedBath',
      title: 'Has Attached Bath',
      type: 'boolean',
      readOnly: true,
    }),
    defineField({
      name: 'hasAC',
      title: 'Has AC',
      type: 'boolean',
      readOnly: true,
    }),
    defineField({
      name: 'hasFan',
      title: 'Has Fan',
      type: 'boolean',
      readOnly: true,
    }),
    defineField({
      name: 'windowDirection',
      title: 'Window Direction',
      type: 'string',
      readOnly: true,
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
      hidden: true,
    }),

    // PG Reference
    defineField({
      name: 'pgReference',
      title: 'PG Reference',
      type: 'reference',
      to: [{ type: 'pg' }],
      validation: (Rule) => Rule.required(),
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'pgId',
      title: 'PG Database ID',
      type: 'string',
      readOnly: true,
      description: 'PG ID from database - cannot be edited here',
      hidden: true,
    }),

    // Meta
    defineField({
      name: 'featured',
      title: 'Featured Room',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
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
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [
        {
          type: 'string',
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

