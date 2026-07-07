// src/libs/strapi/articles.ts
/**
 * Strapi Articles module.
 *
 * GraphQL + cache duties live in `_runtime.ts` (via `@datum-cloud/strapi-revalidate`);
 * this file owns the datum-specific list transform: dropping rich-text blocks,
 * preserving cover formats only for the top-3 newest articles, and computing
 * reading time before caching.
 *
 * Cache keys are unchanged from the pre-package layout:
 *   `strapi-articles`           — full list (tagged `articles`)
 *   `strapi-article-<slug>`     — single article (tagged `article:<slug>` only)
 */

import { getReadingTimeMinutesFromContent } from '@libs/string';
import { cache, client } from './_runtime';
import { fetchAllGraphQLPages } from './graphqlPagination';
import type { StrapiArticlesResponse, StrapiArticle } from '../../types/strapi';

const ARTICLES_CACHE_KEY = 'strapi-articles';
const ARTICLE_CACHE_PREFIX = 'strapi-article-';
// Pre-migration fallback keys. The package's CacheManager mirrors fallback under
// the same key as primary, so new writes land at `strapi-articles` / `strapi-article-*`.
// Read these legacy keys as a backstop so deploys don't lose access to existing
// stale data if Strapi happens to be unreachable during the cutover.
const LEGACY_FALLBACK_LIST_KEY = 'articles';
const LEGACY_FALLBACK_DETAIL_PREFIX = 'article-';

/** GraphQL query: every published article, newest first. */
export const ARTICLES_QUERY = `
  query GetArticles($start: Int!, $limit: Int!) {
    articles(pagination: { start: $start, limit: $limit }, sort: ["originalPublishedAt:desc"]) {
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

/** GraphQL query: article slug + publish date for sitemap generation. */
export const ARTICLE_SITEMAP_QUERY = `
  query GetArticleSlugs($start: Int!, $limit: Int!) {
    articles(pagination: { start: $start, limit: $limit }, sort: ["originalPublishedAt:desc"]) {
      slug
      originalPublishedAt
    }
  }
