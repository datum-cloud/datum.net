// Catch-all markdown endpoint. Handles every content-collection-backed URL
// that matches a pattern in src/utils/markdownRegistry.ts:
//
//   /download/<slug>        -> download collection
//   /legal/<slug>           -> legal collection
//   /handbook/<...id>       -> handbooks collection
//   /brand/<slug>           -> pages collection, id "brand/<slug>"
//
// Astro routes specific files (e.g. src/pages/pricing.md.ts) before this
// catch-all, so per-page customisation still works via dedicated endpoints.

import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry } from 'astro:content';
import { getMarkdownRegistry } from '@utils/markdownRegistry';
import { renderEntryMarkdown } from '@utils/pageMarkdown';

export const getStaticPaths: GetStaticPaths = async () => {
  const registry = await getMarkdownRegistry();
  return Array.from(registry.entries()).map(([path, source]) => ({
    // Strip the leading slash — Astro's [...mdslug] matches the remaining
    // segments without it.
    params: { mdslug: path.replace(/^\/+/, '') },
    props: { collection: source.collection, entryId: source.entryId, urlPath: path },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { collection, entryId, urlPath } = props as {
    collection: string;
    entryId: string;
    urlPath: string;
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entry = await getEntry(collection as any, entryId);
    if (!entry) return new Response('Not found', { status: 404 });

    const body = renderEntryMarkdown(entry, {
      // Demote body headings so a body-level H1 doesn't compete with the
      // frontmatter title. Safe for all pages — pages without a body H1
      // are unaffected.
      demoteHeadings: true,
      sourceUrl: `https://www.datum.net${urlPath}/`,
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error(`Catch-all markdown failed for ${urlPath}:`, error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
