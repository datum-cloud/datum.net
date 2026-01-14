// src/libs/strapi/authors.ts
/**
 * Strapi Authors module with caching support
 */

import { Cache } from '@libs/cache';
import type { StrapiAuthorsResponse, StrapiAuthorFull } from '../../types/strapi';

const STRAPI_URL =
  import.meta.env.STRAPI_URL || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';
const CACHE_ENABLED =
  import.meta.env.STRAPI_CACHE_ENABLED === 'true' || import.meta.env.STRAPI_CACHE_ENABLED === '1';

const DEFAULT_CACHE_TTL_MS = 300000; // 5 minutes
const envTtlSec = parseInt(import.meta.env.STRAPI_CACHE_TTL ?? '300', 10);
const CACHE_TTL =
  Number.isNaN(envTtlSec) || envTtlSec <= 0 ? DEFAULT_CACHE_TTL_MS : envTtlSec * 1000;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against Strapi (local version to avoid circular import)
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
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
    console.error('Error fetching from Strapi:', error);
    return null;
  }
}

const cache = new Cache('.cache');
const CACHE_KEY = 'strapi-authors';
const TEAM_MEMBERS_CACHE_KEY = 'strapi-team-members';
const AUTHOR_CACHE_PREFIX = 'strapi-author-';
const AUTHOR_SLUG_CACHE_PREFIX = 'strapi-author-slug-';

/**
 * Color palette that cycles through for team member avatars
 */
const TEAM_BG_COLORS = ['#5F735E', '#BF9595', '#D1CDC0'] as const;

/**
 * GraphQL query to fetch all authors (with high limit to get all)
 */
export const AUTHORS_QUERY = `
  query GetAuthors {
    authors(pagination: { limit: 100 }) {
      documentId
      slug
      name
      title
      bio
      isTeam
      team
      tick
      surprising
      weekends
      avatar {
        url
        alternativeText
      }
      social {
        twitter
        linkedin
        github
      }
    }
  }
`;

/**
 * GraphQL query to fetch a single author by documentId
 */
export const AUTHOR_BY_DOCUMENT_ID_QUERY = `
  query GetAuthorByDocumentId($documentId: String!) {
    authors(filters: { documentId: { eq: $documentId } }) {
      documentId
      slug
      name
      title
      bio
      isTeam
      team
      tick
      surprising
      weekends
      avatar {
        url
        alternativeText
      }
      social {
        twitter
        linkedin
        github
      }
    }
  }
`;

/**
 * GraphQL query to fetch a single author by slug
 */
export const AUTHOR_BY_SLUG_QUERY = `
  query GetAuthorBySlug($slug: String!) {
    authors(filters: { slug: { eq: $slug } }) {
      documentId
      slug
      name
      title
      bio
      isTeam
      team
      tick
      surprising
      weekends
      avatar {
        url
        alternativeText
      }
      social {
        twitter
        linkedin
        github
      }
    }
  }
`;

/**
 * Validates that an object is a valid StrapiAuthorFull
 * @param obj - The object to validate
 * @returns True if the object is a valid StrapiAuthorFull
 */
function isValidStrapiAuthor(obj: unknown): obj is StrapiAuthorFull {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const author = obj as Record<string, unknown>;
  return typeof author.documentId === 'string' && typeof author.name === 'string';
}

/**
 * Validates that cached data has the correct structure with StrapiAuthorFull objects
 * @param data - The cached data to validate
 * @returns True if the data structure is valid
 */
function isValidCachedAuthors(data: unknown): data is StrapiAuthorFull[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(isValidStrapiAuthor);
}

/**
 * Extracts the last name from a full name string
 */
function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Extracts the first name from a full name string
 */
function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0].toLowerCase();
}

/**
 * Gets background color based on index, cycling through the color palette
 * @param index - The index of the team member
 * @returns The background color hex code
 */
export function getTeamBgColor(index: number): string {
  return TEAM_BG_COLORS[index % TEAM_BG_COLORS.length];
}

/**
 * Simple hash function to convert string to number
 * @param str - The string to hash
 * @returns A positive integer hash
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets a consistent background color for an author based on their name (fallback)
 * @param authorName - The name of the author
 * @returns The background color hex code
 */
function getAuthorBgColorByName(authorName: string): string {
  const hash = hashString(authorName);
  return TEAM_BG_COLORS[hash % TEAM_BG_COLORS.length];
}

/**
 * Sort function for Strapi team members
 * Founders first (CEO at top), then alphabetically by last name
 */
function sortStrapiTeamMembers(a: StrapiAuthorFull, b: StrapiAuthorFull): number {
  const aIsFounder = a.team === 'founders';
  const bIsFounder = b.team === 'founders';

  // Founders always come first
  if (aIsFounder && !bIsFounder) return -1;
  if (!aIsFounder && bIsFounder) return 1;

  // Among founders, sort by title so CEO comes first
  if (aIsFounder && bIsFounder) {
    const aIsCeo = a.title?.includes('CEO') ? 0 : 1;
    const bIsCeo = b.title?.includes('CEO') ? 0 : 1;
    if (aIsCeo !== bIsCeo) return aIsCeo - bIsCeo;
  }

  // Within the same group, sort by last name, then first name
  const lastNameCmp = getLastName(a.name).localeCompare(getLastName(b.name));
  if (lastNameCmp !== 0) return lastNameCmp;
  return getFirstName(a.name).localeCompare(getFirstName(b.name));
}

