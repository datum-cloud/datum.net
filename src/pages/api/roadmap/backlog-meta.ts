// src/pages/api/roadmap/backlog-meta.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { getGitHubBacklogUpdatedAt } from '@libs/githubBacklog';

export const GET: APIRoute = async () => {
  const updatedAt = await getGitHubBacklogUpdatedAt();

  return new Response(JSON.stringify({ updatedAt }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
