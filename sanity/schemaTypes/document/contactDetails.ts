import { defineField, defineType } from 'sanity';

export const contactDetails = defineType({
  name: 'contactDetails',
  title: 'Contact Details',
  type: 'document',
  icon: () => '📞',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal reference name for this contact record.',
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
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
      description: 'Include country code so the WhatsApp link works correctly.',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      description: 'Primary phone number used for direct calls.',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'email',
      description: 'Optional contact email address.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
      phoneNumber: 'phoneNumber',
      whatsappNumber: 'whatsappNumber',
      email: 'email',
    },
    prepare({ title, isActive, phoneNumber, whatsappNumber, email }) {
      const availableChannels = [whatsappNumber, phoneNumber, email].filter(
        Boolean,
      ).length;

      return {
        title: title || 'Contact Details',
        subtitle: `${isActive ? '✅' : '❌'} ${availableChannels} contact method${availableChannels === 1 ? '' : 's'}`,
      };
    },
  },
});
