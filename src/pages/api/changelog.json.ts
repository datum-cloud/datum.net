import type { APIRoute } from 'astro';
// import { db, Votes, Project } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const responseObj = {
    changelog: [
      {
        date: '2025-06-25',
        changes: ['Replace postgres with file-based storage.'],
      },
    ],
  };

  return new Response(JSON.stringify(responseObj, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