/**
 * Fetch all authors from Strapi with caching
 * @returns Array of all Strapi authors
 */
export async function fetchStrapiAuthors(): Promise<StrapiAuthorFull[]> {
  if (CACHE_ENABLED && cache.has(CACHE_KEY)) {
    const cached = cache.get<StrapiAuthorFull[]>(CACHE_KEY);
    if (cached && isValidCachedAuthors(cached)) {
      return cached;
    }
    if (cached) {
      console.warn('Invalid cached Strapi authors data detected, fetching fresh data from API');
    }
  }

  const response = await graphqlQuery<StrapiAuthorsResponse>(AUTHORS_QUERY);

  if (!response?.authors) {
    console.warn('No authors returned from Strapi API');
    return [];
  }

  const authors = response.authors;

  if (CACHE_ENABLED) {
    cache.set(CACHE_KEY, authors, CACHE_TTL);
  }

  return authors;
}

/**
 * Fetch single author by documentId.
 * Caches each author separately (per-author cache).
 * @param documentId - Author documentId (used as slug in URL)
 * @returns The author or null if not found
 */
export async function fetchStrapiAuthorByDocumentId(
  documentId: string
): Promise<StrapiAuthorFull | null> {
  const cacheKey = `${AUTHOR_CACHE_PREFIX}${documentId}`;

  if (CACHE_ENABLED && cache.has(cacheKey)) {
    const cached = cache.get<StrapiAuthorFull>(cacheKey);
    if (cached && isValidStrapiAuthor(cached)) {
      return cached;
    }
    if (cached) {
      console.warn(
        `Invalid cached Strapi author data detected for documentId "${documentId}", fetching fresh data from API`
      );
    }
  }

  const response = await graphqlQuery<StrapiAuthorsResponse>(AUTHOR_BY_DOCUMENT_ID_QUERY, {
    documentId,
  });

  if (!response?.authors || response.authors.length === 0) {
    return null;
  }

  const author = response.authors[0];

  if (CACHE_ENABLED) {
    cache.set(cacheKey, author, CACHE_TTL);
  }

  return author;
}

/**
 * Fetch single author by slug.
 * Caches each author separately (per-author cache by slug).
 * @param slug - Author slug (used in URL, e.g. /authors/john-doe/)
 * @returns The author or null if not found
 */
export async function fetchStrapiAuthorBySlug(slug: string): Promise<StrapiAuthorFull | null> {
  const cacheKey = `${AUTHOR_SLUG_CACHE_PREFIX}${slug}`;

  if (CACHE_ENABLED && cache.has(cacheKey)) {
    const cached = cache.get<StrapiAuthorFull>(cacheKey);
    if (cached && isValidStrapiAuthor(cached)) {
      return cached;
    }
    if (cached) {
      console.warn(
        `Invalid cached Strapi author data detected for slug "${slug}", fetching fresh data from API`
      );
    }
  }

  const response = await graphqlQuery<StrapiAuthorsResponse>(AUTHOR_BY_SLUG_QUERY, { slug });

  if (!response?.authors || response.authors.length === 0) {
    return null;
  }

  const author = response.authors[0];

  if (CACHE_ENABLED) {
    cache.set(cacheKey, author, CACHE_TTL);
  }

  return author;
}

/**
 * Fetches all team members from Strapi (authors where isTeam is true),
 * sorted with founders first, then alphabetically by last name.
 * Uses dedicated cache for team members.
 * @returns Sorted array of Strapi team member entries
 */
export async function getStrapiTeamMembers(): Promise<StrapiAuthorFull[]> {
  // Check dedicated team members cache first
  if (CACHE_ENABLED && cache.has(TEAM_MEMBERS_CACHE_KEY)) {
    const cached = cache.get<StrapiAuthorFull[]>(TEAM_MEMBERS_CACHE_KEY);
    if (cached && isValidCachedAuthors(cached)) {
      return cached;
    }
    if (cached) {
      console.warn('Invalid cached Strapi team members data detected, fetching fresh data');
    }
  }

  const authors = await fetchStrapiAuthors();
  const teamMembers = authors
    .filter((author) => author.isTeam === true)
    .sort(sortStrapiTeamMembers);

  // Cache the sorted team members
  if (CACHE_ENABLED) {
    cache.set(TEAM_MEMBERS_CACHE_KEY, teamMembers, CACHE_TTL);
  }

  return teamMembers;
}

/**
 * Gets the background color for a Strapi author based on their position in the team members list
 * Falls back to hash-based color if author is not found in the team list
 * @param authorName - The name of the author
 * @returns The background color hex code
 */
export async function getAuthorBgColorFromStrapi(authorName: string): Promise<string> {
  const teamMembers = await getStrapiTeamMembers();
  const authorIndex = teamMembers.findIndex((member) => member.name === authorName);

  if (authorIndex >= 0) {
    return getTeamBgColor(authorIndex);
  }

  // Fallback to hash-based color if author not in team list
  return getAuthorBgColorByName(authorName);
}
