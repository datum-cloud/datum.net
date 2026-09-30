// Markdown export of /about/in-the-wild. Reads the same source the page
// renders: src/data/about.ts (intro and story captions).
import type { APIRoute } from 'astro';
import { inTheWild } from '@data/about';
import { toAsciiMarkdown } from '@utils/markdownExport';
import { markdownSeoHeaders } from '@utils/pageMarkdown';

export const GET: APIRoute = () => {
  try {
    const sections: string[] = [
      `# ${inTheWild.crumb}`,
      '',
      inTheWild.introTitle.join(' '),
      '',
      inTheWild.intro,
      '',
    ];

    for (const column of inTheWild.columns) {
      for (const story of column) {
        sections.push(`## ${story.title}`, '', story.description, '');
      }
    }

    const canonicalUrl = 'https://www.datum.net/about/in-the-wild';
    sections.push('---', '', `Source: <${canonicalUrl}>`, '');

    return new Response(toAsciiMarkdown(sections.join('\n')), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /about/in-the-wild.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
