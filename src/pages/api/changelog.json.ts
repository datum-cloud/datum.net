import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const responseObj = {
    changelog: [
      {
        version: '1.0.0',
        date: '2025-06-11',
        changes: ['roadmap', 'voting'],
        description: 'Initial release with roadmap and voting features.',
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
