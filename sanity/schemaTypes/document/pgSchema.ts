import { defineField, defineType } from 'sanity';

export const pgSchema = defineType({
  name: 'pg',
  title: 'PG (Paying Guest)',
  type: 'document',
  fields: [
    // Read-only ID field
    defineField({
      name: 'dbId',
      title: 'Database ID',
      type: 'string',
      readOnly: true,
      description: 'Auto-generated database ID - cannot be edited',
      hidden: true, // Hide from default view since it's not user-friendly
    }),

    // Basic Info
    defineField({
      name: 'name',
      title: 'PG Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      hidden: true, // Hide from default view since it's auto-generated
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      readOnly: true,
      hidden: true, // Hide from default view since it's managed in database
      description:
        'Status is managed from the admin panel and database - cannot be edited here',
    }),

    // Location
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'area',
      title: 'Area',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'pincode',
      title: 'PIN Code',
      type: 'string',
      validation: (Rule) => Rule.required().min(6).max(6),
      readOnly: true,
    }),

    // Contact Information
    defineField({
      name: 'ownerName',
      title: 'Owner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'ownerPhone',
      title: 'Owner Phone',
      type: 'string',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'ownerEmail',
      title: 'Owner Email',
      type: 'email',
      readOnly: true,
    }),
    defineField({
      name: 'alternatePhone',
      title: 'Alternate Phone',
      type: 'string',
      readOnly: true,
    }),

    // Read-only Pricing (from database)
    defineField({
      name: 'startingPrice',
      title: 'Starting Price (₹)',
      type: 'number',
      readOnly: true,
      description: 'Price is managed in database - cannot be edited here',
    }),

    // Room Information (Read-only from database)
    defineField({
      name: 'totalRooms',
      title: 'Total Rooms',
      type: 'number',
      readOnly: true,
      description: 'Room count is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'availableRooms',
      title: 'Available Rooms',
      type: 'number',
      readOnly: true,
      description:
        'Availability is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'roomReferences',
      title: 'Room References',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'room' }],
        },
      ],
      description:
        'Linked room documents are managed by database sync - cannot be edited here',
    }),

    defineField({
      name: 'heroImage',
      title: 'PG Hero Image',
      type: 'image',
    }),

    // Images
    defineField({
      name: 'images',
      title: 'PG Images',
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

    // Amenities
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Amenity Name',
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
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'area',
      media: 'images.0',
      city: 'city',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, media, city, isActive }) {
      const statusSuffix = isActive ? '' : ' (Inactive)';

      return {
        title,
        subtitle: `${subtitle}, ${city}${statusSuffix}`,
        media,
      };
    },
  },

  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Name Z-A',
      name: 'nameDesc',
      by: [{ field: 'name', direction: 'desc' }],
    },
    {
      title: 'Newest First',
      name: 'newest',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
});

