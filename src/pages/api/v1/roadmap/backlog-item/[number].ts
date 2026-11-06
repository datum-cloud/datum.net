// src/pages/api/v1/roadmap/backlog-item/[number].ts
//
// Detail for one roadmap item (issue body rendered to sanitized HTML), used by
// the roadmap page's item drawer. Reads the cached backlog only — never calls
// GitHub directly.

export const prerender = false;

import type { APIRoute } from 'astro';
import { handleBacklogItemRequest } from '@libs/roadmapBacklogRoute';

export const GET: APIRoute = async ({ clientAddress, params }) => {
  return handleBacklogItemRequest(clientAddress, params.number);
};
