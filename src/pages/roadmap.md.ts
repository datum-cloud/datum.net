// Dynamic markdown export of /roadmap. Pulls from the same Strapi source
// that RoadmapStrapi.astro renders from, so this stays in sync with each
// monthly release cycle without manual edits. SSR so Strapi webhook cache
// invalidations propagate immediately.
export const prerender = false;

import type { APIRoute } from 'astro';
import {
  fetchStrapiRoadmaps,
  groupRoadmapsByDate,
  getMonthAbbreviation,
  getRoadmapSlug,
} from '@libs/strapi';
import type { StrapiRoadmap } from '@libs/strapi';
import { STRAPI_SSR_CACHE_CONTROL } from '@libs/strapi/httpCache';
import { toAsciiMarkdown } from '@utils/markdownExport';

function renderMilestone(roadmap: StrapiRoadmap, includeDetail: boolean): string {
  const month = getMonthAbbreviation(roadmap.releaseDate);
  const lines: string[] = [`### ${month} - ${roadmap.title}`];
  if (roadmap.description) {
    lines.push('', roadmap.description);
  }
  if (includeDetail && roadmap.summary) {
    lines.push('', roadmap.summary);
  }
  if (roadmap.githubUrl) {
    lines.push('', `[GitHub](${roadmap.githubUrl})`);
  }
  if (includeDetail) {
    const slug = getRoadmapSlug(roadmap);
    lines.push('', `[Full details](/roadmap/${slug}.md)`);
  }
  return lines.join('\n');
}

export const GET: APIRoute = async () => {
  try {
    const roadmaps = await fetchStrapiRoadmaps();
    const { upcoming, previous } = groupRoadmapsByDate(roadmaps);

    const sections: string[] = [
      '# Roadmap',
      '',
      "We plan and ship in monthly cycles. Each cycle is named for a cultural, literary or scientific pioneer whose story connects to the work we're doing.",
      '',
      "Here's a view of the road ahead. Vote for your favorites, or [request a new feature on GitHub](https://github.com/orgs/datum-cloud/discussions/categories/feature-requests).",
      '',
      'See also: [Product Backlog](/roadmap/backlog.md) - features planned but not yet assigned to a release.',
    ];

    if (upcoming.length > 0) {
      sections.push('', '## Upcoming');
      for (const r of upcoming) {
        sections.push('', renderMilestone(r, true));
      }
    }

    if (previous.length > 0) {
      sections.push('', '## Previous milestones');
      for (const r of previous) {
        sections.push('', renderMilestone(r, false));
      }
    }

    if (upcoming.length === 0 && previous.length === 0) {
      sections.push('', 'No roadmap milestones available yet.');
    }

    sections.push(
      '',
      '## How we plan',
      '',
      '- **Monthly release cycles** - One named cycle per month, scoped tight and shipped end-to-end.',
      '- **Public discussion** - Roadmap items live on GitHub Discussions where the community can vote, comment, and propose alternatives.',
      '- **Open development** - The platform is AGPLv3. Code, issues, and design docs are all in the open at [github.com/datum-cloud](https://github.com/datum-cloud).',
      '',
      '---',
      '',
      'Source: <https://www.datum.net/roadmap/>',
      ''
    );

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': STRAPI_SSR_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error('Failed to serve /roadmap.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
