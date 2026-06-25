// Dynamic markdown export of /roadmap/backlog. Pulls from the same GitHub
// Projects source that RoadmapBacklog.astro renders from, so the list stays
// current without manual edits. SSR so cache invalidations propagate.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCollectionEntry } from '@utils/collectionUtils';
import { fetchGitHubBacklog } from '@libs/githubBacklog';
import type { GitHubBacklogItem } from '@libs/githubBacklog';
import { toAsciiMarkdown } from '@utils/markdownExport';

function renderItem(item: GitHubBacklogItem): string {
  const labels = item.labels.length > 0 ? ` _(${item.labels.join(', ')})_` : '';
  return `- [#${item.number} ${item.title}](${item.url})${labels}`;
}

export const GET: APIRoute = async () => {
  try {
    const [backlogPage, roadmapPage] = await Promise.all([
      getCollectionEntry('pages', 'backlog'),
      getCollectionEntry('pages', 'roadmap'),
    ]);

    const title = backlogPage?.data.title ?? 'Product Backlog';
    const description =
      backlogPage?.data.meta?.description ??
      backlogPage?.data.description ??
      roadmapPage?.data.description ??
      'Planned improvements and features not yet scheduled into a release cycle.';

    const items = await fetchGitHubBacklog();

    const sections: string[] = [
      `# ${title}`,
      '',
      description,
      '',
      `_${items.length} item${items.length === 1 ? '' : 's'} in the backlog._`,
    ];

    if (items.length === 0) {
      sections.push('', 'No backlog items available at this time.');
    } else {
      // Flat list matching the order the page renders — no grouping.
      sections.push('');
      for (const item of items) {
        sections.push(renderItem(item));
      }
    }

    sections.push(
      '',
      '---',
      '',
      'Want to propose a new feature? [Start a discussion on GitHub](https://github.com/orgs/datum-cloud/discussions/categories/feature-requests).',
      '',
      'Source: <https://www.datum.net/roadmap/backlog/>',
      ''
    );

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        // Backlog is cached for 24 h on GitHub's side; match that TTL.
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Failed to serve /roadmap/backlog.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
