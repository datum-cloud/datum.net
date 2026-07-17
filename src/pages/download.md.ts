// Dynamic markdown export of /download. Reads the same sources the rendered
// page consumes:
//   - src/content/pages/download.mdx (title + body)
//   - src/content/download/*.mdx     (one entry per downloadable tool/SDK)
// Adding or renaming a download entry updates this endpoint on next request.
import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { markdownSeoHeaders, renderEntryMarkdown } from '@utils/pageMarkdown';

/** download/mac-os, download/windows, download/linux all reuse the generic
 * "Download now" title — display OS names instead for a readable list. */
const OS_LABELS: Record<string, string> = {
  'mac-os': 'macOS',
  windows: 'Windows',
  linux: 'Linux',
};

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'download');
    if (!page) return new Response('Not found', { status: 404 });

    const entries = (await getCollection('download')).sort(
      (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
    );

    const list = entries.map((entry) => {
      const label = OS_LABELS[entry.id] ?? entry.data.title;
      return `- [${label}](/download/${entry.id}/) - ${entry.data.description}`;
    });

    const canonicalUrl = 'https://www.datum.net/download/';
    const body = renderEntryMarkdown(page, {
      trailingSections: list.length ? [['## Available downloads', '', ...list].join('\n')] : [],
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
    console.error('Failed to serve /download.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
