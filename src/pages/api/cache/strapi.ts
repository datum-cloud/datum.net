// src/pages/api/cache/strapi.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyCacheApiSecret } from '@libs/cacheApiAuth';
import {
  regenerateStrapiCacheIfMissing,
  forceRegenerateStrapiCache,
  validateStrapiForceRegenerateRequest,
} from '@libs/strapi/regenerateCache';

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
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

  try {
    const contentType = request.headers.get('Content-Type') ?? '';
    const isJsonBody = contentType.includes('application/json');
    let body: unknown = null;

    if (isJsonBody) {
      const text = await request.text();
      if (text.trim()) {
        try {
          body = JSON.parse(text) as unknown;
        } catch {
          return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    if (body && typeof body === 'object' && 'names' in body) {
      const rawNames = (body as { names?: unknown }).names;
      if (!Array.isArray(rawNames)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid body: "names" must be an array of strings',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const namesFromBody = rawNames.filter((x): x is string => typeof x === 'string');
      const validationErrors = validateStrapiForceRegenerateRequest(namesFromBody);
      if (validationErrors.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Validation failed',
            details: validationErrors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await forceRegenerateStrapiCache(namesFromBody);

      return new Response(
        JSON.stringify({
          success: result.errors.length === 0,
          message: 'Strapi cache force regeneration completed',
          details: {
            mode: 'force',
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
    }

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
