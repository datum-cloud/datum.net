// Dynamic markdown export of /contact. Reads the same source the rendered
// page consumes:
//   - src/content/pages/contact.mdx (title + body)
// The founder-CTA card is composed directly in contact.astro (no content-
// collection backing), so it's transcribed by hand below.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { markdownSeoHeaders, renderEntryMarkdown } from '@utils/pageMarkdown';

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'contact');
    if (!page) return new Response('Not found', { status: 404 });

    const canonicalUrl = 'https://www.datum.net/contact';
    const body = renderEntryMarkdown(page, {
      trailingSections: [
        [
          '## Schedule time with a founder',
          '',
          'Connect with a founder for coffee, questions or idea sharing.',
          '',
          '[Book a time](https://link.datum.net/founders)',
        ].join('\n'),
      ],
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
    console.error('Failed to serve /contact.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
