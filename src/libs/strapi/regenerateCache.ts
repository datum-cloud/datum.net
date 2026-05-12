// src/libs/strapi/regenerateCache.ts
/**
 * Regenerate Strapi cache entries only when the cache file does not exist.
 * Uses the same cache keys and fetch methods as articles, authors, and roadmaps.
 */

import path from 'node:path';
import { Cache } from '@libs/cache';
import { fetchStrapiArticles, fetchStrapiArticleBySlug } from './articles';
import {
  fetchStrapiAuthors,
  fetchStrapiAuthorBySlug,
  getStrapiTeamMembers,
  getStrapiCardMembers,
} from './authors';
import { fetchStrapiRoadmaps } from './roadmaps';
import type { StrapiArticle } from '../../types/strapi';

const CACHE_DIR = path.resolve(process.cwd(), '.cache');
const cache = new Cache(CACHE_DIR);

const ARTICLES_CACHE_KEY = 'strapi-articles';
export const ARTICLE_CACHE_PREFIX = 'strapi-article-';
const AUTHORS_CACHE_KEY = 'strapi-authors';
const AUTHOR_SLUG_CACHE_PREFIX = 'strapi-author-slug-';
const TEAM_MEMBERS_CACHE_KEY = 'strapi-team-members';
const CARD_MEMBERS_CACHE_KEY = 'strapi-card-members';
const ROADMAPS_CACHE_KEY = 'strapi-roadmaps';

/** Allowed exact Strapi cache key names for force regeneration (excluding per-article keys). */
export const STRAPI_FORCE_REGENERATE_KEYS = [
  ARTICLES_CACHE_KEY,
  AUTHORS_CACHE_KEY,
  TEAM_MEMBERS_CACHE_KEY,
  CARD_MEMBERS_CACHE_KEY,
] as const;

const FIXED_FORCE_KEYS = new Set<string>(STRAPI_FORCE_REGENERATE_KEYS);

function isArticleCacheKey(name: string): boolean {
  if (!name.startsWith(ARTICLE_CACHE_PREFIX)) {
    return false;
  }
  const slug = name.slice(ARTICLE_CACHE_PREFIX.length).trim();
  if (!slug || slug.includes('/') || slug.includes('\\')) {
    return false;
  }
  if (slug === '.' || slug === '..') {
    return false;
  }
  return true;
}

/**
 * @param name - Full cache key (e.g. strapi-articles or strapi-article-my-post)
 * @returns Error message when invalid, otherwise null
 */
export function validateStrapiForceRegenerateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Empty cache name';
  }
  if (FIXED_FORCE_KEYS.has(trimmed)) {
    return null;
  }
  if (isArticleCacheKey(trimmed)) {
    return null;
  }
  return `Unknown cache name "${trimmed}". Expected one of ${[...FIXED_FORCE_KEYS].join(', ')} or ${ARTICLE_CACHE_PREFIX}{slug}`;
}

/**
 * @param names - Requested cache keys (duplicates trimmed)
 * @returns Human-readable validation errors per invalid entry (empty when all valid)
 */
export function validateStrapiForceRegenerateRequest(names: readonly string[]): string[] {
  const unique = [...new Set(names.map((n) => n.trim()).filter((n) => n.length > 0))];
  if (unique.length === 0) {
    return ['At least one cache name is required'];
  }

  const errors: string[] = [];
  for (const name of unique) {
    const message = validateStrapiForceRegenerateName(name);
    if (message) {
      errors.push(`${name}: ${message}`);
    }
  }
  return errors;
}

/**
 * Clears the given Strapi cache keys and repopulates from the API where possible.
 * @param names - Validated cache key names only
 */
