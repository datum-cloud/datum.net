// src/pages/api/cache/strapi.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { regenerateStrapiCacheIfMissing } from '@libs/strapi/regenerateCache';

function verifyWebhookSecret(request: Request): boolean {
  const webhookSecret = import.meta.env.STRAPI_WEBHOOK_SECRET || process.env.STRAPI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return false;
  }

  const receivedSecret = request.headers.get('X-Webhook-Secret');
  return receivedSecret === webhookSecret;
}

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
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

  try {
    const result = await regenerateStrapiCacheIfMissing();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Strapi cache regeneration completed',
        details: {
          regenerated: result.regenerated,
          skipped: result.skipped,
          errors: result.errors,
          regeneratedCount: result.regenerated.length,
          skippedCount: result.skipped.length,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[strapi-regenerate] Error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
