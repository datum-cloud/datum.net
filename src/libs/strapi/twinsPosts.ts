// src/libs/strapi/twinsPosts.ts
/**
 * Strapi `twins-post` module — the "Twins in the Loop" posts shown on /about.
 *
 * Same cache/fallback shape as `articles.ts`: the newest posts are cached under
 * one key (tagged `twins-posts`) and a Strapi outage serves the stale fallback
 * copy instead of an empty list.
 *
 * Cache key:
 *   `strapi-twins-posts` — newest posts, newest first (tagged `twins-posts`)
 */

import { cache, client } from './_runtime';
import type { StrapiTwinsPost, StrapiTwinsPostsResponse } from '../../types/strapi';

export const TWINS_POSTS_CACHE_KEY = 'strapi-twins-posts';

/** How many posts the cached list keeps; the /about section renders at most this many. */
export const TWINS_POSTS_LIMIT = 3;

/** GraphQL query: newest published twins posts. */
export const TWINS_POSTS_QUERY = `
  query GetTwinsPosts($limit: Int!) {
    twinsPosts(sort: ["published:desc"], pagination: { start: 0, limit: $limit }) {
      documentId
      title
      slug
      description
      author
      type
      published
      canonical
      embedUrl
      cover {
        url
        alternativeText
        width
        height
      }
    }
  }
`;

function isValidTwinsPost(obj: unknown): obj is StrapiTwinsPost {
  if (!obj || typeof obj !== 'object') return false;
  const post = obj as Record<string, unknown>;
  return (
    typeof post.documentId === 'string' &&
    typeof post.title === 'string' &&
    typeof post.slug === 'string' &&
    typeof post.published === 'string'
  );
}

function isValidCachedTwinsPosts(data: unknown): data is StrapiTwinsPost[] {
  return Array.isArray(data) && data.every(isValidTwinsPost);
}

/**
 * Newest twins posts (at most `TWINS_POSTS_LIMIT`). Reads cache first; on
 * Strapi failure serves the persistent fallback cache, else an empty list so
 * the section can hide itself.
 */
export async function fetchStrapiTwinsPosts(): Promise<StrapiTwinsPost[]> {
  const cached = await cache.get<StrapiTwinsPost[]>(TWINS_POSTS_CACHE_KEY);
  if (cached && isValidCachedTwinsPosts(cached)) return cached;
  if (cached) {
    console.warn('Invalid cached Strapi twins posts detected, fetching fresh data from API');
  }

  const response = await client.query<StrapiTwinsPostsResponse>(TWINS_POSTS_QUERY, {
    limit: TWINS_POSTS_LIMIT,
  });
  const posts = response?.twinsPosts;

  if (!posts) {
    console.warn('Strapi unavailable — checking persistent fallback cache for twins posts');
    const fallback = await cache.getFallback<StrapiTwinsPost[]>(TWINS_POSTS_CACHE_KEY);
    if (fallback && isValidCachedTwinsPosts(fallback)) return fallback;
    return [];
  }

  const valid = posts.filter(isValidTwinsPost);
  // An empty Strapi answer is authoritative ("nothing published"), so cache it
  // like any other list rather than re-querying on every render.
  await cache.set(TWINS_POSTS_CACHE_KEY, valid, { tags: ['twins-posts'] });
  return valid;
}
