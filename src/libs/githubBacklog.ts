// src/libs/githubBacklog.ts
/**
 * GitHub Projects backlog fetcher.
 *
 * Fetches issues in the "In progress", "Planned", and "Backlog" status
 * columns from the datum-cloud GitHub Projects board (project #22, org
 * `datum-cloud`) via the GraphQL Projects v2 API.
 *
 * Cache strategy:
 *  - Redis (when REDIS_URL is set): key `${redisKeyPrefix}github:backlog`, TTL 24 h
 *  - In-memory Map: fallback for local dev (single-instance, no persistence)
 *
 * Auth: uses existing APP_ID / APP_PRIVATE_KEY / APP_INSTALLATION_ID env vars
 * via the `graph()` helper in `src/libs/github.ts`.
 */

import { graph } from './github';
import { redisClient, redisKeyPrefix } from './strapi/_runtime';

export type GitHubBacklogStatus = 'Backlog' | 'Planned' | 'In progress';

export const INCLUDED_BACKLOG_STATUSES: GitHubBacklogStatus[] = [
  'In progress',
  'Planned',
  'Backlog',
];

export interface GitHubBacklogItem {
  number: number;
  title: string;
  url: string;
  labels: string[];
  status: GitHubBacklogStatus;
}

const GITHUB_ORG = 'datum-cloud';
const GITHUB_PROJECT_NUMBER = 22;
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

const REDIS_CACHE_KEY = `${redisKeyPrefix}github:backlog`;

/** Logical cache name for admin force-regen (`POST /api/cache/strapi`). */
export const GITHUB_BACKLOG_CACHE_KEY = 'github-backlog';

/** Module-level in-memory cache for local dev (no Redis). */
const memCache = {
  data: null as GitHubBacklogItem[] | null,
  expiresAt: 0,
};

const BACKLOG_QUERY = `
  query GetProjectBacklog($org: String!, $projectNumber: Int!, $cursor: String) {
    organization(login: $org) {
      projectV2(number: $projectNumber) {
        items(first: 100, after: $cursor) {
          nodes {
            content {
              ... on Issue {
                number
                title
                url
                labels(first: 10) {
                  nodes {
                    name
                  }
                }
              }
            }
            fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  }
`;

interface GitHubLabel {
  name: string;
}

interface GitHubIssueContent {
  number?: number;
  title?: string;
  url?: string;
  labels?: { nodes: GitHubLabel[] };
}

interface GitHubProjectItem {
  content: GitHubIssueContent | null;
  fieldValueByName: { name: string } | null;
}

