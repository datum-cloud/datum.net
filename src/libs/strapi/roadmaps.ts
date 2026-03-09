// src/libs/strapi/roadmaps.ts
/**
 * Strapi Roadmaps module with caching support
 */

import { Cache } from '@libs/cache';
import type { StrapiRoadmap, StrapiRoadmapsResponse } from '../../types/strapi';

const STRAPI_URL =
  import.meta.env.STRAPI_URL ||
  process.env.STRAPI_URL ||
  'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || process.env.STRAPI_TOKEN || '';
const cacheEnabledRaw = import.meta.env.STRAPI_CACHE_ENABLED || process.env.STRAPI_CACHE_ENABLED;
const CACHE_ENABLED = cacheEnabledRaw === 'true' || cacheEnabledRaw === '1';

const DEFAULT_CACHE_TTL_MS = 300000; // 5 minutes
const envTtlSec = parseInt(
  import.meta.env.STRAPI_CACHE_TTL ?? process.env.STRAPI_CACHE_TTL ?? '300',
  10
);
const ROADMAPS_CACHE_TTL =
  Number.isNaN(envTtlSec) || envTtlSec <= 0 ? DEFAULT_CACHE_TTL_MS : envTtlSec * 1000;

const envTimeoutSec = parseInt(
  import.meta.env.STRAPI_TIMEOUT ?? process.env.STRAPI_TIMEOUT ?? '10',
  10
);
const FETCH_TIMEOUT_MS =
  Number.isNaN(envTimeoutSec) || envTimeoutSec <= 0 ? 10_000 : envTimeoutSec * 1000;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against Strapi
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
      console.warn(`Strapi request timed out after ${FETCH_TIMEOUT_MS}ms`);
    } else {
      console.warn(
        'Strapi unreachable (using fallback cache if available):',
        (error as Error).message
      );
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

const cache = new Cache('.cache');
const ROADMAPS_CACHE_KEY = 'strapi-roadmaps';

const fallbackCache = new Cache('.cache/strapi-fallback');
const FALLBACK_ROADMAPS_KEY = 'roadmaps';

/**
 * GraphQL query to fetch all roadmap milestones
 */
export const ROADMAPS_QUERY = `
  query GetRoadmaps {
    roadmaps(pagination: { limit: 100 }, sort: "releaseDate:desc") {
      documentId
      title
      description
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
  if (CACHE_ENABLED && cache.has(ROADMAPS_CACHE_KEY)) {
    const cached = cache.get<StrapiRoadmap[]>(ROADMAPS_CACHE_KEY);
    if (cached && isValidCachedRoadmaps(cached)) {
      return cached;
    }
    if (cached) {
      console.warn('Invalid cached Strapi roadmaps data detected, fetching fresh data from API');
    }
  }

  const response = await graphqlQuery<StrapiRoadmapsResponse>(ROADMAPS_QUERY);

  if (!response?.roadmaps) {
    console.warn('Strapi unavailable — checking persistent fallback cache for roadmaps');
    const fallback = fallbackCache.get<StrapiRoadmap[]>(FALLBACK_ROADMAPS_KEY);
    if (fallback && isValidCachedRoadmaps(fallback)) {
      console.warn(`Serving ${fallback.length} roadmaps from stale fallback cache`);
      return fallback;
    }
    console.warn('No roadmaps returned from Strapi API and no fallback cache available');
    return [];
  }

  const roadmaps = response.roadmaps;

  if (CACHE_ENABLED) {
    cache.set(ROADMAPS_CACHE_KEY, roadmaps, ROADMAPS_CACHE_TTL);
  }

  fallbackCache.set(FALLBACK_ROADMAPS_KEY, roadmaps);

  return roadmaps;
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
