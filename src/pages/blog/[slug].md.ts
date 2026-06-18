// Serves a Strapi-backed blog article as raw markdown at /blog/<slug>.md.
//
// The route is SSR (prerender = false) because article content lives in
// Strapi and changes between deploys — webhook invalidates the article
// cache, but no rebuild is required.
export const prerender = false;

import type { APIRoute } from 'astro';
import { ensureStrapiArticleDetail } from '@libs/strapi';
import { STRAPI_SSR_CACHE_CONTROL } from '@libs/strapi/httpCache';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug || typeof slug !== 'string') {
    return new Response('Not found', { status: 404 });
  }

  try {
    const article = await ensureStrapiArticleDetail(slug);
    if (!article) {
      return new Response('Not found', { status: 404 });
    }

    const body = (article.blocks ?? [])
      .map((block) => block.body ?? '')
      .filter(Boolean)
      .join('\n\n');

    const title = article.title ? `# ${article.title}\n\n` : '';
    const description = article.description ? `> ${article.description}\n\n` : '';

    return new Response(`${title}${description}${body}`, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': STRAPI_SSR_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(`Failed to serve /blog/${slug}.md:`, error);
    return new Response('Error generating markdown', { status: 500 });
  }
};
