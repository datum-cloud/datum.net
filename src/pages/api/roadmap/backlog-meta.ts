// src/pages/api/roadmap/backlog-meta.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { getGitHubBacklogMeta } from '@libs/githubBacklog';
import { checkRateLimit } from '@libs/rateLimit';
import { problemResponse } from '@libs/httpProblem';

// This endpoint is versioned via a response header rather than a URL prefix
// (see the versioning policy note in src/data/openapi.ts) — bump this when a
// breaking change ships, and pair the outgoing old version with `Deprecation`
// / `Sunset` response headers per that same policy.
const API_VERSION = '1';

// Headroom well above real usage: BacklogLiveUpdate.astro polls at most every
// 2s while a refresh is in flight (~30 req/min for one open tab). This exists
// so agents get real, enforced values to self-throttle against — not to
// constrain normal traffic. See src/libs/rateLimit.ts for the per-process
// caveat.
const RATE_LIMIT = { limit: 20, windowMs: 10_000 };

export const GET: APIRoute = async ({ clientAddress }) => {
  const rate = checkRateLimit(`backlog-meta:${clientAddress ?? 'unknown'}`, RATE_LIMIT);

  const commonHeaders = {
    'API-Version': API_VERSION,
    'RateLimit-Limit': String(rate.limit),
    'RateLimit-Remaining': String(rate.remaining),
    'RateLimit-Reset': String(rate.resetSeconds),
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
};
