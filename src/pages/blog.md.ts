// Markdown listing of /blog. Includes the landing page intro from
// pages/blog.mdx plus a list of recent Strapi articles. Per-article markdown
// is served separately by src/pages/blog/[slug].md.ts.
export const prerender = false;

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { fetchStrapiArticles } from '@libs/strapi';
import type { StrapiArticle } from '@libs/strapi';
import { markdownSeoHeaders, renderEntryMarkdown } from '@utils/pageMarkdown';
import { STRAPI_SSR_CACHE_CONTROL } from '@libs/strapi/httpCache';

function formatDate(d?: string): string {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
}

export const GET: APIRoute = async () => {
  try {
    const page = await getEntry('pages', 'blog');
    const articles = (await fetchStrapiArticles()) as StrapiArticle[];

    const sorted = [...articles].sort((a, b) => {
      const da = a.originalPublishedAt ? new Date(a.originalPublishedAt).getTime() : 0;
      const db = b.originalPublishedAt ? new Date(b.originalPublishedAt).getTime() : 0;
      return db - da;
    });

    const list: string[] = ['## Posts', ''];
    for (const a of sorted) {
      const url = `/blog/${a.slug}`;
      const date = formatDate(a.originalPublishedAt);
      const meta = date ? ` (${date})` : '';
      list.push(`- [${a.title}](${url})${meta}${a.description ? ` - ${a.description}` : ''}`);
    }

    const canonicalUrl = 'https://www.datum.net/blog/';
    const body = renderEntryMarkdown(page ?? { data: { title: 'Blog' } }, {
      trailingSections: [list.join('\n')],
      sourceUrl: canonicalUrl,
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': STRAPI_SSR_CACHE_CONTROL,
        ...markdownSeoHeaders(canonicalUrl),
      },
    });
  } catch (error) {
    console.error('Failed to serve /blog.md:', error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
