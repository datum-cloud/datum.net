// src/libs/strapi/regenerateCache.ts
/**
 * Regenerate Strapi cache entries on demand.
 *
 * Two modes serve the `/api/cache/strapi` admin endpoint:
 *   - `regenerateStrapiCacheIfMissing()` — fills only the entries whose primary
 *     cache file is absent (or expired). Used as the safe default.
 *   - `forceRegenerateStrapiCache(names)` — explicitly clears the listed entries
 *     and refetches every one, regardless of current state.
 *
 * Cache reads/writes go through the shared `cache` manager from `_runtime.ts`
 * so tag membership and the fallback mirror stay consistent with the rest of
 * the Strapi module.
 */

import { cache } from './_runtime';
import { fetchStrapiArticles, fetchStrapiArticleBySlug } from './articles';
import {
  fetchStrapiAuthors,
  fetchStrapiAuthorBySlug,
  getStrapiTeamMembers,
  getStrapiCardMembers,
} from './authors';
import {
  GITHUB_BACKLOG_CACHE_KEY,
  forceRegenerateGitHubBacklog,
  fetchGitHubBacklog,
  isGitHubBacklogCached,
} from '../githubBacklog';
import {
  fetchStrapiRoadmaps,
  clearRoadmapDetailCaches,
  ROADMAPS_CACHE_KEY,
  LEGACY_ROADMAPS_CACHE_KEY,
} from './roadmaps';
import type { StrapiArticle } from '../../types/strapi';

const ARTICLES_CACHE_KEY = 'strapi-articles';
export const ARTICLE_CACHE_PREFIX = 'strapi-article-';
const AUTHORS_CACHE_KEY = 'strapi-authors';
const AUTHOR_SLUG_CACHE_PREFIX = 'strapi-author-slug-';
const TEAM_MEMBERS_CACHE_KEY = 'strapi-team-members';
const CARD_MEMBERS_CACHE_KEY = 'strapi-card-members';
/** Allowed exact Strapi cache key names for force regeneration (excluding per-article keys). */
export const STRAPI_FORCE_REGENERATE_KEYS = [
  ARTICLES_CACHE_KEY,
  AUTHORS_CACHE_KEY,
  TEAM_MEMBERS_CACHE_KEY,
  CARD_MEMBERS_CACHE_KEY,
  ROADMAPS_CACHE_KEY,
  GITHUB_BACKLOG_CACHE_KEY,
] as const;

const FIXED_FORCE_KEYS = new Set<string>(STRAPI_FORCE_REGENERATE_KEYS);

function normalizeForceRegenerateName(name: string): string {
  return name === LEGACY_ROADMAPS_CACHE_KEY ? ROADMAPS_CACHE_KEY : name;
}

async function clearRoadmapsCache(): Promise<string[]> {
  const clearedDetails = await clearRoadmapDetailCaches();
  await cache.delete(ROADMAPS_CACHE_KEY);
  await cache.delete(LEGACY_ROADMAPS_CACHE_KEY);
  return clearedDetails;
}

function isSafeSlugSegment(slug: string): boolean {
  if (!slug || slug.includes('/') || slug.includes('\\')) return false;
  if (slug === '.' || slug === '..') return false;
  return true;
}

function isArticleCacheKey(name: string): boolean {
  if (!name.startsWith(ARTICLE_CACHE_PREFIX)) return false;
  return isSafeSlugSegment(name.slice(ARTICLE_CACHE_PREFIX.length).trim());
}

function isAuthorSlugCacheKey(name: string): boolean {
  if (!name.startsWith(AUTHOR_SLUG_CACHE_PREFIX)) return false;
  return isSafeSlugSegment(name.slice(AUTHOR_SLUG_CACHE_PREFIX.length).trim());
}

/** Primary cache hit check — returns true when the key has a valid, non-expired entry. */
async function isCached(key: string): Promise<boolean> {
  return (await cache.get<unknown>(key)) !== null;
}

/**
 * @param name - Full cache key (e.g. strapi-articles, strapi-article-my-post, strapi-author-slug-jane)
 * @returns Error message when invalid, otherwise null
 */
export function validateStrapiForceRegenerateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Empty cache name';
  if (FIXED_FORCE_KEYS.has(trimmed) || trimmed === LEGACY_ROADMAPS_CACHE_KEY) return null;
  if (isArticleCacheKey(trimmed)) return null;
  if (isAuthorSlugCacheKey(trimmed)) return null;
  return `Unknown cache name "${trimmed}". Expected one of ${[...FIXED_FORCE_KEYS].join(
    ', '
  )}, ${ARTICLE_CACHE_PREFIX}{slug}, or ${AUTHOR_SLUG_CACHE_PREFIX}{slug}`;
}

