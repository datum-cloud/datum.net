// Dynamic markdown export of /roadmap/<slug> detail pages. Pulls from the
// same GitHub milestones source that RoadmapDetailContent.astro renders from.
// SSR so cache invalidations propagate immediately.
export const prerender = false;

import type { APIRoute } from 'astro';
import { fetchGitHubRoadmaps, getRoadmapMonthKey, getRoadmapSlug } from '@libs/githubRoadmap';
import { STRAPI_SSR_CACHE_CONTROL } from '@libs/strapi/httpCache';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug || typeof slug !== 'string') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const roadmaps = await fetchGitHubRoadmaps();
    let roadmap = roadmaps.find((entry) => entry.slug === slug);

    // Legacy YYYY-MM slugs: resolve to canonical slug the same way [slug].astro does.
    if (!roadmap && /^\d{4}-\d{2}$/.test(slug)) {
      const match = roadmaps.find((r) => getRoadmapMonthKey(r.releaseDate) === slug);
      if (match) {
        const canonical = getRoadmapSlug(match);
        if (canonical !== slug) {
          return new Response(null, {
            status: 301,
            headers: { Location: `/roadmap/${canonical}.md` },
          });
        }
        roadmap = match;
      }
    }

    if (!roadmap) {
      return new Response('Not found', { status: 404 });
    }

    const releaseDate = new Date(roadmap.releaseDate);
    const formattedDate = releaseDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const titleParts = roadmap.title.split(':');
    const releaseName = titleParts[0]?.trim() ?? roadmap.title;

    const sections: string[] = [`# ${releaseName} - ${formattedDate} Roadmap`, ''];

    if (roadmap.summary) {
      sections.push(roadmap.summary, '');
    } else {
      sections.push('_Release notes coming soon._', '');
    }

    if (roadmap.githubUrl) {
      sections.push(`[View on GitHub](${roadmap.githubUrl})`, '');
    }

    const canonicalUrl = `https://www.datum.net/roadmap/${slug}`;
    sections.push('---', '', `Source: <${canonicalUrl}>`, '');

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': STRAPI_SSR_CACHE_CONTROL,
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error(`Failed to serve /roadmap/${slug}.md:`, error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
