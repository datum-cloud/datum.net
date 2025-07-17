import type { APIRoute } from 'astro';
// import { db, Votes, Project } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const responseObj = {
    changelog: [
      {
        date: '2025-07-07',
        changes: [
          'Remove k8s config for postgres & use JSON file inside PV instead. Upgrade base framework.',
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
