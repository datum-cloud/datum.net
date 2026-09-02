// src/data/mcpServerCard.ts
//
// MCP server discovery manifest for Datum's official MCP server
// (github.com/datum-cloud/datum-mcp), following the Model Context Protocol
// registry's server.json schema (modelcontextprotocol.io) — the same schema
// is-agentic.com's own MCP server publishes at /server.json and
// /.well-known/mcp/server-card.json, which is the clearest available
// evidence of what a "standard manifest endpoint" means to that checker.
//
// Served from three routes (see the .ts files alongside src/pages/mcp/ and
// src/pages/.well-known/):
//   - /server.json                          (registry-style, minimal)
//   - /.well-known/mcp/server-card.json      (web discovery, well-known path)
//   - /mcp/server-card                       (same content, clean alias —
//                                              mirrors is-agentic's own layout)
//
// IMPORTANT — no `remotes` entry: datum-mcp's README (as of writing) lists
// its run modes as "Stdio (http coming soon)" — there is no live Streamable
// HTTP endpoint today. `mcp.datum.net`, referenced by an earlier version of
// this file, does not resolve at all. Advertising a `remotes` entry pointing
// at a host that doesn't exist would be strictly worse than not having one
// (an agent would try to call it and fail) — see the same "no overclaiming"
// reasoning in src/data/openapi.ts. This file instead accurately describes
// the real, working distribution: a stdio binary from GitHub Releases via
// `packages`. Add a `remotes` entry once a hosted Streamable HTTP transport
// actually ships.
//
// `packages[0].version` tracks the latest datum-mcp release and needs a
// manual bump when a new one ships — there's no build-time link between this
// repo and that one. Check https://github.com/datum-cloud/datum-mcp/releases
// for the current tag.

const DATUM_MCP_VERSION = '0.1.4';

const baseServerCard = {
  name: 'io.github.datum-cloud/datum-mcp',
  title: 'Datum MCP Server',
  description:
    'Official Datum Cloud MCP server — gives AI agents tools to list and manage organizations, projects, domains, HTTP proxies/routes, gateways, traffic protection policies, and DNS zones/records. OAuth 2.1 (PKCE) authenticated. Distributed today as a stdio binary; a hosted Streamable HTTP transport is planned but not yet live.',
  version: DATUM_MCP_VERSION,
  websiteUrl: 'https://www.datum.net/download/datum-mcp',
  packages: [
    {
      registryType: 'github',
      registryBaseUrl: 'https://github.com',
      identifier: 'datum-cloud/datum-mcp',
      version: DATUM_MCP_VERSION,
      transport: { type: 'stdio' },
    },
  ],
} as const;

// Registry-style manifest (matches is-agentic.com's /server.json shape).
export const mcpServerJson = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
  ...baseServerCard,
} as const;

// Web-discovery manifest (matches is-agentic.com's server-card.json shape) —
// adds `repository`, which the server-card schema documents and the leaner
// server.schema.json example omits.
export const mcpServerCard = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  ...baseServerCard,
  repository: {
    source: 'github',
    url: 'https://github.com/datum-cloud/datum-mcp',
  },
} as const;
