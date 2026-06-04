// src/libs/strapi/roadmaps.ts
/**
 * Strapi roadmaps fetcher.
 *
 * Uses the shared `@datum-cloud/strapi-revalidate` bundle for caching and
 * GraphQL transport. The library handles primary + fallback persistence and
 * tag-based webhook invalidation; this module only owns the query and the
 * roadmap-specific grouping helpers.
 */

import { cache, client } from './revalidate';
import type { StrapiRoadmap, StrapiRoadmapsResponse } from '../../types/strapi';

const ROADMAPS_CACHE_KEY = 'strapi-roadmaps';
const ROADMAPS_TAG = 'roadmaps';

/**
 * GraphQL query to fetch all roadmap milestones
 */
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

/**
 * Validates that an object is a valid StrapiRoadmap
 */
function isValidStrapiRoadmap(obj: unknown): obj is StrapiRoadmap {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const roadmap = obj as Record<string, unknown>;
  return typeof roadmap.documentId === 'string' && typeof roadmap.title === 'string';
}

/**
 * Validates that cached data has the correct structure
 */
function isValidCachedRoadmaps(data: unknown): data is StrapiRoadmap[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(isValidStrapiRoadmap);
}

/**
 * Fetch all roadmap milestones from Strapi with caching.
 * Falls back to a persistent stale cache when Strapi is unreachable.
 * @returns Array of all Strapi roadmap milestones
 */
export async function fetchStrapiRoadmaps(): Promise<StrapiRoadmap[]> {
  const cached = await cache.get<StrapiRoadmap[]>(ROADMAPS_CACHE_KEY);
  if (cached && isValidCachedRoadmaps(cached)) {
    return cached;
  }
  if (cached) {
    console.warn('Invalid cached Strapi roadmaps data detected, fetching fresh data from API');
  }

  const response = await client.query<StrapiRoadmapsResponse>(ROADMAPS_QUERY);

  if (!response?.roadmaps) {
    console.warn('Strapi unavailable — checking persistent fallback cache for roadmaps');
    const fallback = await cache.getFallback<StrapiRoadmap[]>(ROADMAPS_CACHE_KEY);
    if (fallback && isValidCachedRoadmaps(fallback)) {
      console.warn(`Serving ${fallback.length} roadmaps from stale fallback cache`);
      return fallback;
    }
    console.warn('No roadmaps returned from Strapi API and no fallback cache available');
    return [];
  }

  await cache.set(ROADMAPS_CACHE_KEY, response.roadmaps, { tags: [ROADMAPS_TAG] });

  return response.roadmaps;
}

/**
 * Grouped roadmaps by upcoming/previous status
 */
export interface GroupedRoadmaps {
  upcoming: StrapiRoadmap[];
  previous: StrapiRoadmap[];
}

/**
 * Group roadmaps into upcoming and previous based on releaseDate.
 * Milestones with releaseDate >= today are considered "upcoming".
 * @param roadmaps - Array of roadmap milestones
 * @returns Object with upcoming and previous arrays
 */
export function groupRoadmapsByDate(roadmaps: StrapiRoadmap[]): GroupedRoadmaps {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: StrapiRoadmap[] = [];
  const previous: StrapiRoadmap[] = [];

  for (const roadmap of roadmaps) {
    const releaseDate = new Date(roadmap.releaseDate);
    releaseDate.setHours(0, 0, 0, 0);

    if (releaseDate >= today) {
      upcoming.push(roadmap);
    } else {
      previous.push(roadmap);
    }
  }

  // Upcoming: sort by releaseDate ASC (nearest first)
  upcoming.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

  // Previous: sort by releaseDate DESC (most recent first)
  previous.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  return { upcoming, previous };
}

/**
 * Get month abbreviation from date string
 * @param dateString - ISO date string (e.g., "2025-03-01")
 * @returns 3-letter month abbreviation (e.g., "MAR")
 */
export function getMonthAbbreviation(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
}
