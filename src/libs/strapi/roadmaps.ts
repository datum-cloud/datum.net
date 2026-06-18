// src/libs/strapi/roadmaps.ts
/**
 * Strapi Roadmaps module.
 *
 * GraphQL + cache duties live in `_runtime.ts` (via `@datum-cloud/strapi-revalidate`).
 * Cache key `strapi-roadmaps-v2` is tagged `roadmaps`; the webhook tag map in
 * `_runtime.ts` routes `api::roadmap.roadmap` events to this tag.
 *
 * Per-slug detail cache:
 *   `strapi-roadmap-<slug>` — single roadmap (tagged `roadmap:<slug>`)
 */

import { cache, client, deletePrimaryCacheByPrefix } from './_runtime';
import { fetchAllGraphQLPages } from './graphqlPagination';
import type { StrapiRoadmap, StrapiRoadmapsResponse, StrapiImage } from '../../types/strapi';
import { getStrapiMediaUrl } from '../../types/strapi';

/** Primary list cache key (v2 schema: slug + cover). */
export const ROADMAPS_CACHE_KEY = 'strapi-roadmaps-v2';
/** Pre-v2 key; still accepted by admin force-regen for backward compatibility. */
export const LEGACY_ROADMAPS_CACHE_KEY = 'strapi-roadmaps';
/** Per-slug detail cache prefix (`strapi-roadmap-{slug}`). */
export const ROADMAP_CACHE_PREFIX = 'strapi-roadmap-';
// Pre-migration fallback key; read as a backstop so deploys preserve access to
// existing stale data if Strapi happens to be unreachable during the cutover.
const LEGACY_FALLBACK_KEY = 'roadmaps';

export const ROADMAPS_QUERY = `
  query GetRoadmaps($start: Int!, $limit: Int!) {
    roadmaps(pagination: { start: $start, limit: $limit }, sort: "releaseDate:asc") {
      documentId
      title
      slug
      description
      summary
      releaseDate
      githubUrl
      cover {
        url
        alternativeText
        caption
        width
        height
        formats
      }
    }
  }
`;

function isValidStrapiRoadmap(obj: unknown): obj is StrapiRoadmap {
  if (!obj || typeof obj !== 'object') return false;
  const roadmap = obj as Record<string, unknown>;
  return typeof roadmap.documentId === 'string' && typeof roadmap.title === 'string';
}

function isValidCachedRoadmaps(data: unknown): data is StrapiRoadmap[] {
  return Array.isArray(data) && data.every(isValidStrapiRoadmap);
}

/**
 * Fetch all roadmap milestones from Strapi. Reads cache first; on Strapi
 * failure serves stale data from the persistent fallback cache.
 */
export async function fetchStrapiRoadmaps(): Promise<StrapiRoadmap[]> {
  const cached = await cache.get<StrapiRoadmap[]>(ROADMAPS_CACHE_KEY);
  if (cached && isValidCachedRoadmaps(cached)) return cached;
  if (cached) {
    console.warn('Invalid cached Strapi roadmaps data detected, fetching fresh data from API');
  }

  const roadmapsRaw = await fetchAllGraphQLPages(async (start, limit) => {
    const response = await client.query<StrapiRoadmapsResponse>(ROADMAPS_QUERY, { start, limit });
    return response?.roadmaps ?? null;
  });

  if (!roadmapsRaw) {
    console.warn('Strapi unavailable — checking persistent fallback cache for roadmaps');
    const fallback =
      (await cache.getFallback<StrapiRoadmap[]>(ROADMAPS_CACHE_KEY)) ??
      (await cache.getFallback<StrapiRoadmap[]>(LEGACY_FALLBACK_KEY));
    if (fallback && isValidCachedRoadmaps(fallback)) {
      console.warn(`Serving ${fallback.length} roadmaps from stale fallback cache`);
      return fallback;
    }
    return [];
  }

  await cache.set(ROADMAPS_CACHE_KEY, roadmapsRaw, { tags: ['roadmaps'] });
  return roadmapsRaw;
}

