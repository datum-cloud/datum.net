// src/pages/api/cache/index.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyCacheApiSecret } from '@libs/cacheApiAuth';
import { formatExpiresAt, formatSizeKb, getCacheViewerData } from '@libs/cacheViewer';

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
