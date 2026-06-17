// src/libs/strapi/graphqlPagination.ts
/** Strapi GraphQL page size — fetch additional pages until a short page is returned. */
export const STRAPI_GRAPHQL_PAGE_SIZE = 100;

/**
 * Fetch every page of a Strapi GraphQL collection using offset pagination.
 * Returns `null` when the first page fails so callers can fall back to stale cache.
 */
export async function fetchAllGraphQLPages<T>(
  fetchPage: (start: number, limit: number) => Promise<T[] | null | undefined>,
  pageSize: number = STRAPI_GRAPHQL_PAGE_SIZE
): Promise<T[] | null> {
  const all: T[] = [];
  let start = 0;

  while (true) {
    const page = await fetchPage(start, pageSize);
    if (page == null) return null;
    if (page.length === 0) break;
    all.push(...page);
    if (page.length < pageSize) break;
    start += pageSize;
  }

  return all;
}
