/**
 * Utility functions for handling images in Astro
 */

/**
 * Converts an image object to a URL string for SEO and sharing
 * @param img - The image object from Astro's Image component
 * @param baseUrl - The base URL to use for the image URL (defaults to current URL)
 * @returns The full URL of the image or undefined if no image is provided
 */
export const getImageUrl = (
  img: { src: string; width: number; height: number; format: string } | undefined,
  baseUrl?: string
): string | undefined => {
  if (!img) return undefined;

  // Use the provided baseUrl or the current URL
  const urlBase = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  // This is a simplified approach - in a real project, you might need to use
  // the Astro.site property and ensure the path is correct
  return new URL(img.src, urlBase).href;
};

/**
 * Gets the best available image for meta tags (featured image or thumbnail)
 * @param featuredImage - The featured image object
 * @param thumbnail - The thumbnail image object
 * @param baseUrl - The base URL to use for the image URL
 * @returns The URL of the best available image or undefined if no images are available
 */
export const getMetaImageUrl = (
  featuredImage: { src: string; width: number; height: number; format: string } | undefined,
  thumbnail: { src: string; width: number; height: number; format: string } | undefined,
  baseUrl?: string
): string | undefined => {
  return featuredImage
    ? getImageUrl(featuredImage, baseUrl)
    : thumbnail
      ? getImageUrl(thumbnail, baseUrl)
      : undefined;
};
