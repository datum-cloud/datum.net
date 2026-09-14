// src/pages/.well-known/ai-catalog.json.ts
//
// ARD (Agentic Resource Discovery, agenticresourcediscovery.org) capability
// manifest — a separate convention from /.well-known/api-catalog (RFC 8631
// linkset, for REST service-desc/service-doc discovery; see
// public/.well-known/api-catalog). This one indexes AI-agent-facing
// resources specifically: the MCP server card today, plus this site's own
// OpenAPI doc. Shape follows the ai-catalog data model
// (github.com/Agent-Card/ai-catalog) the ARD spec builds on — `specVersion`
// below is that data model's version, not the ARD spec's own (still v0.9
// draft), which is why it reads "1.0".
// prerender = false: see the same note in
// src/pages/.well-known/mcp/server-card.json.ts.
export const prerender = false;

import type { APIRoute } from 'astro';

const SITE_URL = 'https://www.datum.net';
const HOSTNAME = new URL(SITE_URL).hostname;

const aiCatalog = {
  specVersion: '1.0',
  host: {
    displayName: 'Datum',
    // did:web is the standard DID method for a domain-controlled identifier
    // (w3c-ccg.github.io/did-method-web) — stable and trivially verifiable
    // against this same domain, unlike an arbitrary string.
    identifier: `did:web:${HOSTNAME}`,
  },
  entries: [
    {
      identifier: `urn:air:${HOSTNAME}:mcp:datum-mcp`,
      displayName: 'Datum MCP Server',
      type: 'application/mcp-server-card+json',
      url: `${SITE_URL}/mcp/server-card`,
      representativeQueries: [
        'list my Datum Cloud projects',
        'create a DNS record in my Datum Cloud zone',
        'set up an HTTP proxy route for my service',
        "show my organization's gateways",
      ],
    },
    {
      identifier: `urn:air:${HOSTNAME}:api:openapi`,
      displayName: 'datum.net OpenAPI spec',
      // application/vnd.oai.openapi+json is the IANA-registered media type
      // for OpenAPI documents.
      type: 'application/vnd.oai.openapi+json',
      url: `${SITE_URL}/openapi.json`,
      representativeQueries: [
        'is the Datum roadmap backlog cache still refreshing',
        "what's Datum's API versioning and deprecation policy",
        "what are the rate limit response headers for Datum's public API",
      ],
    },
  ],
} as const;

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(aiCatalog, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
