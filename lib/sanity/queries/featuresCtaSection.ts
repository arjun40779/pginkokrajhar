import { client } from '@/sanity/lib/client';
import type { CtaCard, Feature, FeaturesCtaSection } from '@/sanity/types';

// GROQ query to fetch the active features & CTA section
export const featuresCtaSectionQuery = `
  *[_type == "featuresCtaSection" && isActive == true][0] {
    _id,
    title,
    featuresTitle,
    layout,
    features[] {
      text,
      icon,
      highlighted,
      order
    } | order(order asc),
    ctaCards[] {
      title,
      description,
      buttonText,
      buttonUrl,
      buttonIcon,
      cardIcon,
      backgroundColor,
      footerText,
      footerLinkText,
      footerLinkUrl,
      order
    } | order(order asc),
    isActive
  }
`;

// Function to fetch features & CTA section data
export async function getFeaturesCtaSection(): Promise<FeaturesCtaSection | null> {
  try {
    const featuresCtaData = await client.fetch<FeaturesCtaSection>(
      featuresCtaSectionQuery,
    );
    return featuresCtaData;
  } catch (error) {
    console.error('Error fetching features CTA section:', error);
    return null;
  }
}

// Fallback features data if Sanity content is not available
export const fallbackFeatures: Feature[] = [
  {
    text: 'Fully furnished rooms with modern amenities',
    icon: 'CheckCircle',
    highlighted: false,
    order: 1,
  },
  {
    text: 'Nutritious meals 3 times a day',
    icon: 'CheckCircle',
    highlighted: false,
    order: 2,
  },
  {
    text: '24/7 security with CCTV surveillance',
    icon: 'CheckCircle',
    highlighted: false,
    order: 3,
  },
  {
    text: 'High-speed WiFi throughout the property',
    icon: 'CheckCircle',
    highlighted: false,
    order: 4,
  },
  {
    text: 'Regular housekeeping and maintenance',
    icon: 'CheckCircle',
    highlighted: false,
    order: 5,
  },
  {
    text: 'Flexible monthly and quarterly payment options',
    icon: 'CheckCircle',
    highlighted: false,
    order: 6,
  },
  {
    text: 'Power backup for uninterrupted supply',
    icon: 'CheckCircle',
    highlighted: false,
    order: 7,
  },
  {
    text: 'Common areas for recreation and socializing',
    icon: 'CheckCircle',
    highlighted: false,
    order: 8,
  },
];

// Fallback CTA cards if Sanity content is not available
export const fallbackCtaCards: CtaCard[] = [
  {
    title: 'Ready to Move In?',
    description:
      'Browse our available rooms and book your perfect accommodation today. We offer flexible payment plans and instant confirmation.',
    buttonText: 'Explore Rooms & Pricing',
    buttonUrl: '/rooms',
    buttonIcon: 'ArrowRight',
    backgroundColor: 'blue',
    footerText: 'Have questions?',
    footerLinkText: 'Contact us',
    footerLinkUrl: '/contact',
    order: 1,
  },
  {
    title: 'Already a Resident?',
    description:
      'Pay your monthly rent online or set up AutoPay for hassle-free automatic payments.',
    buttonText: 'Resident Dashboard',
    buttonUrl: '/resident',
    buttonIcon: 'ArrowRight',
    cardIcon: 'UserCircle',
    backgroundColor: 'green',
    order: 2,
  },
];

