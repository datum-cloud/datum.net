// src/libs/strapi/articles.ts
/**
 * Strapi Articles module with caching support
 */

import { Cache } from '@libs/cache';
import type { StrapiArticlesResponse, StrapiArticle } from '../../types/strapi';

const STRAPI_URL =
  import.meta.env.STRAPI_URL || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';
const CACHE_ENABLED =
  import.meta.env.STRAPI_CACHE_ENABLED === 'true' || import.meta.env.STRAPI_CACHE_ENABLED === '1';

const DEFAULT_CACHE_TTL_MS = 300000; // 5 minutes
const envTtlSec = parseInt(import.meta.env.STRAPI_CACHE_TTL ?? '300', 10);
const ARTICLES_CACHE_TTL =
  Number.isNaN(envTtlSec) || envTtlSec <= 0 ? DEFAULT_CACHE_TTL_MS : envTtlSec * 1000;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against Strapi (local version to avoid circular import)
 */
async function graphqlQuery<T>(
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

const cache = new Cache('.cache');
const ARTICLES_CACHE_KEY = 'strapi-articles';
const ARTICLE_CACHE_PREFIX = 'strapi-article-';

/**
 * GraphQL query to fetch all articles (Strapi v5 format, with high limit)
 */
export const ARTICLES_QUERY = `
  query GetArticles {
    articles(pagination: { limit: 100 }) {
      documentId
      title
      slug
      description
      originalPublishedAt
      blocks {
        __typename
        ... on ComponentSharedQuote {
          body
          title
        }
        ... on ComponentSharedRichText {
          id
          body
        }
      }
      cover {
        url
        alternativeText
        width
        height
        formats
      }
      author {
        documentId
        slug
        name
        avatar {
          url
          alternativeText
        }
      }
      category {
        name
        slug
      }
    }
  }
`;

/**
 * GraphQL query to fetch a single article by slug
 */
export const ARTICLE_BY_SLUG_QUERY = `
  query GetArticleBySlug($slug: String!) {
    articles(filters: { slug: { eq: $slug } }) {
      documentId
      title
      slug
      description
      originalPublishedAt
      blocks {
        __typename
        ... on ComponentSharedQuote {
          body
          title
        }
        ... on ComponentSharedRichText {
          id
          body
        }
      }
      cover {
        url
        alternativeText
        width
        height
        formats
      }
      author {
        documentId
        slug
        name
        avatar {
          url
          alternativeText
        }
      }
      category {
        name
        slug
      }
      seo {
        metaTitle
        metaDescription
        ogTitle
        ogDescription
        shareImage {
          url
        }
      }
    }
  }
`;

/**
 * GraphQL query to fetch articles by category slug
 */
export const ARTICLES_BY_CATEGORY_QUERY = `
  query GetArticlesByCategory($categorySlug: String!) {
    articles(filters: { category: { slug: { eq: $categorySlug } } }) {
      documentId
      title
      slug
      description
      originalPublishedAt
      cover {
        url
        alternativeText
        width
        height
        formats
      }
      author {
        documentId
        slug
        name
        avatar {
          url
          alternativeText
        }
      }
      category {
        name
        slug
      }
    }
  }
`;

/**
 * Validates that an object is a valid StrapiArticle
 * @param obj - The object to validate
 * @returns True if the object is a valid StrapiArticle
 */
function isValidStrapiArticle(obj: unknown): obj is StrapiArticle {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const article = obj as Record<string, unknown>;
  return typeof article.documentId === 'string' && typeof article.slug === 'string';
}

/**
 * Validates that cached data has the correct structure with StrapiArticle objects
 * @param data - The cached data to validate
 * @returns True if the data structure is valid
 */
function isValidCachedArticles(data: unknown): data is StrapiArticle[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(isValidStrapiArticle);
}

/**
 * Fetch all articles from Strapi with caching (for listing & navigation)
 * @returns Array of all Strapi articles
 */
export async function fetchStrapiArticles(): Promise<StrapiArticle[]> {
  // Check cache first (when enabled)
  if (CACHE_ENABLED && cache.has(ARTICLES_CACHE_KEY)) {
    const cached = cache.get<StrapiArticle[]>(ARTICLES_CACHE_KEY);
    if (cached && isValidCachedArticles(cached)) {
      return cached;
    }
    if (cached) {
      console.warn('Invalid cached Strapi articles data detected, fetching fresh data from API');
    }
  }

  // Fetch from API
  const response = await graphqlQuery<StrapiArticlesResponse>(ARTICLES_QUERY);

  if (!response?.articles) {
    console.warn('No articles returned from Strapi API');
    return [];
  }

  // For list cache we drop rich-text blocks to keep cache small, but preserve reading time.
  // Detail pages should use fetchStrapiArticleBySlug to get full content including blocks.
  const articles = response.articles.map((article) => {
    // Calculate reading time from blocks before removing them
    let readingTimeMinutes = 1;
    if (article.blocks && article.blocks.length > 0) {
      const bodyContent = article.blocks
        .map((block) => block.body || '')
        .filter(Boolean)
        .join('\n\n');
      const wordCount = bodyContent
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#*_~`]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blocks, ...rest } = article;
    return { ...rest, readingTimeMinutes } as StrapiArticle;
  });

  if (CACHE_ENABLED) {
    cache.set(ARTICLES_CACHE_KEY, articles, ARTICLES_CACHE_TTL);
  }

  return articles;
}

/**
 * Fetch single article by slug
 * Caches each article separately by slug
 * @param slug - Article slug
 * @returns The article or null if not found
 */
export async function fetchStrapiArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;

  if (CACHE_ENABLED && cache.has(cacheKey)) {
    const cached = cache.get<StrapiArticle>(cacheKey);
    if (cached && isValidStrapiArticle(cached)) {
      return cached;
    }
    if (cached) {
      console.warn(
        `Invalid cached Strapi article data detected for slug "${slug}", fetching fresh data from API`
      );
    }
  }

  const response = await graphqlQuery<StrapiArticlesResponse>(ARTICLE_BY_SLUG_QUERY, { slug });
  if (!response?.articles || response.articles.length === 0) {
    return null;
  }

  const article = response.articles[0];

  if (CACHE_ENABLED) {
    cache.set(cacheKey, article, ARTICLES_CACHE_TTL);
  }

  return article;
}
