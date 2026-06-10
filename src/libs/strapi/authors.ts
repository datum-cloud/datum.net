// src/libs/strapi/authors.ts
/**
 * Strapi Authors module.
 *
 * GraphQL + cache duties live in `_runtime.ts` (via `@datum-cloud/strapi-revalidate`).
 * This file owns datum-specific concerns: cardCategories normalization, team
 * sorting (founders first, CEO at top, then alphabetical by last name), and
 * the bg-color helpers used by team avatars.
 *
 * Cache keys are unchanged from the pre-package layout:
 *   `strapi-authors`              — full author list
 *   `strapi-team-members`         — `isTeam === true`, sorted
 *   `strapi-card-members`         — `isCard === true`, sorted
 *   `strapi-author-slug-<slug>`   — single author by slug
 * All entries are tagged `authors`, so one webhook clears every derived view.
 */

import { cache, client } from './_runtime';
import type { CardCategory, StrapiAuthorsResponse, StrapiAuthorFull } from '../../types/strapi';

const AUTHORS_CACHE_KEY = 'strapi-authors';
const TEAM_MEMBERS_CACHE_KEY = 'strapi-team-members';
const CARD_MEMBERS_CACHE_KEY = 'strapi-card-members';
const AUTHOR_SLUG_CACHE_PREFIX = 'strapi-author-slug-';

const VALID_CARD_CATEGORIES = new Set<CardCategory>([
  'partnerships',
  'support',
  'pr_events',
  'fundraising',
]);

/** Normalize Author.cardCategories from Strapi (delimited string, JSON array, or legacy component rows). */
function parseCardCategories(raw: unknown): CardCategory[] {
  if (raw == null) return [];

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return parseCardCategories(parsed);
      } catch {
        /* fall through to delimiter split */
      }
    }
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.filter((v): v is CardCategory => VALID_CARD_CATEGORIES.has(v as CardCategory));
  }

  if (!Array.isArray(raw)) return [];

  const first = raw[0];
  if (
    raw.length > 0 &&
    first !== null &&
    typeof first === 'object' &&
    'topic' in first &&
    typeof (first as { topic?: unknown }).topic === 'string'
  ) {
    return raw
      .map((c) => (c as { topic?: string }).topic)
      .filter(
        (v): v is CardCategory =>
          typeof v === 'string' && VALID_CARD_CATEGORIES.has(v as CardCategory)
      );
  }
  return raw.filter(
    (v): v is CardCategory => typeof v === 'string' && VALID_CARD_CATEGORIES.has(v as CardCategory)
  );
}

type GraphQLAuthorRow = Omit<StrapiAuthorFull, 'cardCategories'> & { cardCategories?: unknown };

function normalizeAuthorFromGraphQL(row: GraphQLAuthorRow): StrapiAuthorFull {
  return { ...row, cardCategories: parseCardCategories(row.cardCategories) };
}

const TEAM_BG_COLORS = ['#5F735E', '#BF9595', '#D1CDC0'] as const;

export const AUTHORS_QUERY = `
  query GetAuthors {
    authors(pagination: { limit: 100 }) {
      documentId
      slug
      name
      title
      bio
      helloBio
      isTeam
      team
      tick
      surprising
      weekends
      isCard
      cardCategories
      location
      timezone
      calendly
      avatar {
        url
        alternativeText
      }
      social {
        twitter
        linkedin
        github
        discord
        email
      }
      cardImages {
        url
        alternativeText
        caption
      }
    }
  }
`;

export const AUTHOR_BY_SLUG_QUERY = `
  query GetAuthorBySlug($slug: String!) {
    authors(filters: { slug: { eq: $slug } }) {
      documentId
      slug
      name
      title
      bio
      helloBio
      isTeam
      team
      tick
      surprising
      weekends
      isCard
      cardCategories
      location
      timezone
      calendly
      avatar {
        url
        alternativeText
      }
      social {
        twitter
        linkedin
        github
        discord
        email
      }
      cardImages {
        url
        alternativeText
        caption
      }
    }
  }
`;

function isValidStrapiAuthor(obj: unknown): obj is StrapiAuthorFull {
  if (!obj || typeof obj !== 'object') return false;
  const author = obj as Record<string, unknown>;
  return typeof author.documentId === 'string' && typeof author.name === 'string';
}

function isValidCachedAuthors(data: unknown): data is StrapiAuthorFull[] {
  return Array.isArray(data) && data.length > 0 && data.every(isValidStrapiAuthor);
}

function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0].toLowerCase();
}

