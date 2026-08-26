// src/pages/.well-known/ai-catalog.json.ts
//
// AI resource catalog — a separate convention from /.well-known/api-catalog
// (RFC 8631 linkset, for REST service-desc/service-doc discovery; see
// public/.well-known/api-catalog). This one indexes AI-agent-facing
// resources specifically (today: the MCP server card). Format mirrors
// is-agentic.com's own /.well-known/ai-catalog.json, the clearest available
// reference for what their discoverability check expects.
// prerender = false: see the same note in
// src/pages/.well-known/mcp/server-card.json.ts.
export const prerender = false;

import type { APIRoute } from 'astro';

const SITE_URL = 'https://www.datum.net';

const aiCatalog = {
  specVersion: '1.0',
  entries: [
    {
      identifier: `urn:air:${new URL(SITE_URL).hostname}:mcp:datum-mcp`,
      type: 'application/mcp-server-card+json',
      url: `${SITE_URL}/mcp/server-card`,
    },
  ],
} as const;

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(aiCatalog, null, 2), {
    headers: {
      'Content-Type': 'application/ai-catalog+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
