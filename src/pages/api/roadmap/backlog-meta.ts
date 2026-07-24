// src/pages/api/roadmap/backlog-meta.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { getGitHubBacklogMeta } from '@libs/githubBacklog';

export const GET: APIRoute = async () => {
  const meta = await getGitHubBacklogMeta();

  return new Response(JSON.stringify(meta), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
