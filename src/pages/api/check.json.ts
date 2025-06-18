import type { APIRoute } from 'astro';
import { db, Votes, Project } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const responseObj = {
    changelog: [
      {
        import_ASTRO_DB_REMOTE_URL: import.meta.env.ASTRO_DB_REMOTE_URL || 'Not set',
        import_ASTRO_DB_APP_TOKEN: import.meta.env.ASTRO_DB_APP_TOKEN ? '***' : 'Not set',
        process_ASTRO_DB_REMOTE_URL: process.env.ASTRO_DB_REMOTE_URL || 'Not set',
        process_ASTRO_DB_APP_TOKEN: process.env.ASTRO_DB_APP_TOKEN ? '***' : 'Not set',
        issues: await db.select().from(Project),
        votes: await db.select().from(Votes),
        db,
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
