// src/pages/api/cache/index.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { getCacheViewerData } from '@libs/cacheViewer';

function verifyWebhookSecret(request: Request): boolean {
  const webhookSecret = import.meta.env.STRAPI_WEBHOOK_SECRET || process.env.STRAPI_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  const receivedSecret = request.headers.get('X-Webhook-Secret');
  return receivedSecret === webhookSecret;
}

export const GET: APIRoute = async ({ request }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!verifyWebhookSecret(request)) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = getCacheViewerData();

  const formatExpiresAt = (ts: number | null): string =>
    ts === null
      ? '—'
      : new Date(ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const formatSizeKb = (bytes: number): string => `${Math.round((bytes / 1024) * 10) / 10} KB`;

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
