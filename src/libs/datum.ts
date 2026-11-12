import { graph } from '@libs/github';
import { Cache } from '@libs/cache';
import { DOCS_CHANGELOG_SOURCE_URL, parseDocsChangelog } from '@libs/changelogMdx';

const cache = new Cache('.cache');
const owner = 'datum-cloud';

type RoadmapProps = {
  id: string;
  title: string;
  body: string;
  url: string;
  labels?: { nodes: Array<{ name: string }> };
  hasVoted?: boolean;
  updated_at: Date;
};

type ChangelogProps = {
  id: string;
  title: string;
  body: string;
  url: string;
  createdAt: Date;
  product?: string;
  labels?: { nodes: Array<{ name: string; color: string; description?: string }> };
};

async function stargazerCount(isClientSide: boolean = false): Promise<number> {
  type ResponseProps = {
    repository: {
      stargazerCount: number;
    };
  };

  let stargazers = 0;
  const name = 'datum';

  if (await cache.has('stargazerCount')) {
    return (await cache.get<number>('stargazerCount')) ?? 0;
  }
  if (isClientSide) {
    try {
      const API_URL = `https://api.github.com/repos/${owner}/${name}`;
      const response = await fetch(API_URL);
      const data = await response.json();

      if (response.ok) {
        stargazers = data.stargazers_count || 0;
        await cache.set('stargazerCount', stargazers, 1000 * 60 * 5); // cache for 5 minutes
      }
    } catch {
      stargazers = 0;
    }
  } else {
    try {
      const query = `
          query ($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
              stargazerCount
            }
          }
        `;

      const variables = {
        owner,
        name,
      };

      const response = (await graph(query, variables)) as ResponseProps;
      stargazers = response.repository.stargazerCount || 0;
      await cache.set('stargazerCount', stargazers, 1000 * 60 * 10); // cache for 10 minutes
    } catch {
      stargazers = 0;
    }
  }
  return stargazers;
}

async function roadmaps(): Promise<RoadmapProps[]> {
  type ResponseProps = {
    repository: {
      issues: {
        nodes: [
          {
            id: string;
            title: string;
            body: string;
            url: string;
            labels: {
              nodes: Array<{
                name: string;
              }>;
            };
          },
        ];
      };
    };
  };
  let roadmaps: RoadmapProps[] = [];

  if (await cache.has('roadmaps')) {
    return (await cache.get<RoadmapProps[]>('roadmaps')) ?? [];
  }
  {
    try {
      const query = `
          query ($owner: String!, $name: String!, $labels: String!) {
            repository(owner: $owner, name: $name) {
              issues(first: 30, filterBy: { states: OPEN, labels: [$labels] }) {
                nodes {
                  id
                  title
                  body
                  url
                  labels(first: 10) {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
          }
        `;

      const variables = {
        owner: owner,
        name: 'enhancements',
        labels: 'Roadmap Vote',
      };

      const response = (await graph(query, variables)) as ResponseProps;

      if (!response || !response.repository || !response.repository.issues) {
        return roadmaps;
      }
      roadmaps = Object(response.repository.issues.nodes).map((issue: RoadmapProps) => ({
        ...issue,
      }));
    } catch {
      roadmaps = [];
    }

    if (roadmaps.length > 0) {
      await cache.set('roadmaps', roadmaps, 1000 * 60 * 10); // cache for 30 minutes
    }
  }
  return roadmaps;
}

// Source of truth is the Mintlify changelog (/docs/changelog), so the
// marketing page always matches the docs. Errors are logged and not cached,
// so the next request retries.
async function changelogs(): Promise<ChangelogProps[]> {
  if (await cache.has('changelogs')) {
    return (await cache.get<ChangelogProps[]>('changelogs')) ?? [];
  }

  try {
    const response = await fetch(DOCS_CHANGELOG_SOURCE_URL, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${DOCS_CHANGELOG_SOURCE_URL}`);
    }
    const entries = parseDocsChangelog(await response.text());
    await cache.set('changelogs', entries, 1000 * 60 * 20); // cache for 20 minutes
    return entries;
  } catch (error) {
    console.error('Failed to load changelog from docs:', error);
    return [];
  }
}

export { stargazerCount, roadmaps, changelogs, type RoadmapProps, type ChangelogProps };
