// src/libs/githubRoadmap.ts
/**
 * GitHub Milestones roadmap fetcher.
 *
 * Fetches milestones from the datum-cloud/enhancements repo via the GraphQL
 * API to drive the /roadmap Upcoming/Shipped tabs. Cover images are resolved
 * separately from static repo assets (see `getRoadmapCoverImage`).
 *
 * Cache strategy:
 *  - Redis (when REDIS_URL is set): key `${redisKeyPrefix}github:roadmaps`, TTL 1 day
 *    (the github-milestone webhook invalidates this actively on status changes;
 *    the TTL is just a fallback)
 *  - In-memory Map: fallback for local dev (single-instance, no persistence)
 *
 * Auth: uses existing APP_ID / APP_PRIVATE_KEY / APP_INSTALLATION_ID env vars
 * via the `graph()` helper in `src/libs/github.ts`.
 */

import { graph } from './github';
import { redisClient, redisKeyPrefix } from './strapi/_runtime';

export interface RoadmapMilestone {
  number: number;
  title: string;
  slug: string;
  summary?: string;
  releaseDate: string;
  githubUrl: string;
  shipped: boolean;
}

const GITHUB_ORG = 'datum-cloud';
const GITHUB_REPO = 'enhancements';
// The github-milestone webhook actively invalidates this cache on status
// changes, so the TTL is just a fallback safety net rather than the primary
// refresh mechanism.
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 1 day

const REDIS_CACHE_KEY = `${redisKeyPrefix}github:roadmaps`;

/** Logical cache name for admin force-regen (`POST /api/cache/strapi`). */
export const GITHUB_ROADMAPS_CACHE_KEY = 'github-roadmaps';

/** Module-level in-memory cache for local dev (no Redis). */
const memCache = {
  data: null as RoadmapMilestone[] | null,
  expiresAt: 0,
};

const ROADMAP_MILESTONES_QUERY = `
  query GetRoadmapMilestones($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      milestones(first: 100, after: $cursor, states: [OPEN, CLOSED]) {
        nodes {
          number
          title
          description
          dueOn
          state
          url
          issues(first: 100) {
            nodes {
              number
              title
              url
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
`;

interface GitHubMilestoneIssueNode {
  number?: number;
  title?: string;
  url?: string;
}

interface GitHubMilestoneNode {
  number?: number;
  title?: string;
  description?: string | null;
  dueOn?: string | null;
  state?: string;
  url?: string;
  issues?: { nodes: GitHubMilestoneIssueNode[] };
}

