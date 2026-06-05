// src/libs/strapi/roadmaps.ts
/**
 * Strapi Roadmaps module.
 *
 * GraphQL + cache duties live in `_runtime.ts` (via `@datum-cloud/strapi-revalidate`).
 * Cache key `strapi-roadmaps` is tagged `roadmaps`; the webhook tag map in
 * `_runtime.ts` routes `api::roadmap.roadmap` events to this tag.
 */

import { cache, client } from './_runtime';
import type { StrapiRoadmap, StrapiRoadmapsResponse } from '../../types/strapi';

const ROADMAPS_CACHE_KEY = 'strapi-roadmaps';
// Pre-migration fallback key; read as a backstop so deploys preserve access to
// existing stale data if Strapi happens to be unreachable during the cutover.
const LEGACY_FALLBACK_KEY = 'roadmaps';

export const ROADMAPS_QUERY = `
  query GetRoadmaps {
    roadmaps(pagination: { limit: 100 }, sort: "releaseDate:desc") {
      documentId
      title
      description
      summary
      releaseDate
      githubUrl
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

  const response = await client.query<StrapiRoadmapsResponse>(ROADMAPS_QUERY);

  if (!response?.roadmaps) {
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

  await cache.set(ROADMAPS_CACHE_KEY, response.roadmaps, { tags: ['roadmaps'] });
  return response.roadmaps;
}

export interface GroupedRoadmaps {
  upcoming: StrapiRoadmap[];
  previous: StrapiRoadmap[];
}

/**
 * Group roadmaps into upcoming and previous based on releaseDate.
 * Milestones with releaseDate >= today are considered "upcoming".
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

/** Three-letter uppercase month from an ISO date (e.g. `"2025-03-01"` → `"MAR"`). */
export function getMonthAbbreviation(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
}