/**
 * @param names - Requested cache keys (duplicates trimmed)
 * @returns Human-readable validation errors per invalid entry (empty when all valid)
 */
export function validateStrapiForceRegenerateRequest(names: readonly string[]): string[] {
  const unique = [...new Set(names.map((n) => n.trim()).filter((n) => n.length > 0))];
  if (unique.length === 0) return ['At least one cache name is required'];

  const errors: string[] = [];
  for (const name of unique) {
    const message = validateStrapiForceRegenerateName(name);
    if (message) errors.push(`${name}: ${message}`);
  }
  return errors;
}

export interface RegenerateResult {
  regenerated: string[];
  skipped: string[];
  errors: string[];
  /** Per-slug roadmap keys cleared during list force-regen (`strapi-roadmap-*`). */
  clearedDetails: string[];
}

/**
 * Clear the given Strapi cache keys and repopulate them from the API.
 * @param names - Already-validated cache key names (caller should run
 *   `validateStrapiForceRegenerateRequest` first).
 */
export async function forceRegenerateStrapiCache(
  names: readonly string[]
): Promise<RegenerateResult> {
  const regenerated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  const clearedDetails: string[] = [];

  const unique = [
    ...new Set(
      names.map((n) => normalizeForceRegenerateName(n.trim())).filter((n) => n.length > 0)
    ),
  ];

  for (const name of unique) {
    if (name !== ROADMAPS_CACHE_KEY && name !== GITHUB_BACKLOG_CACHE_KEY) {
      await cache.delete(name);
    }

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
        case ROADMAPS_CACHE_KEY: {
          const cleared = await clearRoadmapsCache();
          clearedDetails.push(...cleared);
          await fetchStrapiRoadmaps();
          regenerated.push(name);
          break;
        }
        case GITHUB_BACKLOG_CACHE_KEY:
          await forceRegenerateGitHubBacklog();
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
          } else if (isAuthorSlugCacheKey(name)) {
            const slug = name.slice(AUTHOR_SLUG_CACHE_PREFIX.length).trim();
            const author = await fetchStrapiAuthorBySlug(slug);
            if (!author) {
              errors.push(`${name}: Author not found or Strapi unavailable`);
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

  return { regenerated, skipped, errors, clearedDetails };
}

/**
 * Regenerate every well-known Strapi cache entry that is currently missing.
 * Populated entries are reported as skipped — useful as a post-deploy warm-up
 * that won't thrash Strapi when the cache is already hot.
 */
export async function regenerateStrapiCacheIfMissing(): Promise<RegenerateResult> {
  const regenerated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  const tryWarm = async (key: string, warm: () => Promise<unknown>): Promise<void> => {
    if (await isCached(key)) {
      skipped.push(key);
      return;
    }
    try {
      await warm();
      regenerated.push(key);
    } catch (err) {
      errors.push(`${key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  await tryWarm(ARTICLES_CACHE_KEY, fetchStrapiArticles);
  await tryWarm(AUTHORS_CACHE_KEY, fetchStrapiAuthors);
  await tryWarm(ROADMAPS_CACHE_KEY, fetchStrapiRoadmaps);
  await tryWarm(TEAM_MEMBERS_CACHE_KEY, getStrapiTeamMembers);
  await tryWarm(CARD_MEMBERS_CACHE_KEY, getStrapiCardMembers);

  if (await isGitHubBacklogCached()) {
    skipped.push(GITHUB_BACKLOG_CACHE_KEY);
  } else {
    try {
      await fetchGitHubBacklog();
      regenerated.push(GITHUB_BACKLOG_CACHE_KEY);
    } catch (err) {
      errors.push(
        `${GITHUB_BACKLOG_CACHE_KEY}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Per-article cache (depends on the article list)
  const articles: StrapiArticle[] = await fetchStrapiArticles();
  const authorIdsWithArticles = new Set(
    articles.map((a) => a.author?.documentId).filter((id): id is string => Boolean(id))
  );

  for (const article of articles) {
    const key = `${ARTICLE_CACHE_PREFIX}${article.slug}`;
    await tryWarm(key, () => fetchStrapiArticleBySlug(article.slug));
  }

  // Per-author cache, restricted to authors who have at least one article
  const authors = await fetchStrapiAuthors();
  for (const author of authors) {
    if (!authorIdsWithArticles.has(author.documentId) || !author.slug) continue;
    const slugKey = `${AUTHOR_SLUG_CACHE_PREFIX}${author.slug}`;
    await tryWarm(slugKey, () => fetchStrapiAuthorBySlug(author.slug as string));
  }

  return { regenerated, skipped, errors, clearedDetails: [] };
}
