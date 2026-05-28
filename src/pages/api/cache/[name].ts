// src/pages/api/cache/[name].ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyCacheApiSecret } from '@libs/cacheApiAuth';
import {
  formatExpiresAt,
  formatSizeKb,
  getCacheEntryByName,
  isSafeCacheKey,
  type CacheSourceFilter,
} from '@libs/cacheViewer';

const VALID_SOURCE_FILTERS = new Set<CacheSourceFilter>(['main', 'fallback', 'auto']);

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function parseSourceFilter(url: URL): CacheSourceFilter | null {
  const raw = url.searchParams.get('source');
  if (raw === null) {
    return 'auto';
  }
  const trimmed = raw.trim();
  if (!VALID_SOURCE_FILTERS.has(trimmed as CacheSourceFilter)) {
    return null;
  }
  return trimmed as CacheSourceFilter;
}

export const GET: APIRoute = async ({ request, params }) => {
  if (request.method !== 'GET') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  if (!verifyCacheApiSecret(request)) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const name = typeof params.name === 'string' ? params.name.trim() : '';

  if (!isSafeCacheKey(name)) {
    return jsonResponse({ success: false, error: 'Invalid cache name' }, 400);
  }

  const sourceFilter = parseSourceFilter(new URL(request.url));
  if (sourceFilter === null) {
    return jsonResponse(
      { success: false, error: 'Invalid query: "source" must be main, fallback, or auto' },
      400
    );
  }

  const result = getCacheEntryByName(name, { source: sourceFilter });

  if (result.status === 'not_found') {
    return jsonResponse({ success: false, error: 'Cache entry not found', key: name }, 404);
  }

  if (result.status === 'invalid_json') {
    return jsonResponse({ success: false, error: 'Invalid cache JSON', key: name }, 500);
  }

  const { entry } = result;

  return jsonResponse(
    {
      success: true,
      key: entry.key,
      source: entry.source,
      expiresAt: formatExpiresAt(entry.expiresAt),
      expired: entry.expired,
      size: formatSizeKb(entry.size),
      data: entry.data,
    },
    200
  );
};
