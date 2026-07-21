// Dynamic markdown export of /platform/build. Reads the same sources the
// rendered page consumes (src/pages/platform/build.astro):
//   - src/content/pages/features/build/index.mdx (hub title + description)
//   - .../compute.mdx, object-storage.mdx, edge-apps.mdx
//     (one FeatureSection each, in render order)
export const prerender = false;

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders, extractFeatureBodyParts } from '@utils/pageMarkdown';

function stripHtml(input: string): string {
  return input.replace(/<\/?[^>]+>/g, '').trim();
}

export const GET: APIRoute = async () => {
  try {
    const [index, compute, objectStorage, edgeApps] = await Promise.all([
      getEntry('pages', 'features/build/index'),
      getEntry('pages', 'features/build/compute'),
      getEntry('pages', 'features/build/object-storage'),
      getEntry('pages', 'features/build/edge-apps'),
    ]);

    const sections: string[] = [`# ${stripHtml(index?.data.title ?? 'Build')}`, ''];
    if (index?.data.description) sections.push(index.data.description, '');

    for (const entry of [compute, objectStorage, edgeApps]) {
      if (!entry) continue;
      sections.push(`## ${entry.data.title}`, '');
      const { badge, linkHref, linkText } = extractFeatureBodyParts(entry.body);
      if (badge) sections.push(`_${badge}_`, '');
      if (entry.data.description) sections.push(entry.data.description, '');
      if (linkHref && linkText) sections.push(`[${linkText}](${linkHref})`, '');
    }

    const canonicalUrl = 'https://www.datum.net/platform/build/';
    sections.push('---', '', `Source: <${canonicalUrl}>`, '');

    const body = toAsciiMarkdown(sections.join('\n'));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /platform/build.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
