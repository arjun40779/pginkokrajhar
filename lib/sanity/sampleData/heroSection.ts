/**
 * Sample Hero Section Document for Sanity Studio
 *
 * Once you have your Sanity Studio running at http://localhost:3000/studio,
 * create a new Hero Section document with these sample values:
 */

export const sampleHeroData = {
  _type: 'heroSection',
  title: 'Main Hero Section',
  badge: {
    show: true,
    icon: '⭐',
    text: 'Rated 4.8/5 by 500+ residents',
  },
  mainTitle: 'Your Perfect Home Away From Home',
  subtitle:
    'Comfortable, secure, and affordable PG accommodation for students and working professionals in the heart of the city.',
  heroImage: {
    // Upload your room image in Sanity Studio
    alt: 'Modern PG Room with comfortable furniture',
  },
  ctaButtons: [
    {
      text: 'View Rooms',
      url: '/pgs',
      style: 'primary',
      icon: 'arrow-right',
    },
    {
      text: 'Contact Us',
      url: '/contact',
      style: 'outline',
    },
  ],
  stats: [
    {
      number: '500+',
      label: 'Happy Residents',
    },
    {
      number: '50+',
      label: 'Rooms Available',
    },
    {
      number: '24/7',
      label: 'Support',
    },
  ],
  backgroundColor: 'blue-gradient',
  layout: 'image-right',
  isActive: true,
};

/**
 * Instructions to set up and use:
 *
 * 1. Start your development server:
 *    npm run dev
 *
 * 2. Visit your Sanity Studio:
 *    http://localhost:3000/studio
 *
 * 3. Create a new "Hero Section" document with the sample data above
 *
 * 4. Upload an image for the heroImage field
 *
 * 5. Set isActive to true (make sure only one hero section is active at a time)
 *
 * 6A. Your home page will now display the dynamic content from Sanity!
 *
 * Features included:
 * - Dynamic badge with icon and text
 * - Customizable title and subtitle
 * - Multiple background color options
 * - Flexible CTA buttons with different styles
 * - Statistics section
 * - Image positioning (left, right, or centered)
 * - Responsive design
 * - SEO-optimized images with Next.js Image component
 */

