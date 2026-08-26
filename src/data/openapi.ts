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

// Versioning & deprecation policy note, included in `info.description` below.
// This surface is versioned via a response header (`API-Version`) rather than
// a URL prefix — the small handful of routes documented here don't warrant
// the churn (and breakage risk for existing callers) of a `/v1/` path rename.
// A breaking change bumps `API-Version`; a version being retired is signaled
// via the standard `Deprecation` and `Sunset` response headers with at least
// 90 days' notice before removal.
const VERSIONING_POLICY =
  'This API is versioned via the `API-Version` response header (currently `1`), not a URL prefix — the surface is small enough that a path rename would add churn without adding safety. A breaking change increments the version; a version being retired is announced via the `Deprecation` and `Sunset` response headers (RFC 8594) with at least 90 days’ notice before removal.';

// RFC 9457 (Problem Details for HTTP APIs) error schema, shared by every
// error response below — see src/libs/httpProblem.ts for the response
// builder that actually produces this shape at runtime.
const problemSchema = {
  type: 'object',
  description:
    'RFC 9457 Problem Details for HTTP APIs (https://www.rfc-editor.org/rfc/rfc9457). `status` is the machine-readable signal to branch on; `title`/`detail` are for humans.',
  required: ['type', 'title', 'status'],
  properties: {
    type: {
      type: 'string',
      format: 'uri-reference',
      description:
        'A URI identifying the problem type. `about:blank` (the default) means the problem has no semantics beyond the HTTP status code.',
      example: 'about:blank',
    },
    title: {
      type: 'string',
      description: 'Short, human-readable summary of the problem type.',
      example: 'Too Many Requests',
    },
    status: {
      type: 'integer',
      description: 'The HTTP status code for this occurrence of the problem.',
      example: 429,
    },
    detail: {
      type: 'string',
      description: 'Human-readable explanation specific to this occurrence of the problem.',
    },
    instance: {
      type: 'string',
      format: 'uri-reference',
      description: 'A URI identifying this specific occurrence of the problem.',
    },
  },
} as const;

// Response headers shared by every response on the rate-limited endpoint(s)
// below — see src/libs/rateLimit.ts for the enforcement.
const rateLimitHeaders = {
  'RateLimit-Limit': {
    description: 'Requests allowed per window.',
    schema: { type: 'integer' },
  },
  'RateLimit-Remaining': {
    description: 'Requests remaining in the current window.',
    schema: { type: 'integer' },
  },
  'RateLimit-Reset': {
    description: 'Seconds until the current window resets.',
    schema: { type: 'integer' },
  },
  'API-Version': {
    description: 'The API version that served this response — see the versioning policy above.',
    schema: { type: 'string' },
  },
} as const;

const tooManyRequestsResponse = {
  description: 'Rate limit exceeded — retry after `Retry-After` seconds.',
  headers: {
    ...rateLimitHeaders,
    'Retry-After': {
      description: 'Seconds until the rate limit window resets.',
      schema: { type: 'integer' },
    },
  },
  content: {
    'application/problem+json': { schema: { $ref: '#/components/schemas/Problem' } },
  },
} as const;

const internalErrorResponse = {
  description: 'Unexpected server-side failure.',
  headers: rateLimitHeaders,
  content: {
    'application/problem+json': { schema: { $ref: '#/components/schemas/Problem' } },
  },
} as const;

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Datum Website API',
    version: '1.0.0',
    description:
      'Public endpoints served directly by datum.net (the marketing/docs site). This is intentionally a small surface — the Datum Cloud platform API for creating and managing infrastructure (Application Load Balancers, Connectors, DNS, Domains) is a separate Kubernetes-native aggregated API server documented at ' +
      `${SITE_URL}/docs and reachable at https://api.datum.net. That API follows standard Kubernetes API conventions (the same request shape as \`kubectl\`) and publishes its own OpenAPI v3 discovery document at \`/openapi/v3\`, which requires an authenticated bearer token to fetch — see ${SITE_URL}/docs for how to authenticate, or the \`datumctl\` CLI / MCP server for a higher-level interface that doesn't require calling the platform API directly.\n\n` +
      `**Versioning & deprecation:** ${VERSIONING_POLICY}\n\n` +
      '**Errors:** every non-2xx response returns `application/problem+json` (RFC 9457) — see the `Problem` schema.',
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
  components: {
    schemas: {
      Problem: problemSchema,
    },
  },
  paths: {
    '/api/roadmap/backlog-meta': {
      get: {
        operationId: 'getRoadmapBacklogMeta',
        summary: 'Roadmap backlog cache status',
        description:
          'Lightweight status for the public roadmap backlog cache (backed by the datum-cloud GitHub Projects board) — used by the roadmap page to poll for live updates without re-fetching the full backlog on every request. Read-only, no authentication required. Rate-limited; see the `RateLimit-*` response headers.',
        tags: ['Roadmap'],
        responses: {
          '200': {
            description: 'Current backlog cache status.',
            headers: rateLimitHeaders,
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
          '429': tooManyRequestsResponse,
          '500': internalErrorResponse,
        },
      },
    },
  },
} as const;
