import type { CollectionEntry } from 'astro:content';
import { getEntry } from 'astro:content';

export type PageSlug = string;

/**
 * Gets a page entry from the content collection
 * @param slug The page slug to get (e.g. "/", "about", "contact")
 * @param options Optional configuration
 * @returns The page entry
 * @throws Error if the page is not found
 */
export async function getPageEntry(
  slug: PageSlug,
  options: {
    errorMessage?: string;
  } = {}
): Promise<CollectionEntry<'pages'>> {
  const { errorMessage } = options;

  const page = await getEntry('pages', slug);

  if (!page) {
    throw new Error(
      errorMessage ??
        `Page not found. Make sure src/content/pages${slug === '/' ? '/home' : slug}.mdx exists and has slug: "${slug}"`
    );
  }

  return page;
}
