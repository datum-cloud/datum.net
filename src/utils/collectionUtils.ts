import { getEntry } from 'astro:content';

export type slug = string;

/**
 * Gets an entry from a content collection
 * @param collection The collection name (e.g. 'authors', 'blog', 'pages')
 * @param slug The entry slug to get
 * @param options Optional configuration
 * @returns The collection entry
 * @throws Error if the entry is not found
 */
export async function getCollectionEntry(
  collection: string,
  slug: slug,
  options: {
    errorMessage?: string;
  } = {}
): Promise<any> {
  const { errorMessage } = options;

  try {
    const data = await getEntry(collection as any, slug);

    if (!data) {
      throw new Error(
        errorMessage ??
          `Entry not found. Make sure src/content/${collection}/${slug}.mdx exists and has slug: "${slug}"`
      );
    }

    return data;
  } catch (error) {
    throw new Error(
      errorMessage ??
        `Error getting entry from ${collection} collection: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