/** Background color for team avatars, cycling through the palette. */
export function getTeamBgColor(index: number): string {
  return TEAM_BG_COLORS[index % TEAM_BG_COLORS.length];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getAuthorBgColorByName(authorName: string): string {
  const hash = hashString(authorName);
  return TEAM_BG_COLORS[hash % TEAM_BG_COLORS.length];
}

/** Founders first (CEO at the top), then alphabetical by last name. */
function sortStrapiTeamMembers(a: StrapiAuthorFull, b: StrapiAuthorFull): number {
  const aIsFounder = a.team === 'founders';
  const bIsFounder = b.team === 'founders';

  if (aIsFounder && !bIsFounder) return -1;
  if (!aIsFounder && bIsFounder) return 1;

  if (aIsFounder && bIsFounder) {
    const aIsCeo = a.title?.includes('CEO') ? 0 : 1;
    const bIsCeo = b.title?.includes('CEO') ? 0 : 1;
    if (aIsCeo !== bIsCeo) return aIsCeo - bIsCeo;
  }

  const lastNameCmp = getLastName(a.name).localeCompare(getLastName(b.name));
  if (lastNameCmp !== 0) return lastNameCmp;
  return getFirstName(a.name).localeCompare(getFirstName(b.name));
}

export async function fetchStrapiAuthors(): Promise<StrapiAuthorFull[]> {
  const cached = await cache.get<StrapiAuthorFull[]>(AUTHORS_CACHE_KEY);
  if (cached && isValidCachedAuthors(cached)) return cached;
  if (cached) {
    console.warn('Invalid cached Strapi authors data detected, fetching fresh data from API');
  }

  const response = await client.query<StrapiAuthorsResponse>(AUTHORS_QUERY);
  if (!response?.authors) {
    console.warn('No authors returned from Strapi API');
    return [];
  }

  const authors = response.authors.map(normalizeAuthorFromGraphQL);
  if (authors.length > 0) {
    await cache.set(AUTHORS_CACHE_KEY, authors, { tags: ['authors'] });
  }
  return authors;
}

/**
 * documentId lookup. Reads the cached authors list rather than maintaining a
 * dedicated cache — `fetchStrapiAuthors()` is already memoized via the
 * package's cache manager.
 */
export async function fetchStrapiAuthorByDocumentId(
  documentId: string
): Promise<StrapiAuthorFull | null> {
  const authors = await fetchStrapiAuthors();
  return authors.find((a) => a.documentId === documentId) ?? null;
}

export async function fetchStrapiAuthorBySlug(slug: string): Promise<StrapiAuthorFull | null> {
  const cacheKey = `${AUTHOR_SLUG_CACHE_PREFIX}${slug}`;

  const cached = await cache.get<StrapiAuthorFull>(cacheKey);
  if (cached && isValidStrapiAuthor(cached)) return cached;
  if (cached) {
    console.warn(
      `Invalid cached Strapi author data detected for slug "${slug}", fetching fresh data from API`
    );
  }

  const response = await client.query<StrapiAuthorsResponse>(AUTHOR_BY_SLUG_QUERY, { slug });
  if (!response?.authors || response.authors.length === 0) return null;

  const author = normalizeAuthorFromGraphQL(response.authors[0]);
  await cache.set(cacheKey, author, { tags: ['authors', `author:${slug}`] });
  return author;
}

/**
 * Team members (`isTeam === true`), sorted with founders first, then
 * alphabetically by last name. Cached separately so the sort/filter happens
 * once per author publish, not on every page render.
 */
export async function getStrapiTeamMembers(): Promise<StrapiAuthorFull[]> {
  const cached = await cache.get<StrapiAuthorFull[]>(TEAM_MEMBERS_CACHE_KEY);
  if (cached && isValidCachedAuthors(cached)) return cached;
  if (cached) {
    console.warn('Invalid cached Strapi team members data detected, fetching fresh data');
  }

  const authors = await fetchStrapiAuthors();
  const teamMembers = authors
    .filter((author) => author.isTeam === true)
    .sort(sortStrapiTeamMembers);

  if (teamMembers.length > 0) {
    await cache.set(TEAM_MEMBERS_CACHE_KEY, teamMembers, { tags: ['authors'] });
  }
  return teamMembers;
}

/**
 * Card members (`isCard === true`), sorted with founders first. Same caching
 * pattern as team members.
 */
export async function getStrapiCardMembers(): Promise<StrapiAuthorFull[]> {
  const cached = await cache.get<StrapiAuthorFull[]>(CARD_MEMBERS_CACHE_KEY);
  if (cached && isValidCachedAuthors(cached)) return cached;
  if (cached) {
    console.warn('Invalid cached Strapi card members data detected, fetching fresh data');
  }

  const authors = await fetchStrapiAuthors();
  const cardMembers = authors
    .filter((author) => author.isCard === true)
    .sort(sortStrapiTeamMembers);

  if (cardMembers.length > 0) {
    await cache.set(CARD_MEMBERS_CACHE_KEY, cardMembers, { tags: ['authors'] });
  }
  return cardMembers;
}

/**
 * Background color for an author, derived from their position in the sorted
 * team list. Falls back to a name-hash color when the author isn't on the team.
 */
export async function getAuthorBgColorFromStrapi(authorName: string): Promise<string> {
  const teamMembers = await getStrapiTeamMembers();
  const authorIndex = teamMembers.findIndex((member) => member.name === authorName);

  if (authorIndex >= 0) return getTeamBgColor(authorIndex);
  return getAuthorBgColorByName(authorName);
}
