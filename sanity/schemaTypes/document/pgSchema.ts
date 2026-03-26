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
    }),

    // Location
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'area',
      title: 'Area',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pincode',
      title: 'PIN Code',
      type: 'string',
      validation: (Rule) => Rule.required().min(6).max(6),
    }),
    defineField({
      name: 'coordinates',
      title: 'Location Coordinates',
      type: 'object',
      fields: [
        defineField({
          name: 'latitude',
          title: 'Latitude',
          type: 'number',
        }),
        defineField({
          name: 'longitude',
          title: 'Longitude',
          type: 'number',
        }),
      ],
    }),

    // Contact Information
    defineField({
      name: 'ownerName',
      title: 'Owner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ownerPhone',
      title: 'Owner Phone',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ownerEmail',
      title: 'Owner Email',
      type: 'email',
    }),
    defineField({
      name: 'alternatePhone',
      title: 'Alternate Phone',
      type: 'string',
    }),

    // Rules & Policies
    defineField({
      name: 'genderRestriction',
      title: 'Gender Restriction',
      type: 'string',
      options: {
        list: [
          { title: 'Boys Only', value: 'BOYS' },
          { title: 'Girls Only', value: 'GIRLS' },
          { title: 'Co-ed', value: 'COED' },
        ],
        layout: 'radio',
      },
      initialValue: 'COED',
    }),
    defineField({
      name: 'gateClosingTime',
      title: 'Gate Closing Time',
      type: 'string',
      description: 'Format: HH:MM (e.g., 22:00)',
    }),
    defineField({
      name: 'smokingAllowed',
      title: 'Smoking Allowed',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'drinkingAllowed',
      title: 'Drinking Allowed',
      type: 'boolean',
      initialValue: false,
    }),

    // Read-only Pricing (from database)
    defineField({
      name: 'startingPrice',
      title: 'Starting Price (₹)',
      type: 'number',
      readOnly: true,
      description: 'Price is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'securityDeposit',
      title: 'Security Deposit (₹)',
      type: 'number',
      readOnly: true,
      description: 'Deposit is managed in database - cannot be edited here',
    }),
    defineField({
      name: 'brokerageCharges',
      title: 'Brokerage Charges (₹)',
      type: 'number',
      readOnly: true,
      description: 'Charges are managed in database - cannot be edited here',
    }),

    // Utilities Included
    defineField({
      name: 'electricityIncluded',
      title: 'Electricity Included',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'waterIncluded',
      title: 'Water Included',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'wifiIncluded',
      title: 'WiFi Included',
      type: 'boolean',
      initialValue: true,
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

    // Meta
    defineField({
      name: 'featured',
      title: 'Featured PG',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'PENDING' },
          { title: 'Verified', value: 'VERIFIED' },
          { title: 'Rejected', value: 'REJECTED' },
        ],
      },
      initialValue: 'PENDING',
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
      title: 'name',
      subtitle: 'area',
      media: 'images.0',
      city: 'city',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, media, city, isActive }) {
      return {
        title,
        subtitle: `${subtitle}, ${city} ${!isActive ? '(Inactive)' : ''}`,
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
