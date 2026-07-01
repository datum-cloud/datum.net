// /download/<slug>.md endpoint. Lives here (not in the top-level catch-all)
// because src/pages/download/[slug].astro is SSR-only and grabs any segment
// — including ones ending in ".md" — before a top-level catch-all gets a
// chance to match. A sibling .md.ts file is the only way to make Astro
// route the ".md" variant specifically.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry, getCollection } from 'astro:content';
import { markdownSeoHeaders, renderEntryMarkdown } from '@utils/pageMarkdown';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = (await getCollection('download')) as Array<{ id: string }>;
  return entries.map((e) => ({ params: { slug: e.id }, props: { entryId: e.id } }));
};

export const GET: APIRoute = async ({ props }) => {
  const { entryId } = props as { entryId: string };
  try {
    const entry = await getEntry('download', entryId);
    if (!entry) return new Response('Not found', { status: 404 });
    const canonicalUrl = `https://www.datum.net/download/${entryId}/`;
    const body = renderEntryMarkdown(entry, {
      demoteHeadings: true,
      sourceUrl: canonicalUrl,
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (err) {
    console.error(`/download/${entryId}.md failed:`, err);
    return new Response('Error generating markdown', { status: 500 });
  }
};