export async function forceRegenerateStrapiCache(
  names: readonly string[]
): Promise<RegenerateResult> {
  const regenerated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  const unique = [...new Set(names.map((n) => n.trim()).filter((n) => n.length > 0))];

  for (const name of unique) {
    await cache.clear(name);

    try {
      switch (name) {
        case ARTICLES_CACHE_KEY:
          await fetchStrapiArticles();
          regenerated.push(name);
          break;
        case AUTHORS_CACHE_KEY:
          await fetchStrapiAuthors();
          regenerated.push(name);
          break;
        case TEAM_MEMBERS_CACHE_KEY:
          await getStrapiTeamMembers();
          regenerated.push(name);
          break;
        case CARD_MEMBERS_CACHE_KEY:
          await getStrapiCardMembers();
          regenerated.push(name);
          break;
        default: {
          if (isArticleCacheKey(name)) {
            const slug = name.slice(ARTICLE_CACHE_PREFIX.length).trim();
            const article = await fetchStrapiArticleBySlug(slug);
            if (!article) {
              errors.push(`${name}: Article not found or Strapi unavailable`);
            } else {
              regenerated.push(name);
            }
          } else {
            errors.push(`${name}: Unhandled cache name`);
          }
        }
      }
    } catch (err) {
      errors.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { regenerated, skipped, errors };
}

export interface RegenerateResult {
  regenerated: string[];
  skipped: string[];
  errors: string[];
}

/**
 * Regenerate all strapi-* cache entries that do not yet exist.
 * Only populates cache when the JSON file is missing.
 * @returns Summary of regenerated keys, skipped keys, and any errors
 */
export async function regenerateStrapiCacheIfMissing(): Promise<RegenerateResult> {
  const regenerated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  // 1. strapi-articles
  if (!(await cache.has(ARTICLES_CACHE_KEY))) {
    try {
      await fetchStrapiArticles();
      regenerated.push(ARTICLES_CACHE_KEY);
    } catch (err) {
      errors.push(`${ARTICLES_CACHE_KEY}: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    skipped.push(ARTICLES_CACHE_KEY);
  }

  // 2. strapi-authors
  if (!(await cache.has(AUTHORS_CACHE_KEY))) {
    try {
      await fetchStrapiAuthors();
      regenerated.push(AUTHORS_CACHE_KEY);
    } catch (err) {
      errors.push(`${AUTHORS_CACHE_KEY}: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    skipped.push(AUTHORS_CACHE_KEY);
  }

  // 3. strapi-roadmaps
  if (!(await cache.has(ROADMAPS_CACHE_KEY))) {
    try {
      await fetchStrapiRoadmaps();
      regenerated.push(ROADMAPS_CACHE_KEY);
    } catch (err) {
      errors.push(`${ROADMAPS_CACHE_KEY}: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    skipped.push(ROADMAPS_CACHE_KEY);
  }

  // 4. strapi-team-members (depends on authors)
  if (!(await cache.has(TEAM_MEMBERS_CACHE_KEY))) {
    try {
      await getStrapiTeamMembers();
      regenerated.push(TEAM_MEMBERS_CACHE_KEY);
    } catch (err) {
      errors.push(`${TEAM_MEMBERS_CACHE_KEY}: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    skipped.push(TEAM_MEMBERS_CACHE_KEY);
  }

  // 5. Per-article cache (strapi-article-{slug})
  const articles: StrapiArticle[] = await fetchStrapiArticles();
  const authorIdsWithArticles = new Set(
    articles.map((a) => a.author?.documentId).filter((id): id is string => Boolean(id))
  );

  for (const article of articles) {
    const key = `${ARTICLE_CACHE_PREFIX}${article.slug}`;
    if (!(await cache.has(key))) {
      try {
        await fetchStrapiArticleBySlug(article.slug);
        regenerated.push(key);
      } catch (err) {
        errors.push(`${key}: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      skipped.push(key);
    }
  }

  // 6. Per-author cache (strapi-author-slug-{slug}) — documentId lookup uses strapi-authors list
  // Only for authors that have at least one article
  const authors = await fetchStrapiAuthors();
  for (const author of authors) {
    if (!authorIdsWithArticles.has(author.documentId) || !author.slug) {
      continue;
    }

    const slugKey = `${AUTHOR_SLUG_CACHE_PREFIX}${author.slug}`;
    if (!(await cache.has(slugKey))) {
      try {
        await fetchStrapiAuthorBySlug(author.slug);
        regenerated.push(slugKey);
      } catch (err) {
        errors.push(`${slugKey}: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      skipped.push(slugKey);
    }
  }

  return { regenerated, skipped, errors };
}
