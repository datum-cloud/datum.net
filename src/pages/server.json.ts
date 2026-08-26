// src/pages/server.json.ts
//
// MCP registry-style manifest at the conventional root path — see
// src/data/mcpServerCard.ts for the content and the "no overclaiming" note
// on why this doesn't list a `remotes` (Streamable HTTP) entry yet.
import type { APIRoute } from 'astro';
import { mcpServerJson } from '@data/mcpServerCard';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(mcpServerJson, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