`;

export interface StrapiArticleSitemapRow {
  slug: string;
  originalPublishedAt?: string;
}

/** GraphQL query: a single article by slug, including SEO and quote blocks. */
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

/** GraphQL query: articles filtered by category slug. Used by category pages. */
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

function isValidStrapiArticle(obj: unknown): obj is StrapiArticle {
  if (!obj || typeof obj !== 'object') return false;
  const article = obj as Record<string, unknown>;
  return typeof article.documentId === 'string' && typeof article.slug === 'string';
}

function isValidCachedArticles(data: unknown): data is StrapiArticle[] {
  return Array.isArray(data) && data.every(isValidStrapiArticle);
}

/**
 * Strip rich-text blocks and preserve only top-3 cover metadata to keep the
 * list-cache small. Reading time is computed from blocks before they're dropped.
 * Articles are assumed sorted newest-first by the GraphQL query.
 */
function transformArticleList(articles: StrapiArticle[]): StrapiArticle[] {
  const topCoverIds = new Set(articles.slice(0, 3).map((a) => a.documentId));

  return articles.map((article) => {
    const bodyContent = (article.blocks || [])
      .map((block) => block.body || '')
      .filter(Boolean)
      .join('\n\n');
    const readingTimeMinutes = getReadingTimeMinutesFromContent(bodyContent);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blocks, cover, ...rest } = article;

    const base: StrapiArticle = { ...rest, readingTimeMinutes };

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
}

/**
 * Fetch every article from Strapi. Reads cache first; on Strapi failure serves
 * stale data from the persistent fallback cache instead of returning empty.
 */
export async function fetchStrapiArticles(): Promise<StrapiArticle[]> {
  const cached = await cache.get<StrapiArticle[]>(ARTICLES_CACHE_KEY);
  if (cached && isValidCachedArticles(cached)) return cached;
  if (cached) {
    console.warn('Invalid cached Strapi articles data detected, fetching fresh data from API');
  }

  const articlesRaw = await fetchAllGraphQLPages(async (start, limit) => {
    const response = await client.query<StrapiArticlesResponse>(ARTICLES_QUERY, { start, limit });
    return response?.articles ?? null;
  });

  if (!articlesRaw) {
    console.warn('Strapi unavailable — checking persistent fallback cache for articles');
    const fallback =
      (await cache.getFallback<StrapiArticle[]>(ARTICLES_CACHE_KEY)) ??
      (await cache.getFallback<StrapiArticle[]>(LEGACY_FALLBACK_LIST_KEY));
    if (fallback && isValidCachedArticles(fallback)) {
      console.warn(`Serving ${fallback.length} articles from stale fallback cache`);
      return fallback;
    }
    return [];
  }

  const articles = transformArticleList(articlesRaw);
  await cache.set(ARTICLES_CACHE_KEY, articles, { tags: ['articles'] });
  return articles;
}

/**
 * Articles in a category, derived from the cached full list so Strapi outages
 * serve stale data and webhook invalidation stays aligned with the `articles` tag.
 */
/** Every published article slug + date for sitemap builders. */
export async function fetchStrapiArticleSitemapRows(): Promise<StrapiArticleSitemapRow[]> {
  const rows = await fetchAllGraphQLPages(async (start, limit) => {
    const response = await client.query<{ articles: StrapiArticleSitemapRow[] }>(
      ARTICLE_SITEMAP_QUERY,
      { start, limit }
    );
    return response?.articles ?? null;
  });

  if (rows) return rows;

  const articles = await fetchStrapiArticles();
  return articles.map((article) => ({
    slug: article.slug,
    originalPublishedAt: article.originalPublishedAt,
  }));
}

export async function fetchStrapiArticlesByCategory(
  categorySlug: string
): Promise<StrapiArticle[]> {
  const articles = await fetchStrapiArticles();
  return articles.filter((article) => article.category?.slug === categorySlug);
}

function withReadingTime(article: StrapiArticle): StrapiArticle {
  if (article.readingTimeMinutes || !article.blocks) return article;
  const bodyContent = article.blocks
    .map((block) => block.body || '')
    .filter(Boolean)
    .join('\n\n');
  article.readingTimeMinutes = getReadingTimeMinutesFromContent(bodyContent);
  return article;
}

async function readArticleDetailFallback(slug: string): Promise<StrapiArticle | null> {
  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;
  const fallback =
    (await cache.getFallback<StrapiArticle>(cacheKey)) ??
    (await cache.getFallback<StrapiArticle>(`${LEGACY_FALLBACK_DETAIL_PREFIX}${slug}`));
  return fallback && isValidStrapiArticle(fallback) ? fallback : null;
}

/** Fetch full article detail from Strapi and persist to the per-slug cache file. */
async function pullArticleDetailFromApi(slug: string): Promise<StrapiArticle | null> {
  const response = await client.query<StrapiArticlesResponse>(ARTICLE_BY_SLUG_QUERY, { slug });
  if (!response?.articles?.length) return null;

  const article = withReadingTime(response.articles[0]);
  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;
  await cache.set(cacheKey, article, { tags: [`article:${slug}`] });
  return article;
}

/**
 * Fetch a single article by slug. Cached per slug; falls back to stale data
 * when Strapi is unreachable. Reading time is computed lazily so cache misses
 * don't grow over time.
 */
export async function fetchStrapiArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;

  const cached = await cache.get<StrapiArticle>(cacheKey);
  if (cached && isValidStrapiArticle(cached)) return cached;
  if (cached) {
    console.warn(
      `Invalid cached Strapi article data detected for slug "${slug}", fetching fresh data from API`
    );
  }

  const fromApi = await pullArticleDetailFromApi(slug);
  if (fromApi) return fromApi;

  console.warn(`Strapi unavailable — checking persistent fallback cache for article "${slug}"`);
  const fallback = await readArticleDetailFallback(slug);
  if (fallback) {
    console.warn(`Serving article "${slug}" from stale fallback cache`);
    return fallback;
  }
  return null;
}

/**
 * Load article detail for a published slug, creating `.cache/strapi-article-<slug>.json`
 * on a cache miss before giving up. Use for SSR blog routes instead of redirecting
 * to 404 when the list cache already contains the slug.
 */
export async function ensureStrapiArticleDetail(slug: string): Promise<StrapiArticle | null> {
  const article = await fetchStrapiArticleBySlug(slug);
  if (article) return article;

  const articles = await fetchStrapiArticles();
  if (!articles.some((entry) => entry.slug === slug)) return null;

  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;
  await cache.delete(cacheKey);

  const fromApi = await pullArticleDetailFromApi(slug);
  if (fromApi) return fromApi;

  const fallback = await readArticleDetailFallback(slug);
  if (fallback) return fallback;

  console.error(
    `[strapi] Article "${slug}" is in the list cache but detail could not be loaded from Strapi`
  );
  return null;
}
