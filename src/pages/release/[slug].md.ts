import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ params, redirect }) => {
  const slug = params.slug;
  if (!slug) return new Response('Not found', { status: 404 });
  return redirect(`/releases/${slug}.md`, 301);
};