interface GitHubMilestonesPage {
  nodes: GitHubMilestoneNode[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface GitHubMilestonesResponse {
  repository: {
    milestones: GitHubMilestonesPage;
  };
}

function isValidCachedMilestone(item: unknown): item is RoadmapMilestone {
  if (!item || typeof item !== 'object') return false;
  const record = item as Record<string, unknown>;
  return (
    typeof record.number === 'number' &&
    typeof record.title === 'string' &&
    typeof record.slug === 'string' &&
    typeof record.releaseDate === 'string' &&
    typeof record.githubUrl === 'string' &&
    typeof record.shipped === 'boolean'
  );
}

function isValidCachedMilestones(items: unknown): items is RoadmapMilestone[] {
  return Array.isArray(items) && items.every(isValidCachedMilestone);
}

function sortMilestones(items: RoadmapMilestone[]): RoadmapMilestone[] {
  return [...items].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
}

/** Read cached roadmap milestones from Redis. Returns null on miss or error. */
async function readFromRedis(): Promise<RoadmapMilestone[] | null> {
  if (!redisClient) return null;
  try {
    const raw = await redisClient.get(REDIS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidCachedMilestones(parsed)) {
      console.warn('[githubRoadmap] Invalid cached roadmaps data detected, refetching');
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[githubRoadmap] Redis read error:', err);
    return null;
  }
}

/** Write roadmap milestones to Redis with TTL. Silently logs on error. */
async function writeToRedis(items: RoadmapMilestone[]): Promise<void> {
  if (!redisClient) return;
  try {
    await redisClient.set(REDIS_CACHE_KEY, JSON.stringify(items), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    console.warn('[githubRoadmap] Redis write error:', err);
  }
}

/** Escape HTML special characters so issue titles can't inject markup into the rendered summary. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Build a markdown list of issues linked to a milestone, for appending to its description. */
function buildIssuesListMarkdown(issues: GitHubMilestoneIssueNode[]): string {
  const validIssues = issues.filter(
    (issue): issue is Required<GitHubMilestoneIssueNode> =>
      typeof issue.number === 'number' &&
      typeof issue.title === 'string' &&
      typeof issue.url === 'string'
  );
  if (validIssues.length === 0) return '';

  const items = validIssues
    .map(
      (issue) =>
        `<li>${escapeHtml(issue.title)} <a href="${issue.url}" target="_blank" rel="noopener noreferrer">#${issue.number}</a></li>`
    )
    .join('');
  return `<div><p style="margin-bottom: 2rem;"><strong>What's included in this milestone:</strong></p><ul style="margin-top: 0;">${items}</ul></div>`;
}

/** Fetch all milestone pages from the GitHub GraphQL API. */
async function fetchFromGitHub(): Promise<RoadmapMilestone[]> {
  const items: RoadmapMilestone[] = [];
  let cursor: string | null = null;

  while (true) {
    const variables: Record<string, unknown> = {
      owner: GITHUB_ORG,
      name: GITHUB_REPO,
    };
    if (cursor) variables.cursor = cursor;

    let data: unknown;
    try {
      data = await graph(ROADMAP_MILESTONES_QUERY, variables);
    } catch (err) {
      console.error('[githubRoadmap] GraphQL fetch error:', err);
      break;
    }

    const response = data as GitHubMilestonesResponse | null;
    const page = response?.repository?.milestones;
    if (!page) break;

    for (const node of page.nodes) {
      if (typeof node.number !== 'number' || !node.title || !node.dueOn) continue;

      const issuesMarkdown = buildIssuesListMarkdown(node.issues?.nodes ?? []);
      const summaryParts = [node.description, issuesMarkdown].filter((part): part is string =>
        Boolean(part && part.trim())
      );

      items.push({
        number: node.number,
        title: node.title,
        slug: getRoadmapSlug({ title: node.title }),
        summary: summaryParts.length > 0 ? summaryParts.join('\n\n') : undefined,
        releaseDate: node.dueOn,
        githubUrl: node.url ?? `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`,
        shipped: node.state === 'CLOSED',
      });
    }

    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break;
    cursor = page.pageInfo.endCursor;
  }

  return sortMilestones(items);
}

/** Returns true when a non-expired roadmap milestones cache entry exists. */
export async function isGitHubRoadmapsCached(): Promise<boolean> {
  if (redisClient) {
    try {
      return (await redisClient.get(REDIS_CACHE_KEY)) !== null;
    } catch {
      return false;
    }
  }
  return memCache.data !== null && Date.now() < memCache.expiresAt;
}

/** Clear Redis and in-memory roadmap milestones cache without refetching. */
export async function clearGitHubRoadmapsCache(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(REDIS_CACHE_KEY);
    } catch (err) {
      console.warn('[githubRoadmap] Redis delete error:', err);
    }
  }
  memCache.data = null;
  memCache.expiresAt = 0;
}

/**
 * Clear roadmap milestones cache and fetch fresh data from GitHub.
 * @throws When the GitHub fetch fails after cache was cleared
 */
export async function forceRegenerateGitHubRoadmaps(): Promise<RoadmapMilestone[]> {
  await clearGitHubRoadmapsCache();
  const items = await fetchFromGitHub();
  await writeToRedis(items);

  if (!redisClient) {
    memCache.data = items;
    memCache.expiresAt = Date.now() + CACHE_TTL_SECONDS * 1000;
  }

  return items;
}

/**
 * Fetch roadmap milestones from the datum-cloud/enhancements GitHub repo.
 *
 * Cache read order:
 *  1. Redis (if configured) — 30-min TTL
 *  2. In-memory map (local dev, single-instance)
 *  3. Live fetch from GitHub API → write result back to cache
 *
 * Never throws — returns empty array on complete failure.
 */
export async function fetchGitHubRoadmaps(): Promise<RoadmapMilestone[]> {
  // 1. Try Redis
  const cached = await readFromRedis();
  if (cached) return cached;

  // 2. Try in-memory (local dev / no Redis)
  if (
    !redisClient &&
    memCache.data &&
    Date.now() < memCache.expiresAt &&
    isValidCachedMilestones(memCache.data)
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
    console.error('[githubRoadmap] Failed to fetch roadmap milestones:', err);
    return [];
  }
}

export interface GroupedRoadmaps {
  upcoming: RoadmapMilestone[];
  previous: RoadmapMilestone[];
}

export function isRoadmapShipped(milestone: Pick<RoadmapMilestone, 'shipped'>): boolean {
  return milestone.shipped === true;
}

/**
 * Group roadmaps into upcoming and previous based on shipped status.
 * releaseDate is a due date (target completion), not a ship date, so a
 * closed milestone is "previous" even if its due date hasn't passed yet.
 */
export function groupRoadmapsByDate(roadmaps: RoadmapMilestone[]): GroupedRoadmaps {
  const upcoming: RoadmapMilestone[] = [];
  const previous: RoadmapMilestone[] = [];

  for (const roadmap of roadmaps) {
    (isRoadmapShipped(roadmap) ? previous : upcoming).push(roadmap);
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
 * Extract the release codename from a milestone title, stripping the redundant
 * month/year prefix GitHub milestones are named with (e.g. `August 2026 - "Armstrong"` → `Armstrong`).
 * Falls back to a legacy "Name: Version" format, then the raw title.
 */
export function getRoadmapReleaseName(title: string): string {
  const quotedNameMatch = title.match(/"([^"]+)"/);
  if (quotedNameMatch?.[1]) return quotedNameMatch[1].trim();

  const titleParts = title.split(':');
  return titleParts[0]?.trim() ?? title;
}

/**
 * Browser-tab title for a roadmap detail page, e.g. `August 2026 "Armstrong" Release - Datum Roadmap`.
 * `milestone.title` already carries the month/year (`August 2026 - "Armstrong"`), so this must not
 * append another formatted date on top of it (see datum-cloud/datum.net#1737).
 */
export function getRoadmapPageTitle(
  milestone: Pick<RoadmapMilestone, 'title' | 'releaseDate' | 'shipped'>
): string {
  const formattedDate = new Date(milestone.releaseDate).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const releaseName = getRoadmapReleaseName(milestone.title);
  const kind = milestone.shipped ? 'Release' : 'Milestone';
  return `${formattedDate} "${releaseName}" ${kind} - Datum Roadmap`;
}

/**
 * Hand-written SEO descriptions per roadmap milestone, keyed by slug (@see getRoadmapSlug).
 * The milestone `summary` is release-note HTML (including an inline-styled issue list) meant
 * for the page body — it must never be dumped into `<meta name="description">` verbatim (see
 * datum-cloud/datum.net#1737). There's no formulaic way to derive good SEO copy from that HTML,
 * so this is a manually curated override map; unlisted milestones fall back to a stripped,
 * truncated version of the summary via `getRoadmapSeoDescription`.
 */
const ROADMAP_SEO_DESCRIPTIONS: Record<string, string> = {
  'august-2026-armstrong':
    "Datum's August 2026 Armstrong release: an Internet NAT66 gateway for Galactic VPC, billing for Datum Compute, horizontal autoscaling, and customer-facing logs.",
  'september-2026-brother-ray':
    "What shipped in Datum's September 2026 Brother Ray release: Datum Compute for instant secure workloads, a NAT64 gateway for Galactic VPC, and BIMI.",
  'november-2026-lovelace':
    "See what's planned for Datum's November 2026 Lovelace milestone, track the open issues on GitHub, and request or vote for the features you want next.",
  'june-2026-katherine':
    "What shipped in Datum's June 2026 Katherine release: a reworked quota page with display names and product grouping across Datum Cloud services.",
  'january-2026-mary-elizabeth':
    "What shipped in Datum's January 2026 Mary Elizabeth release: the Datum Desktop MVP, apex ALIAS records for DNS, and Grafana metrics export.",
  'march-2026-dolores':
    "What shipped in Datum's March 2026 Dolores release: service accounts, one-click WAF, fine-grained roles, and on-demand access with the waitlist retired.",
  'december-2026-hopper':
    "See what's planned for Datum's December 2026 Hopper milestone, the final release of the year, and vote for the features you want on the open roadmap.",
  'july-2026-kwolek':
    "What shipped in Datum's July 2026 Kwolek release: the Platform and Dedicated Cloud landing pages, a new onboarding flow, and billing accounts.",
  'april-2026-thuerk':
    "What shipped in Datum's April 2026 Thuerk release: HTTP/3 at the edge, datumctl contexts, the Iroh Gateway, and the first public Agent Skills.",
  'october-2026-hedy':
    "See what's planned for Datum's October 2026 Hedy milestone, follow the issues on GitHub, and vote for the features you want next on the open roadmap.",
  'may-2026-timbl':
    "What shipped in Datum's May 2026 TimBL release: Galactic VPC underlay design, activity timelines across the portal, and usage billing and metering.",
  'february-2026-blankenbaker':
    "What shipped in Datum's February 2026 Blankenbaker release: Datum Desktop, configurable WAF at the proxy and path level, and semantic activity logs.",
};

/** Strip tags and collapse whitespace, for a summary-derived meta description fallback. */
function stripHtmlForDescription(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MAX_SEO_DESCRIPTION_LENGTH = 160;

/**
 * SEO meta description for a roadmap detail page. Prefers the curated override above;
 * falls back to a plain-text, length-capped version of the milestone summary rather than
 * the raw HTML that used to leak into the meta tag.
 */
export function getRoadmapSeoDescription(
  milestone: Pick<RoadmapMilestone, 'slug' | 'summary' | 'releaseDate'>
): string {
  const override = ROADMAP_SEO_DESCRIPTIONS[milestone.slug];
  if (override) return override;

  if (milestone.summary) {
    const plainText = stripHtmlForDescription(milestone.summary);
    if (plainText) {
      return plainText.length > MAX_SEO_DESCRIPTION_LENGTH
        ? `${plainText.slice(0, MAX_SEO_DESCRIPTION_LENGTH - 1).trimEnd()}…`
        : plainText;
    }
  }

  const formattedDate = new Date(milestone.releaseDate).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return `Datum roadmap for ${formattedDate}.`;
}

/** URL slug for roadmap detail pages, derived from the milestone title. */
export function getRoadmapSlug(milestone: Pick<RoadmapMilestone, 'title'>): string {
  return milestone.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

/** Build-time manifest of static roadmap cover images, keyed by milestone number. */
const coverImageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/roadmap/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

const coverImagesByNumber = new Map<number, ImageMetadata>();
for (const [path, mod] of Object.entries(coverImageModules)) {
  const match = path.match(/\/(\d+)\.[a-z]+$/i);
  if (!match) continue;
  coverImagesByNumber.set(Number(match[1]), mod.default);
}

/** Resolve the static cover image asset for a milestone, keyed by milestone number. */
export function getRoadmapCoverImage(number: number): ImageMetadata | undefined {
  return coverImagesByNumber.get(number);
}
