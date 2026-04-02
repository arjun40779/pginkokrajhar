import { fetchSanityQuery } from '@/sanity/lib/fetch';

export interface ContactDetailsData {
  _id: string;
  title: string;
  whatsappNumber?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}

export type ContactMethods = Pick<
  ContactDetailsData,
  'whatsappNumber' | 'phoneNumber' | 'email'
>;

export const activeContactDetailsQuery = `
  *[_type == "contactDetails" && isActive == true] | order(_updatedAt desc)[0] {
    _id,
    title,
    whatsappNumber,
    phoneNumber,
    email
  }
`;

export async function getActiveContactDetails(): Promise<ContactDetailsData | null> {
  try {
    return await fetchSanityQuery<ContactDetailsData | null>({
      query: activeContactDetailsQuery,
    });
  } catch (error) {
    console.error('Error fetching contact details from Sanity:', error);
    return null;
  }
}

