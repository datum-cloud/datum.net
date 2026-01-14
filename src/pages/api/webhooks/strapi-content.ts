// src/pages/api/webhooks/strapi-content.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

// Cache at project root (cwd when running dev/build)
const CACHE_DIR = path.resolve(process.cwd(), '.cache');

/**
 * Strapi webhook payload structure
 */
interface StrapiWebhookPayload {
  event: 'entry.create' | 'entry.update' | 'entry.delete';
  model: string;
  entry: {
    id: number;
    slug?: string;
    name?: string;
    [key: string]: unknown;
  };
}

/**
 * Verify webhook request authenticity
 */
function verifyWebhookSecret(request: Request): boolean {
  const webhookSecret = import.meta.env.STRAPI_WEBHOOK_SECRET || process.env.STRAPI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Webhook] STRAPI_WEBHOOK_SECRET is not configured');
    return false;
  }

  const receivedSecret = request.headers.get('X-Webhook-Secret');

  if (!receivedSecret) {
    console.warn('[Webhook] Missing X-Webhook-Secret header');
    return false;
  }

  return receivedSecret === webhookSecret;
}

/**
 * Invalidate cache files by pattern
 */
function invalidateCache(pattern: string): string[] {
  const deletedFiles: string[] = [];

  try {
    if (!fs.existsSync(CACHE_DIR)) {
      console.warn(`[Webhook] Cache directory does not exist: ${CACHE_DIR}`);
      return deletedFiles;
    }

    const files = fs.readdirSync(CACHE_DIR);

    for (const file of files) {
      // Match pattern (e.g., "strapi-articles", "strapi-article-{slug}")
      if (file.startsWith(pattern)) {
        const filePath = path.join(CACHE_DIR, file);
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(file);
        } catch (err) {
          console.error(`[Webhook] Failed to delete file: ${file}`, err);
        }
      }
    }
  } catch (err) {
    console.error('[Webhook] Error reading cache directory:', err);
  }

  return deletedFiles;
}

/**
 * Handle article cache invalidation
 */
function invalidateArticleCache(slug?: string): string[] {
  const deletedFiles: string[] = [];

  // Always invalidate article list cache
  const listFiles = invalidateCache('strapi-articles');
  deletedFiles.push(...listFiles);

  // If slug is provided, invalidate specific article cache
  if (slug) {
    const articleFiles = invalidateCache(`strapi-article-${slug}`);
    deletedFiles.push(...articleFiles);
  }

  return deletedFiles;
}

/**
 * Handle author & team members cache invalidation
 */
function invalidateAuthorCache(): string[] {
  const deletedFiles: string[] = [];

  // Invalidate all author caches
  deletedFiles.push(...invalidateCache('strapi-authors'));

  // Invalidate team members cache (same underlying authors database)
  deletedFiles.push(...invalidateCache('strapi-team-members'));

  return deletedFiles;
}

/**
 * POST handler for Strapi webhook
 */
export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    // 1. Verify webhook secret
    if (!verifyWebhookSecret(request)) {
      console.error('[Webhook] Unauthorized webhook request');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Parse payload
    let payload: StrapiWebhookPayload;
    try {
      payload = (await request.json()) as StrapiWebhookPayload;
    } catch (err) {
      console.error('[Webhook] Invalid JSON payload:', err);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON payload',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { event, model, entry } = payload;

    // 3. Validate required fields
    if (!event || !model) {
      console.error('[Webhook] Missing required fields (event, model)');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: event, model',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[Webhook] Received: ${event} on ${model}`, {
      id: entry?.id,
      slug: entry?.slug,
      name: entry?.name,
    });

    // 4. Invalidate cache based on model
    let deletedFiles: string[] = [];

    if (model === 'article') {
      deletedFiles = invalidateArticleCache(entry?.slug);
      console.log(
        `[Webhook] Invalidated article cache (${deletedFiles.length} files):`,
        deletedFiles
      );
    } else if (model === 'author') {
      deletedFiles = invalidateAuthorCache();
      console.log(
        `[Webhook] Invalidated author cache (${deletedFiles.length} files):`,
        deletedFiles
      );
    } else {
      console.warn(`[Webhook] Unknown model: ${model}`);
    }

    const duration = Date.now() - startTime;

    // 5. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache invalidated successfully',
        details: {
          event,
          model,
          entryId: entry?.id,
          slug: entry?.slug,
          deletedFiles,
          duration: `${duration}ms`,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[Webhook] Unexpected error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
