// src/libs/strapi/articles.ts
/**
 * Strapi Articles module with caching support
 */

import { Cache } from '@libs/cache';
import { getReadingTimeMinutesFromContent } from '@libs/string';
import type { StrapiArticlesResponse, StrapiArticle } from '../../types/strapi';

const STRAPI_URL =
  import.meta.env?.STRAPI_URL ||
  process.env.STRAPI_URL ||
  'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = import.meta.env?.STRAPI_TOKEN || process.env.STRAPI_TOKEN || '';
const cacheEnabledRaw = import.meta.env?.STRAPI_CACHE_ENABLED || process.env.STRAPI_CACHE_ENABLED;
const CACHE_ENABLED = cacheEnabledRaw === 'true' || cacheEnabledRaw === '1';

const DEFAULT_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const envTtlSec = parseInt(
  import.meta.env?.STRAPI_CACHE_TTL ?? process.env.STRAPI_CACHE_TTL ?? '2592000',
  10
);
const ARTICLES_CACHE_TTL =
  Number.isNaN(envTtlSec) || envTtlSec <= 0 ? DEFAULT_CACHE_TTL_MS : envTtlSec * 1000;

// Request timeout — fail fast so the fallback cache can kick in
const envTimeoutSec = parseInt(
  import.meta.env?.STRAPI_TIMEOUT ?? process.env.STRAPI_TIMEOUT ?? '3',
  10
);
const FETCH_TIMEOUT_MS =
  Number.isNaN(envTimeoutSec) || envTimeoutSec <= 0 ? 3_000 : envTimeoutSec * 1000;

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Strapi request timed out after ${FETCH_TIMEOUT_MS}ms`);
    } else {
      console.error('Error fetching from Strapi:', error);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Short-lived TTL cache (respects STRAPI_CACHE_ENABLED / STRAPI_CACHE_TTL)
const cache = new Cache('.cache');
const ARTICLES_CACHE_KEY = 'strapi-articles';
const ARTICLE_CACHE_PREFIX = 'strapi-article-';

// Persistent fallback cache — always written on success, never expires.
// Serves stale data when Strapi is unreachable.
const fallbackCache = new Cache('.cache/strapi-fallback');
const FALLBACK_ARTICLES_KEY = 'articles';
const FALLBACK_ARTICLE_PREFIX = 'article-';

/**
 * GraphQL query to fetch all articles (Strapi v5 format, with high limit)
 */
export const ARTICLES_QUERY = `
  query GetArticles {
    articles(pagination: { limit: 100 }, sort: ["originalPublishedAt:desc"]) {
      documentId
      title
      slug
      description
      originalPublishedAt
      blocks {
        __typename
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
        isTeam
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
        isTeam
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
        isTeam
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
 * Fetch all articles from Strapi with caching (for listing & navigation).
 * Falls back to a persistent stale cache when Strapi is unreachable.
 * @returns Array of all Strapi articles
 */
export async function fetchStrapiArticles(): Promise<StrapiArticle[]> {
  // Check short-lived TTL cache first (when enabled)
  if (CACHE_ENABLED && (await cache.has(ARTICLES_CACHE_KEY))) {
    const cached = await cache.get<StrapiArticle[]>(ARTICLES_CACHE_KEY);
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
    console.warn('Strapi unavailable — checking persistent fallback cache for articles');
    const fallback = await fallbackCache.get<StrapiArticle[]>(FALLBACK_ARTICLES_KEY);
    if (fallback && isValidCachedArticles(fallback)) {
      console.warn(`Serving ${fallback.length} articles from stale fallback cache`);
      return fallback;
    }
    console.warn('No articles returned from Strapi API and no fallback cache available');
    return [];
  }

  // For list cache we drop rich-text blocks to keep cache small, but preserve reading time.
  // Detail pages should use fetchStrapiArticleBySlug to get full content including blocks.
  // Only the top 3 newest articles keep full cover metadata for featured cards.
  // Articles are sorted by newest first via GraphQL sort parameter.
  const topCoverIds = new Set(response.articles.slice(0, 3).map((a) => a.documentId));

  const articles = response.articles.map((article) => {
    // Calculate reading time from blocks before removing them
    const bodyContent = (article.blocks || [])
      .map((block) => block.body || '')
      .filter(Boolean)
      .join('\n\n');
    const readingTimeMinutes = getReadingTimeMinutesFromContent(bodyContent);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blocks, cover, ...rest } = article;

    const base: StrapiArticle = {
      ...rest,
      readingTimeMinutes,
    };

    // Preserve cover metadata only for the top 3 newest articles (small + medium only to reduce cache size)
    if (topCoverIds.has(article.documentId) && cover) {
      base.cover = {
        url: cover.url,
        alternativeText: cover.alternativeText,
        width: cover.width,
        height: cover.height,
        formats: {
          small: cover.formats?.small,
          medium: cover.formats?.medium,
        },
      };
    }

    return base;
  });

  if (CACHE_ENABLED) {
    await cache.set(ARTICLES_CACHE_KEY, articles, ARTICLES_CACHE_TTL);
  }

  // Always persist a fallback snapshot — no TTL so it survives Strapi outages
  await fallbackCache.set(FALLBACK_ARTICLES_KEY, articles);

  return articles;
}

/**
 * Fetch single article by slug.
 * Caches each article separately by slug.
 * Falls back to a persistent stale cache when Strapi is unreachable.
 * @param slug - Article slug
 * @returns The article or null if not found
 */
export async function fetchStrapiArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;

  if (CACHE_ENABLED && (await cache.has(cacheKey))) {
    const cached = await cache.get<StrapiArticle>(cacheKey);
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
    console.warn(`Strapi unavailable — checking persistent fallback cache for article "${slug}"`);
    const fallbackKey = `${FALLBACK_ARTICLE_PREFIX}${slug}`;
    const fallback = await fallbackCache.get<StrapiArticle>(fallbackKey);
    if (fallback && isValidStrapiArticle(fallback)) {
      console.warn(`Serving article "${slug}" from stale fallback cache`);
      return fallback;
    }
    return null;
  }

  const article = response.articles[0];

  // Calculate reading time from blocks if not already present
  if (!article.readingTimeMinutes && article.blocks) {
    const bodyContent = article.blocks
      .map((block) => block.body || '')
      .filter(Boolean)
      .join('\n\n');
    article.readingTimeMinutes = getReadingTimeMinutesFromContent(bodyContent);
  }

  if (CACHE_ENABLED) {
    await cache.set(cacheKey, article, ARTICLES_CACHE_TTL);
  }

  // Always persist a fallback snapshot — no TTL so it survives Strapi outages
  const fallbackKey = `${FALLBACK_ARTICLE_PREFIX}${slug}`;
  await fallbackCache.set(fallbackKey, article);

  return article;
}
