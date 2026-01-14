// src/libs/strapi/index.ts
/**
 * Strapi GraphQL client for fetching content from Strapi Cloud
 */

const STRAPI_URL =
  import.meta.env.STRAPI_URL || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against Strapi
 * @param query - The GraphQL query string
 * @param variables - Optional variables for the query
 * @returns The query result data
 */
export async function graphql<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | null> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const url = `${STRAPI_URL}/graphql`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Strapi GraphQL error: ${response.status} ${response.statusText}`, text);
      return null;
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors) {
      console.error('Strapi GraphQL errors:', result.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    return null;
  }
}

// Re-export types and utilities from types/strapi.ts for convenience
export type {
  StrapiImage,
  StrapiAuthor,
  StrapiAuthorFull,
  StrapiSocial,
  StrapiCategory,
  StrapiBlock,
  StrapiArticle,
  StrapiArticlesResponse,
  StrapiArticleResponse,
  StrapiAuthorsResponse,
  NormalizedStrapiArticle,
} from '../../types/strapi';
export { getStrapiMediaUrl, normalizeArticle, resolveMarkdownStrapiUrls } from '../../types/strapi';

// Re-export authors module
export {
  AUTHORS_QUERY,
  AUTHOR_BY_DOCUMENT_ID_QUERY,
  AUTHOR_BY_SLUG_QUERY,
  fetchStrapiAuthors,
  fetchStrapiAuthorByDocumentId,
  fetchStrapiAuthorBySlug,
  getStrapiTeamMembers,
  getTeamBgColor,
  getAuthorBgColorFromStrapi,
} from './authors';

// Re-export articles module (queries and cached fetchers)
export {
  ARTICLES_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
  fetchStrapiArticles,
  fetchStrapiArticleBySlug,
} from './articles';
