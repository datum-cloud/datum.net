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
//   - src/pages/api/v1/roadmap/backlog-meta.ts (canonical)
//   - src/pages/api/roadmap/backlog-meta.ts (deprecated compatibility alias)
//   - src/libs/roadmapBacklogRoute.ts (shared handler behind both)

const SITE_URL = 'https://www.datum.net';

// Versioning & deprecation policy note, included in `info.description` and
// `x-api-lifecycle` below. Stable operations live under a major-version URL
// path (`/api/v1/...`); a breaking change ships as a new major path
// (`/api/v2/...`). A superseded path isn't deleted out from under existing
// callers — it stays live as a compatibility alias, marked `deprecated` in
// this spec and signaled on the wire via the `Deprecation` (RFC 9745) and,
// once a removal date is actually scheduled, `Sunset` (RFC 8594) response
// headers. Every response also carries an `API-Version` header as a
// secondary, non-normative signal.
const CURRENT_MAJOR_VERSION = 'v1';
const VERSIONING_POLICY =
  'Stable REST operations use major-version URL paths beginning with `/api/v1`. A breaking change ships as a new major path (`/api/v2`, ...); a superseded path stays live as a `deprecated` compatibility alias signaled via the `Deprecation` response header (RFC 9745) and, once a removal date is scheduled, `Sunset` (RFC 8594). Every response also carries a non-normative `API-Version` header.';

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

// Response body shared by the canonical and deprecated-alias paths — same
// resource, same shape.
const backlogMetaContent = {
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
  // Non-standard extension, machine-readable mirror of the versioning policy
  // above — not part of the OpenAPI 3.1 core spec, but `x-*` extension
  // fields are explicitly allowed anywhere a Specification Extensions object
  // is permitted, and a top-level lifecycle hint costs nothing to read.
  'x-api-lifecycle': {
    current_major_version: CURRENT_MAJOR_VERSION,
  },
  components: {
    schemas: {
      Problem: problemSchema,
    },
  },
  paths: {
    '/api/v1/roadmap/backlog-meta': {
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
            content: backlogMetaContent,
          },
          '429': tooManyRequestsResponse,
          '500': internalErrorResponse,
        },
      },
    },
    '/api/roadmap/backlog-meta': {
      get: {
        operationId: 'getRoadmapBacklogMetaLegacy',
        summary: 'Roadmap backlog cache status (deprecated compatibility alias)',
        description:
          'Deprecated compatibility alias for `GET /api/v1/roadmap/backlog-meta` — same resource, same response shape. Kept live indefinitely (no scheduled `Sunset`) for any caller outside this repo that already depends on this exact path; new integrations should use the versioned path.',
        deprecated: true,
        tags: ['Roadmap'],
        responses: {
          '200': {
            description:
              'Current backlog cache status. See `Deprecation` and `Link` response headers.',
            headers: {
              ...rateLimitHeaders,
              Deprecation: {
                description:
                  'RFC 9745 — an `@`-prefixed Unix timestamp of when this path was deprecated.',
                schema: { type: 'string' },
                example: '@1787702400',
              },
              Link: {
                description:
                  'Points to the canonical, versioned replacement (RFC 5829 successor-version).',
                schema: { type: 'string' },
                example: '</api/v1/roadmap/backlog-meta>; rel="successor-version"',
              },
            },
            content: backlogMetaContent,
          },
          '429': tooManyRequestsResponse,
          '500': internalErrorResponse,
        },
      },
    },
  },
} as const;
