// src/libs/strapi/regenerateCache.ts
/**
 * Regenerate Strapi cache entries only when the cache file does not exist.
 * Uses the same cache keys and fetch methods as articles, authors, and roadmaps.
 */

import path from 'node:path';
import { Cache } from '@libs/cache';
import { fetchStrapiArticles, fetchStrapiArticleBySlug } from './articles';
import { fetchStrapiAuthors, fetchStrapiAuthorBySlug, getStrapiTeamMembers } from './authors';
import { fetchStrapiRoadmaps } from './roadmaps';
import type { StrapiArticle } from '../../types/strapi';

const CACHE_DIR = path.resolve(process.cwd(), '.cache');
const cache = new Cache(CACHE_DIR);

const ARTICLES_CACHE_KEY = 'strapi-articles';
const ARTICLE_CACHE_PREFIX = 'strapi-article-';
const AUTHORS_CACHE_KEY = 'strapi-authors';
const AUTHOR_SLUG_CACHE_PREFIX = 'strapi-author-slug-';
const TEAM_MEMBERS_CACHE_KEY = 'strapi-team-members';
const ROADMAPS_CACHE_KEY = 'strapi-roadmaps';

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
  if (!cache.has(ARTICLES_CACHE_KEY)) {
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
  if (!cache.has(AUTHORS_CACHE_KEY)) {
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
  if (!cache.has(ROADMAPS_CACHE_KEY)) {
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
  if (!cache.has(TEAM_MEMBERS_CACHE_KEY)) {
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
    if (!cache.has(key)) {
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
    if (!cache.has(slugKey)) {
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
