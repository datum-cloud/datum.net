// src/types/strapi.ts
/**
 * Type definitions for Strapi content types
 */

export interface StrapiImageFormat {
  url: string;
  width?: number;
  height?: number;
}

export interface StrapiImage {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface StrapiAuthor {
  documentId?: string;
  slug?: string;
  name: string;
  avatar?: StrapiImage;
}

export interface StrapiSocial {
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export interface StrapiAuthorFull {
  documentId: string;
  slug?: string;
  name: string;
  title?: string;
  bio?: string;
  isTeam?: boolean;
  team?: 'founders' | 'team';
  tick?: string;
  surprising?: string;
  weekends?: string;
  avatar?: StrapiImage;
  social?: StrapiSocial;
}

export interface StrapiAuthorsResponse {
  authors: StrapiAuthorFull[];
}

export interface StrapiCategory {
  name: string;
  slug: string;
}

export interface StrapiSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  shareImage?: { url?: string };
}

export interface StrapiBlock {
  __typename?: string;
  id?: string;
  body?: string;
  title?: string;
}

export interface StrapiArticle {
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  originalPublishedAt?: string;
  blocks?: StrapiBlock[];
  cover?: StrapiImage;
  author?: StrapiAuthor;
  category?: StrapiCategory;
  seo?: StrapiSeo;
  readingTimeMinutes?: number;
}

export interface StrapiArticlesResponse {
  articles: StrapiArticle[];
}

export interface StrapiArticleResponse {
  articles: StrapiArticle[];
}

/**
 * Normalized article type for components (matches local blog structure)
 */
export interface NormalizedStrapiArticle {
  id: string;
  slug: string;
  data: {
    title: string;
    description?: string;
    date: Date;
    thumbnail?: string;
    author?: string;
    readingTimeMinutes?: number;
  };
  body?: string;
}

const STRAPI_BASE_URL =
  typeof import.meta.env.STRAPI_URL === 'string' && import.meta.env.STRAPI_URL
    ? import.meta.env.STRAPI_URL.replace(/\/$/, '')
    : 'https://grateful-excitement-dfe9d47bad.strapiapp.com';

/**
 * Helper to get full image URL from Strapi
 */
export function getStrapiMediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // If URL is already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend Strapi URL
  return `${STRAPI_BASE_URL}${url}`;
}

/**
 * Resolve relative /uploads/ URLs in markdown to absolute Strapi URLs.
 * Transforms both links [text](/uploads/...) and images ![alt](/uploads/...) so
 * assets served by Strapi load correctly.
 */
export function resolveMarkdownStrapiUrls(markdown: string): string {
  if (!markdown) return markdown;
  // Replace ](/uploads/ with ](STRAPI_URL/uploads/ (covers both [link](url) and ![img](url))
  return markdown.replace(/\]\(\/uploads\//g, `](${STRAPI_BASE_URL}/uploads/`);
}

/**
 * Extract body content from blocks
 */
function extractBodyFromBlocks(blocks?: StrapiBlock[]): string {
  if (!blocks || blocks.length === 0) return '';
  return blocks
    .map((block) => block.body || '')
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Normalize Strapi article to match local blog structure
 */
export function normalizeArticle(article: StrapiArticle): NormalizedStrapiArticle {
  // Use originalPublishedAt, fallback to current date if not available
  const publishedDate = article.originalPublishedAt || new Date().toISOString();

  // Calculate reading time from blocks if available, otherwise use pre-calculated value
  let readingTimeMinutes = article.readingTimeMinutes;
  if (!readingTimeMinutes && article.blocks) {
    const bodyContent = extractBodyFromBlocks(article.blocks);
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

  return {
    id: article.slug,
    slug: article.slug,
    data: {
      title: article.title,
      description: article.description,
      date: new Date(publishedDate),
      thumbnail:
        getStrapiMediaUrl(article.cover?.formats?.large?.url) ||
        getStrapiMediaUrl(article.cover?.formats?.medium?.url) ||
        getStrapiMediaUrl(article.cover?.formats?.small?.url) ||
        getStrapiMediaUrl(article.cover?.formats?.thumbnail?.url) ||
        getStrapiMediaUrl(article.cover?.url),
      author: article.author?.name,
      readingTimeMinutes,
    },
    body: extractBodyFromBlocks(article.blocks),
  };
}
