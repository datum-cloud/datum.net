// src/pages/.well-known/mcp/server-card.json.ts
//
// See src/data/mcpServerCard.ts for the content, and
// src/pages/mcp/server-card.ts for the identical clean-URL alias.
//
// prerender = false: server.mjs's static-file pipeline (sirv/serveCompressed)
// sets Content-Type purely from the file extension, which would silently
// downgrade the custom `application/mcp-server-card+json` below to a plain
// `application/json` on a prerendered route — same reason
// WELL_KNOWN_CONTENT_TYPES exists in server.mjs for the *static* well-known
// files. Rendering on-demand keeps the header this route actually sets.
export const prerender = false;

import type { APIRoute } from 'astro';
import { mcpServerCard } from '@data/mcpServerCard';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(mcpServerCard, null, 2), {
    headers: {
      'Content-Type': 'application/mcp-server-card+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
