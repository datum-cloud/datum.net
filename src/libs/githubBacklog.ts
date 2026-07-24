// src/libs/githubBacklog.ts
/**
 * GitHub Projects backlog fetcher.
 *
 * Fetches issues in the "In progress", "Planned", and "Backlog" status
 * columns from the datum-cloud GitHub Projects board (project #22, org
 * `datum-cloud`) via the GraphQL Projects v2 API.
 *
 * Cache strategy (stale-while-revalidate):
 *  - Redis (when REDIS_URL is set): key `${redisKeyPrefix}github:backlog`
 *  - File (`.cache/github-backlog.json`): fallback when Redis is absent/down,
 *    and — critically — pre-populated by `npm run build:cache` at image build
 *    time (see `scripts/warmup-cache.ts` and the Dockerfile's `.cache` COPY),
 *    so the very first request after a deploy already has warm data instead
 *    of paying for a live GitHub fetch.
 *  - Staleness is tracked via a stored `updatedAt` timestamp, not either
 *    driver's own expiry (a long safety-net TTL is set on the Redis entry so
 *    an abandoned key doesn't linger forever, but it never drives the
 *    request-facing staleness check).
 *  - A request never blocks on GitHub, period. A stale cache returns the
 *    last-known-good items immediately and fires a de-duplicated background
 *    refresh. An empty cache (no entry in either driver — true cold start, or
 *    a corrupted/empty cache file) returns an empty list immediately and
 *    fires a de-duplicated background populate instead of blocking on it; the
 *    client's live-update poller (`BacklogLiveUpdate.astro`) swaps in real
 *    data once that finishes.
 *  - Before paying for a full paginated refetch, a background refresh first
 *    checks GitHub's own `ProjectV2.updatedAt` (one cheap field, one round
 *    trip). If the board hasn't changed since our last full fetch, it skips
 *    pagination entirely and just extends our cache's freshness.
 *
 * Auth: uses existing APP_ID / APP_PRIVATE_KEY / APP_INSTALLATION_ID env vars
 * via the `graph()` helper in `src/libs/github.ts`.
 */

import { FileCacheDriver } from '@datum-cloud/strapi-revalidate';
import { graph } from './github';
import { isRedisReady, redisClient, redisKeyPrefix } from './strapi/_runtime';

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

interface CachedBacklog {
  items: GitHubBacklogItem[];
  updatedAt: number;
  /** GitHub's own `ProjectV2.updatedAt` as of this fetch — lets a background
   *  refresh skip full pagination when the board hasn't changed. */
  projectUpdatedAt: string;
}

const GITHUB_ORG = 'datum-cloud';
const GITHUB_PROJECT_NUMBER = 22;
const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes — staleness threshold, not a hard expiry
const REDIS_SAFETY_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days — backstop so an abandoned key clears eventually

const REDIS_CACHE_KEY = `${redisKeyPrefix}github:backlog`;

/** Logical cache name for admin force-regen (`POST /api/cache/strapi`) and the file cache key. */
export const GITHUB_BACKLOG_CACHE_KEY = 'github-backlog';

/** Persistent fallback — same `.cache` dir Strapi's file driver uses, baked into the deploy image. */
const fileCache = new FileCacheDriver({ dir: '.cache' });

/** De-dupes concurrent background refresh triggers within a single process. */
let refreshInFlight: Promise<void> | null = null;

const PROJECT_UPDATED_AT_QUERY = `
  query GetProjectUpdatedAt($org: String!, $projectNumber: Int!) {
    organization(login: $org) {
      projectV2(number: $projectNumber) {
        updatedAt
      }
    }
  }
`;