interface GitHubProjectItemsPage {
  nodes: GitHubProjectItem[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface GitHubProjectResponse {
  organization: {
    projectV2: {
      items: GitHubProjectItemsPage;
    };
  };
}

function isGitHubBacklogStatus(value: string | undefined): value is GitHubBacklogStatus {
  return INCLUDED_BACKLOG_STATUSES.includes(value as GitHubBacklogStatus);
}

function isValidCachedBacklogItem(item: unknown): item is GitHubBacklogItem {
  if (!item || typeof item !== 'object') return false;
  const record = item as Record<string, unknown>;
  return (
    typeof record.number === 'number' &&
    typeof record.title === 'string' &&
    typeof record.url === 'string' &&
    Array.isArray(record.labels) &&
    isGitHubBacklogStatus(record.status as string | undefined)
  );
}

function isValidCachedBacklog(items: unknown): items is GitHubBacklogItem[] {
  return Array.isArray(items) && items.every(isValidCachedBacklogItem);
}

function sortBacklogItems(items: GitHubBacklogItem[]): GitHubBacklogItem[] {
  return [...items].sort((a, b) => {
    const statusDiff =
      INCLUDED_BACKLOG_STATUSES.indexOf(a.status) - INCLUDED_BACKLOG_STATUSES.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;
    return a.number - b.number;
  });
}

/** Read cached backlog from Redis. Returns null on miss or error. */
async function readFromRedis(): Promise<GitHubBacklogItem[] | null> {
  if (!redisClient) return null;
  try {
    const raw = await redisClient.get(REDIS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidCachedBacklog(parsed)) {
      console.warn('[githubBacklog] Invalid cached backlog data detected, refetching');
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[githubBacklog] Redis read error:', err);
    return null;
  }
}

/** Write backlog to Redis with TTL. Silently logs on error. */
async function writeToRedis(items: GitHubBacklogItem[]): Promise<void> {
  if (!redisClient) return;
  try {
    await redisClient.set(REDIS_CACHE_KEY, JSON.stringify(items), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    console.warn('[githubBacklog] Redis write error:', err);
  }
}

/** Fetch all backlog pages from GitHub Projects v2 API. */
async function fetchFromGitHub(): Promise<GitHubBacklogItem[]> {
  const items: GitHubBacklogItem[] = [];
  let cursor: string | null = null;

  while (true) {
    const variables: Record<string, unknown> = {
      org: GITHUB_ORG,
      projectNumber: GITHUB_PROJECT_NUMBER,
    };
    if (cursor) variables.cursor = cursor;

    let data: unknown;
    try {
      data = await graph(BACKLOG_QUERY, variables);
    } catch (err) {
      console.error('[githubBacklog] GraphQL fetch error:', err);
      break;
    }

    const response = data as GitHubProjectResponse | null;
    const page = response?.organization?.projectV2?.items;
    if (!page) break;

    for (const node of page.nodes) {
      const status = node.fieldValueByName?.name;
      const content = node.content;

      if (!isGitHubBacklogStatus(status) || !content || typeof content.number !== 'number') {
        continue;
      }

      items.push({
        number: content.number,
        title: content.title ?? '',
        url: content.url ?? `https://github.com/${GITHUB_ORG}`,
        labels: (content.labels?.nodes ?? []).map((l) => l.name),
        status,
      });
    }

    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break;
    cursor = page.pageInfo.endCursor;
  }

  return sortBacklogItems(items);
}

/** Returns true when a non-expired backlog cache entry exists. */
export async function isGitHubBacklogCached(): Promise<boolean> {
  if (redisClient) {
    try {
      return (await redisClient.get(REDIS_CACHE_KEY)) !== null;
    } catch {
      return false;
    }
  }
  return memCache.data !== null && Date.now() < memCache.expiresAt;
}

/** Clear Redis and in-memory backlog cache without refetching. */
export async function clearGitHubBacklogCache(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(REDIS_CACHE_KEY);
    } catch (err) {
      console.warn('[githubBacklog] Redis delete error:', err);
    }
  }
  memCache.data = null;
  memCache.expiresAt = 0;
}

/**
 * Clear backlog cache and fetch fresh items from GitHub Projects.
 * @throws When the GitHub fetch fails after cache was cleared
 */
export async function forceRegenerateGitHubBacklog(): Promise<GitHubBacklogItem[]> {
  await clearGitHubBacklogCache();
  const items = await fetchFromGitHub();
  await writeToRedis(items);

  if (!redisClient) {
    memCache.data = items;
    memCache.expiresAt = Date.now() + CACHE_TTL_SECONDS * 1000;
  }

  return items;
}

/**
 * Fetch In progress, Planned, and Backlog items from the datum-cloud GitHub Projects board.
 *
 * Cache read order:
 *  1. Redis (if configured) — 24-h TTL
 *  2. In-memory map (local dev, single-instance)
 *  3. Live fetch from GitHub API → write result back to cache
 *
 * Never throws — returns empty array on complete failure.
 */
export async function fetchGitHubBacklog(): Promise<GitHubBacklogItem[]> {
  // 1. Try Redis
  const cached = await readFromRedis();
  if (cached) return cached;

  // 2. Try in-memory (local dev / no Redis)
  if (
    !redisClient &&
    memCache.data &&
    Date.now() < memCache.expiresAt &&
    isValidCachedBacklog(memCache.data)
  ) {
    return memCache.data;
  }

  // 3. Fetch live
  try {
    const items = await fetchFromGitHub();

    await writeToRedis(items);

    if (!redisClient) {
      memCache.data = items;
      memCache.expiresAt = Date.now() + CACHE_TTL_SECONDS * 1000;
    }

    return items;
  } catch (err) {
    console.error('[githubBacklog] Failed to fetch backlog:', err);
    return [];
  }
}
