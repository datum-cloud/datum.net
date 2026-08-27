// src/pages/api/roadmap/backlog-meta.ts
//
// Deprecated compatibility alias — see src/pages/api/v1/roadmap/backlog-meta.ts
// for the canonical, versioned path this now redirects clients toward via
// the Deprecation (RFC 9745) and Link (rel="successor-version") headers
// below. Kept live indefinitely (no Sunset header — no scheduled removal)
// since this exact path may already be bookmarked/cached by callers outside
// this repo; see the versioning policy in src/data/openapi.ts.

export const prerender = false;

import type { APIRoute } from 'astro';
import { handleBacklogMetaRequest } from '@libs/roadmapBacklogRoute';

// 2026-08-26T00:00:00Z — the day this path was superseded by /api/v1/. Fixed,
// not computed per-request: RFC 9745 §2 says this is when deprecation
// *started*, not "now."
const DEPRECATED_SINCE_EPOCH_SECONDS = 1787702400;

export const GET: APIRoute = async ({ clientAddress }) => {
  return handleBacklogMetaRequest(clientAddress, {
    Deprecation: `@${DEPRECATED_SINCE_EPOCH_SECONDS}`,
    Link: '</api/v1/roadmap/backlog-meta>; rel="successor-version"',
  });
};
