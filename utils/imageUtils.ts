// Utility functions for handling Sanity images

import type { SanityImage } from '@/sanity/types';

/**
 * Get image URL from SanityImage with fallback
 * @param image - SanityImage object from Sanity
 * @param fallbackUrl - Default image URL if no image is provided
 * @returns Image URL string
 */
export function getImageUrl(
  image?: SanityImage,
  fallbackUrl: string = '/placeholder-logo.png',
): string {
  if (image?.asset?.url) {
    return image.asset.url;
  }
  return fallbackUrl;
}

/**
 * Get image alt text with fallback
 * @param image - SanityImage object from Sanity
 * @param fallbackAlt - Default alt text if none is provided
 * @returns Alt text string
 */
export function getImageAlt(
  image?: SanityImage,
  fallbackAlt: string = 'Logo',
): string {
  if (image?.alt) {
    return image.alt;
  }
  return fallbackAlt;
}

/**
 * Get complete image props with URL and alt text
 * @param image - SanityImage object from Sanity
 * @param fallbackUrl - Default image URL if no image is provided
 * @param fallbackAlt - Default alt text if none is provided
 * @returns Object with url and alt properties
 */
export function getImageProps(
  image?: SanityImage,
  fallbackUrl: string = '/placeholder-logo.png',
  fallbackAlt: string = 'Logo',
): { url: string; alt: string } {
  return {
    url: getImageUrl(image, fallbackUrl),
    alt: getImageAlt(image, fallbackAlt),
  };
}
