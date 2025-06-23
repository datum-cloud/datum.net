import type { APIRoute } from 'astro';
// import { db, Votes, Project } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const responseObj = {
    changelog: [
      {
        date: '2025-06-23',
        changes: ['Create k8s config for postgres.'],
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