/**
 * Remove all primary per-slug roadmap detail caches (`strapi-roadmap-*`).
 * Used when the list cache is force-regenerated so detail pages don't serve stale entries.
 * @returns Deleted cache key names
 */
export async function clearRoadmapDetailCaches(): Promise<string[]> {
  return deletePrimaryCacheByPrefix(ROADMAP_CACHE_PREFIX);
}

/**
 * Fetch a single roadmap milestone by Strapi slug.
 * Reads the list cache first (avoids a second Strapi request on cache hit),
 * then falls back to a per-slug cache entry, then fetches fresh from Strapi.
 */
export async function fetchStrapiRoadmapBySlug(slug: string): Promise<StrapiRoadmap | null> {
  const cacheKey = `${ROADMAP_CACHE_PREFIX}${slug}`;

  const cached = await cache.get<StrapiRoadmap>(cacheKey);
  if (cached && isValidStrapiRoadmap(cached)) return cached;

  // Derive from the list cache to avoid redundant Strapi queries.
  const list = await fetchStrapiRoadmaps();
  const match = list.find((r) => getRoadmapSlug(r) === slug);

  if (match) {
    await cache.set(cacheKey, match, { tags: [`roadmap:${slug}`] });
    return match;
  }

  console.warn(`Strapi unavailable — checking persistent fallback cache for roadmap "${slug}"`);
  const fallback = await cache.getFallback<StrapiRoadmap>(cacheKey);
  if (fallback && isValidStrapiRoadmap(fallback)) {
    console.warn(`Serving roadmap "${slug}" from stale fallback cache`);
    return fallback;
  }

  return null;
}

export interface GroupedRoadmaps {
  upcoming: StrapiRoadmap[];
  previous: StrapiRoadmap[];
}

/**
 * Group roadmaps into upcoming and previous based on releaseDate.
 * Milestones with releaseDate >= today are "upcoming".
 */
export function groupRoadmapsByDate(roadmaps: StrapiRoadmap[]): GroupedRoadmaps {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: StrapiRoadmap[] = [];
  const previous: StrapiRoadmap[] = [];

  for (const roadmap of roadmaps) {
    const releaseDate = new Date(roadmap.releaseDate);
    releaseDate.setHours(0, 0, 0, 0);
    (releaseDate >= today ? upcoming : previous).push(roadmap);
  }

  upcoming.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
  previous.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  return { upcoming, previous };
}

/** Three-letter uppercase month from an ISO date string (e.g. `"2025-03-01"` → `"MAR"`). */
export function getMonthAbbreviation(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
}

/**
 * Month key for aligning roadmap entries to calendar grid slots.
 * @example getRoadmapMonthKey("2026-01-01") → "2026-01"
 */
export function getRoadmapMonthKey(releaseDate: string): string {
  return releaseDate.slice(0, 7);
}

/**
 * URL slug for roadmap detail pages. Uses Strapi `slug` when set,
 * otherwise falls back to the release month key for legacy entries.
 */
export function getRoadmapSlug(roadmap: Pick<StrapiRoadmap, 'slug' | 'releaseDate'>): string {
  const slug = roadmap.slug?.trim();
  if (slug) return slug;
  return getRoadmapMonthKey(roadmap.releaseDate);
}

/**
 * Days between today and the release date (releases are always on the 1st of the month).
 * Returns a positive number for future dates, negative for past dates.
 */
export function getDaysUntilRelease(releaseDate: string): number {
  const release = new Date(releaseDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((release.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Resolve the best available cover image URL from a Strapi roadmap `cover` field.
 * Prefers larger responsive formats when present.
 */
export function getRoadmapCoverUrl(cover?: StrapiImage): string | undefined {
  if (!cover) return undefined;

  return (
    getStrapiMediaUrl(cover.formats?.large?.url) ||
    getStrapiMediaUrl(cover.formats?.medium?.url) ||
    getStrapiMediaUrl(cover.formats?.small?.url) ||
    getStrapiMediaUrl(cover.url)
  );
}
