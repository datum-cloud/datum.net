import type { APIRoute } from 'astro';
// import { db, Votes, Project } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const responseObj = {
    changelog: [
      {
        version: '1.0.1',
        date: '2025-06-19',
        changes: [
          'Initial release with basic functionality.',
          'Added voting system using postgress for projects.',
          'Implemented roadmap fetching from GitHub.',
        ],
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
