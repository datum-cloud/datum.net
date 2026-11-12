// Dynamic markdown export of /changelog. Pulls from the same Mintlify
// changelog (/docs/changelog) that Card.astro renders from. SSR so new docs
// entries show up without a site rebuild.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { changelogs } from '@libs/datum';
import { markdownSeoHeaders, renderEntryMarkdown } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const index = await getEntry('changelog', 'index');
    const entries = await changelogs();

    const sections: string[] = [];
    for (const entry of entries) {
      const date = new Date(entry.createdAt).toISOString().slice(0, 10);
      sections.push(`## ${entry.title} - ${date}`);
      const tags = entry.labels?.nodes.map((l) => l.name) ?? [];
      if (tags.length) sections.push('', `_${tags.join(', ')}_`);
      if (entry.body) sections.push('', entry.body);
      sections.push('');
    }

    const canonicalUrl = 'https://www.datum.net/changelog';
    const body = renderEntryMarkdown(index ?? { data: { title: 'Changelog' } }, {
      trailingSections: sections.length ? [sections.join('\n').trim()] : [],
      sourceUrl: canonicalUrl,
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /changelog.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
