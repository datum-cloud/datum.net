// Dynamic markdown export of /dedicated-cloud. Reads the same source the
// rendered page consumes:
//   - src/data/dedicatedCloud.ts (title + description + checklist)
// Shared with dedicated-cloud.astro so the two can't drift out of sync.
import type { APIRoute } from 'astro';
import { title, description, checklist } from '@data/dedicatedCloud';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const sections: string[] = [`# ${title}`, '', description, ''];

    for (const item of checklist) {
      sections.push(`- **${item.title}** - ${item.description}`);
    }
    sections.push('');

    const canonicalUrl = 'https://www.datum.net/dedicated-cloud';
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
    console.error('Failed to serve /dedicated-cloud.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
