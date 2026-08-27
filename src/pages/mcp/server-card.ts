// src/pages/mcp/server-card.ts
//
// Clean-URL alias for /.well-known/mcp/server-card.json — same content, same
// media type. Mirrors is-agentic.com's own layout (it serves this exact
// manifest at both paths), which is the clearest evidence available of what
// their "standard manifest endpoint" check looks for.
// prerender = false: see the same note in src/pages/.well-known/mcp/server-card.json.ts —
// this extensionless path especially needs it, since the static pipeline has
// no extension to infer a Content-Type from at all otherwise.
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
