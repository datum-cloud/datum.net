// src/pages/api/v1/roadmap/backlog-meta.ts
//
// Canonical, versioned path — see src/data/openapi.ts for the versioning
// policy. src/pages/api/roadmap/backlog-meta.ts is a deprecated compatibility
// alias for this same resource.

export const prerender = false;

import type { APIRoute } from 'astro';
import { handleBacklogMetaRequest } from '@libs/roadmapBacklogRoute';

export const GET: APIRoute = async ({ clientAddress }) => {
  return handleBacklogMetaRequest(clientAddress);
};