const BACKLOG_QUERY = `
  query GetProjectBacklog($org: String!, $projectNumber: Int!, $cursor: String) {
    organization(login: $org) {
      projectV2(number: $projectNumber) {
        updatedAt
        items(first: 100, after: $cursor) {
          nodes {
            content {
              ... on Issue {
                number
                title
                url
                labels(first: 5) {
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
      updatedAt: string;
      items: GitHubProjectItemsPage;
    };
  };
}

interface GitHubProjectUpdatedAtResponse {
  organization: {
    projectV2: {
      updatedAt: string;
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

function isValidCachedEntry(value: unknown): value is CachedBacklog {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.updatedAt === 'number' &&
    typeof record.projectUpdatedAt === 'string' &&
    isValidCachedBacklog(record.items)
  );
}

function isStale(updatedAt: number): boolean {
  return Date.now() - updatedAt >= CACHE_TTL_SECONDS * 1000;
}

function sortBacklogItems(items: GitHubBacklogItem[]): GitHubBacklogItem[] {
  return [...items].sort((a, b) => {
    const statusDiff =
      INCLUDED_BACKLOG_STATUSES.indexOf(a.status) - INCLUDED_BACKLOG_STATUSES.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;
    return a.number - b.number;
  });
}

/** Read the cached backlog entry: Redis first, then the persistent file fallback. */
async function readCache(): Promise<CachedBacklog | null> {
  if (redisClient && isRedisReady()) {
    try {
      const raw = await redisClient.get(REDIS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (isValidCachedEntry(parsed)) return parsed;
        console.warn('[githubBacklog] Invalid Redis backlog data detected, falling back');
      }
    } catch (err) {
      console.warn('[githubBacklog] Redis read error:', err);
    }
  }

  try {
    const fileEntry = await fileCache.get<unknown>(GITHUB_BACKLOG_CACHE_KEY);
    if (fileEntry && isValidCachedEntry(fileEntry)) return fileEntry;
  } catch (err) {
    console.warn('[githubBacklog] File cache read error:', err);
  }

  return null;
}

/** Write the backlog entry to the file cache (always) and Redis (when available). */
async function writeCache(entry: CachedBacklog): Promise<void> {
  try {
    await fileCache.set(GITHUB_BACKLOG_CACHE_KEY, entry);
  } catch (err) {
    console.warn('[githubBacklog] File cache write error:', err);
  }

  if (!redisClient || !isRedisReady()) return;
  try {
    await redisClient.set(REDIS_CACHE_KEY, JSON.stringify(entry), 'EX', REDIS_SAFETY_TTL_SECONDS);
  } catch (err) {
    console.warn('[githubBacklog] Redis write error:', err);
  }
}

/** Cheap single-field check: has the board changed since our last full fetch? */
async function fetchProjectUpdatedAt(): Promise<string | null> {
  try {
    const data = await graph(PROJECT_UPDATED_AT_QUERY, {
      org: GITHUB_ORG,
      projectNumber: GITHUB_PROJECT_NUMBER,
    });
    const response = data as GitHubProjectUpdatedAtResponse | null;
    return response?.organization?.projectV2?.updatedAt ?? null;
  } catch (err) {
    console.warn('[githubBacklog] Failed to check project updatedAt:', err);
    return null;
  }
}

/**
 * Fires a de-duplicated background refresh; never throws, never blocks the caller.
 * Checks GitHub's own `ProjectV2.updatedAt` first — if the board is unchanged since
 * `cachedProjectUpdatedAt`, skips the full paginated refetch and just extends
 * freshness on the existing cached items.
 */
function triggerBackgroundRefresh(cachedProjectUpdatedAt: string): void {
  if (refreshInFlight) return;

  refreshInFlight = (async () => {
    try {
      const latestProjectUpdatedAt = await fetchProjectUpdatedAt();

      if (latestProjectUpdatedAt && latestProjectUpdatedAt === cachedProjectUpdatedAt) {
        const cached = await readCache();
        if (cached) {
          await writeCache({ ...cached, updatedAt: Date.now() });
        }
        return;
      }

      const { items, projectUpdatedAt } = await fetchFromGitHub();
      await writeCache({
        items,
        updatedAt: Date.now(),
        projectUpdatedAt: projectUpdatedAt ?? cachedProjectUpdatedAt,
      });
    } catch (err) {
      console.error('[githubBacklog] Background refresh failed, keeping stale cache:', err);
    } finally {
      refreshInFlight = null;
    }
  })();
}

/**
 * Fires a de-duplicated background fetch to populate an empty cache; never
 * throws, never blocks the caller. Used when there's no prior data at all to
 * compare against (true cold start, or a corrupted/empty cache file) — on
 * failure it simply leaves the cache empty so the next request retries.
 */
function triggerBackgroundPopulate(): void {
  if (refreshInFlight) return;

  refreshInFlight = (async () => {
    try {
      const { items, projectUpdatedAt } = await fetchFromGitHub();
      await writeCache({ items, updatedAt: Date.now(), projectUpdatedAt: projectUpdatedAt ?? '' });
    } catch (err) {
      console.error('[githubBacklog] Background populate failed:', err);
    } finally {
      refreshInFlight = null;
    }
  })();
}

/**
 * Fetch all backlog pages from GitHub Projects v2 API.
 * @throws When a GraphQL call errors, or the API returns no project data (e.g.
 *   missing/invalid GitHub App credentials) — callers must not mistake that for
 *   a legitimately empty backlog and must not let it overwrite a good cache.
 */
async function fetchFromGitHub(): Promise<{
  items: GitHubBacklogItem[];
  projectUpdatedAt: string | null;
}> {
  const items: GitHubBacklogItem[] = [];
  let cursor: string | null = null;
  let projectUpdatedAt: string | null = null;

  while (true) {
    const variables: Record<string, unknown> = {
      org: GITHUB_ORG,
      projectNumber: GITHUB_PROJECT_NUMBER,
    };
    if (cursor) variables.cursor = cursor;

    const data: unknown = await graph(BACKLOG_QUERY, variables);

    const response = data as GitHubProjectResponse | null;
    const project = response?.organization?.projectV2;
    const page = project?.items;
    if (!project || !page) {
      throw new Error(
        '[githubBacklog] GitHub Projects API returned no data — check APP_ID/APP_PRIVATE_KEY/APP_INSTALLATION_ID'
      );
    }

    if (project.updatedAt) projectUpdatedAt = project.updatedAt;

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

  return { items: sortBacklogItems(items), projectUpdatedAt };
}

/** Returns true when a backlog cache entry exists at all (fresh or stale). */
export async function isGitHubBacklogCached(): Promise<boolean> {
  return (await readCache()) !== null;
}

/** Clear Redis and file backlog cache without refetching. */
export async function clearGitHubBacklogCache(): Promise<void> {
  if (redisClient && isRedisReady()) {
    try {
      await redisClient.del(REDIS_CACHE_KEY);
    } catch (err) {
      console.warn('[githubBacklog] Redis delete error:', err);
    }
  }
  try {
    await fileCache.delete(GITHUB_BACKLOG_CACHE_KEY);
  } catch (err) {
    console.warn('[githubBacklog] File cache delete error:', err);
  }
}

/**
 * Fetch fresh items from GitHub Projects and replace the cache.
 * Fetches before touching the cache — on failure, the existing (working) cache
 * is left completely untouched instead of being cleared out from under it.
 * @throws When the GitHub fetch fails — the cache is guaranteed unchanged
 */
export async function forceRegenerateGitHubBacklog(): Promise<GitHubBacklogItem[]> {
  const { items, projectUpdatedAt } = await fetchFromGitHub();
  await writeCache({ items, updatedAt: Date.now(), projectUpdatedAt: projectUpdatedAt ?? '' });
  return items;
}

/**
 * Fetch In progress, Planned, and Backlog items from the datum-cloud GitHub Projects board.
 *
 * Stale-while-revalidate: a request never blocks on GitHub, ever. A stale cache
 * returns the last-known-good items immediately and fires a de-duplicated
 * background refresh. An empty cache (true cold start, or a corrupted/empty
 * cache file) returns an empty list immediately and fires a de-duplicated
 * background populate — the client's live-update poller swaps in real data
 * once that completes, without the request ever waiting on it.
 *
 * Never throws.
 */
export async function fetchGitHubBacklog(): Promise<GitHubBacklogItem[]> {
  const cached = await readCache();

  if (cached) {
    if (isStale(cached.updatedAt)) {
      triggerBackgroundRefresh(cached.projectUpdatedAt);
    }
    return cached.items;
  }

  triggerBackgroundPopulate();
  return [];
}

/**
 * Returns the timestamp (ms) of the last successful backlog refresh, or null when
 * no cache entry exists yet. Cheap — reads the cache only, never calls GitHub.
 */
export async function getGitHubBacklogUpdatedAt(): Promise<number | null> {
  const meta = await getGitHubBacklogMeta();
  return meta.updatedAt;
}

/** Lightweight backlog cache status for live-update polling. */
export async function getGitHubBacklogMeta(): Promise<{
  updatedAt: number | null;
  isRefreshing: boolean;
}> {
  const cached = await readCache();
  return {
    updatedAt: cached?.updatedAt ?? null,
    isRefreshing: refreshInFlight !== null,
  };
}
