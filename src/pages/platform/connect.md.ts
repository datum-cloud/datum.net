// Dynamic markdown export of /platform/connect. Reads the same sources the
// rendered page consumes (src/pages/platform/connect.astro):
//   - src/content/pages/features/connect/index.mdx (hub title + description)
//   - .../galactic-vpc.mdx, connectors.mdx, interconnect.mdx
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
    const [index, galacticVpc, connectors, interconnect] = await Promise.all([
      getEntry('pages', 'features/connect/index'),
      getEntry('pages', 'features/connect/galactic-vpc'),
      getEntry('pages', 'features/connect/connectors'),
      getEntry('pages', 'features/connect/interconnect'),
    ]);

    const sections: string[] = [`# ${stripHtml(index?.data.title ?? 'Connect')}`, ''];
    if (index?.data.description) sections.push(index.data.description, '');

    for (const entry of [galacticVpc, connectors, interconnect]) {
      if (!entry) continue;
      sections.push(`## ${entry.data.title}`, '');
      const { badge, linkHref, linkText } = extractFeatureBodyParts(entry.body);
      if (badge) sections.push(`_${badge}_`, '');
      if (entry.data.description) sections.push(entry.data.description, '');
      if (linkHref && linkText) sections.push(`[${linkText}](${linkHref})`, '');
    }

    const canonicalUrl = 'https://www.datum.net/platform/connect';
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
    console.error('Failed to serve /platform/connect.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
