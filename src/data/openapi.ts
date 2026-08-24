// src/data/openapi.ts
//
// OpenAPI 3.1 spec for datum.net's OWN public endpoints — the marketing/docs
// website, not the Datum Cloud platform API.
//
// The platform API (creating/managing Application Load Balancers, Connectors,
// DNS zones, etc.) is a separate Kubernetes-native aggregated API server at
// https://api.datum.net. It already exposes standard Kubernetes OpenAPI v2/v3
// discovery at `/openapi/v2` and `/openapi/v3`, but those require an
// authenticated bearer token to fetch (kubebuilder/apiserver convention) —
// there's nothing this site can publish anonymously that would accurately
// describe it without access to that codebase, so this document explicitly
// scopes itself to what datum.net itself serves and points agents at the
// platform docs (and the real discovery endpoint) for the rest. Overclaiming
// a synthesized platform spec here would be worse than not having one: an
// agent would call endpoints that don't match its actual schema.
//
// Keep this in sync with the routes it documents:
//   - src/pages/api/roadmap/backlog-meta.ts

const SITE_URL = 'https://www.datum.net';

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Datum Website API',
    version: '1.0.0',
    description:
      'Public endpoints served directly by datum.net (the marketing/docs site). This is intentionally a small surface — the Datum Cloud platform API for creating and managing infrastructure (Application Load Balancers, Connectors, DNS, Domains) is a separate Kubernetes-native aggregated API server documented at ' +
      `${SITE_URL}/docs and reachable at https://api.datum.net. That API follows standard Kubernetes API conventions (the same request shape as \`kubectl\`) and publishes its own OpenAPI v3 discovery document at \`/openapi/v3\`, which requires an authenticated bearer token to fetch — see ${SITE_URL}/docs for how to authenticate, or the \`datumctl\` CLI / MCP server for a higher-level interface that doesn't require calling the platform API directly.`,
    contact: {
      name: 'Datum',
      url: `${SITE_URL}/contact`,
    },
  },
  servers: [{ url: SITE_URL }],
  externalDocs: {
    description: 'Datum Cloud platform documentation (full API reference, guides, MCP server)',
    url: `${SITE_URL}/docs`,
  },
  paths: {
    '/api/roadmap/backlog-meta': {
      get: {
        operationId: 'getRoadmapBacklogMeta',
        summary: 'Roadmap backlog cache status',
        description:
          'Lightweight status for the public roadmap backlog cache (backed by the datum-cloud GitHub Projects board) — used by the roadmap page to poll for live updates without re-fetching the full backlog on every request. Read-only, no authentication required.',
        tags: ['Roadmap'],
        responses: {
          '200': {
            description: 'Current backlog cache status.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['updatedAt', 'isRefreshing'],
                  properties: {
                    updatedAt: {
                      type: ['integer', 'null'],
                      description:
                        'Unix epoch milliseconds of the last successful backlog refresh, or null if the cache has never been populated.',
                      example: 1735689600000,
                    },
                    isRefreshing: {
                      type: 'boolean',
                      description: 'True while a background refresh from GitHub is in flight.',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
