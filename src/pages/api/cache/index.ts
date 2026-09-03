// src/pages/api/cache/index.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyCacheApiSecret } from '@libs/cacheApiAuth';
import {
  deleteCacheEntryByName,
  formatExpiresAt,
  formatSizeKb,
  getCacheViewerData,
  isSafeCacheKey,
} from '@libs/cacheViewer';

export const GET: APIRoute = async ({ request }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!verifyCacheApiSecret(request)) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = getCacheViewerData();

  const transformEntry = (e: (typeof data.entries)[0]) => ({
    ...e,
    size: formatSizeKb(e.size),
    expiresAt: formatExpiresAt(e.expiresAt),
  });

  const response = {
    entries: data.entries.map(transformEntry),
    bySource: {
      luma: data.bySource.luma.map(transformEntry),
      stargazer: data.bySource.stargazer.map(transformEntry),
      strapi: data.bySource.strapi.map(transformEntry),
      'strapi-fallback': data.bySource['strapi-fallback'].map(transformEntry),
      other: data.bySource.other.map(transformEntry),
    },
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};

/**
 * Deletes one or more cache entries by key, e.g. { "names": ["locationsMerged"] }.
 * Works for any key managed by src/libs/cache.ts's Cache class — deleted
 * entries regenerate on their next natural request. Mirrors the request body
 * shape of POST /api/cache/strapi's force-regenerate ("names" array).
 */
export const DELETE: APIRoute = async ({ request }) => {
  if (!verifyCacheApiSecret(request)) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown = null;
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text);
    }
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawNames =
    body && typeof body === 'object' ? (body as { names?: unknown }).names : undefined;

  if (!Array.isArray(rawNames) || rawNames.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'Body must be { "names": string[] }' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const deleted: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  for (const rawName of rawNames) {
    if (typeof rawName !== 'string' || !isSafeCacheKey(rawName)) {
      errors.push({ name: String(rawName), error: 'Invalid cache name' });
      continue;
    }

    const result = deleteCacheEntryByName(rawName, { source: 'auto' });
    if (result.status === 'ok') {
      deleted.push(rawName);
    } else {
      skipped.push(rawName);
    }
  }

  return new Response(
    JSON.stringify({
      success: errors.length === 0,
      message: 'Cache deletion completed; deleted entries regenerate on their next request',
      deleted,
      skipped,
      errors,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
