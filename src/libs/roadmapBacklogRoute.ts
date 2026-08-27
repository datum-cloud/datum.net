// src/libs/roadmapBacklogRoute.ts
//
// Shared handler behind both /api/v1/roadmap/backlog-meta (canonical) and
// /api/roadmap/backlog-meta (deprecated compatibility alias — see
// src/pages/api/roadmap/backlog-meta.ts). Kept in one place so the two
// routes can't drift: same data, same rate-limit budget, same error shape.

import { getGitHubBacklogMeta } from '@libs/githubBacklog';
import { checkRateLimit } from '@libs/rateLimit';
import { problemResponse } from '@libs/httpProblem';

// This endpoint is versioned via a URL path (/api/v1/...) — see the
// versioning policy note in src/data/openapi.ts. A breaking change ships as
// /api/v2/..., and the previous major version's `deprecated` alias (if any)
// gets a `Deprecation` header per RFC 9745.
export const API_VERSION = '1';

// Headroom well above real usage: BacklogLiveUpdate.astro polls at most every
// 2s while a refresh is in flight (~30 req/min for one open tab). This exists
// so agents get real, enforced values to self-throttle against — not to
// constrain normal traffic. See src/libs/rateLimit.ts for the per-process
// caveat. Shared across both the canonical and deprecated-alias paths (same
// underlying resource, same budget).
const RATE_LIMIT = { limit: 20, windowMs: 10_000 };

export async function handleBacklogMetaRequest(
  clientAddress: string | undefined,
  extraHeaders: Record<string, string> = {}
): Promise<Response> {
  const rate = checkRateLimit(`backlog-meta:${clientAddress ?? 'unknown'}`, RATE_LIMIT);

  const commonHeaders = {
    'API-Version': API_VERSION,
    'RateLimit-Limit': String(rate.limit),
    'RateLimit-Remaining': String(rate.remaining),
    'RateLimit-Reset': String(rate.resetSeconds),
    ...extraHeaders,
  };

  if (rate.limited) {
    return problemResponse(
      {
        status: 429,
        title: 'Too Many Requests',
        detail: 'Rate limit exceeded for this endpoint — retry after the window resets.',
      },
      { headers: { ...commonHeaders, 'Retry-After': String(rate.resetSeconds) } }
    );
  }

  try {
    const meta = await getGitHubBacklogMeta();

    return new Response(JSON.stringify(meta), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...commonHeaders,
      },
    });
  } catch (error) {
    console.error('Failed to load roadmap backlog meta:', error);
    return problemResponse(
      {
        status: 500,
        title: 'Internal Server Error',
        detail: 'Failed to load the roadmap backlog cache status.',
      },
      { headers: commonHeaders }
    );
  }
}
