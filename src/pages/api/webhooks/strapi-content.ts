// src/pages/api/webhooks/strapi-content.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fetchStrapiArticles, fetchStrapiArticleBySlug } from '@libs/strapi/articles';
import { fetchStrapiAuthors } from '@libs/strapi/authors';
import { fetchStrapiRoadmaps } from '@libs/strapi/roadmaps';

const CACHE_DIR = path.resolve(process.cwd(), '.cache');
const FALLBACK_CACHE_DIR = path.resolve(process.cwd(), '.cache/strapi-fallback');

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

function verifyWebhookSecret(request: Request): boolean {
  const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Webhook] STRAPI_WEBHOOK_SECRET is not configured');
    return false;
  }

  const receivedSecret = request.headers.get('X-Webhook-Secret');

  if (!receivedSecret) {
    console.warn('[Webhook] Missing X-Webhook-Secret header');
    return false;
  }

  const expected = Buffer.from(webhookSecret);
  const received = Buffer.from(receivedSecret);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

function deleteCacheFilesInDir(dir: string, pattern: string): string[] {
  const deleted: string[] = [];

  try {
    if (!fs.existsSync(dir)) return deleted;

    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith(pattern)) {
        try {
          fs.unlinkSync(path.join(dir, file));
          deleted.push(file);
        } catch (err) {
          console.error(`[Webhook] Failed to delete ${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error(`[Webhook] Error reading cache dir ${dir}:`, err);
  }

  return deleted;
}

/**
 * Delete matching files from both main and fallback cache dirs.
 * mainPattern  — prefix used in .cache/
 * fallbackPattern — prefix used in .cache/strapi-fallback/ (differs from main)
 */
function invalidateCache(mainPattern: string, fallbackPattern: string): string[] {
  return [
    ...deleteCacheFilesInDir(CACHE_DIR, mainPattern),
    ...deleteCacheFilesInDir(FALLBACK_CACHE_DIR, fallbackPattern),
  ];
}

function invalidateArticleCache(slug?: string): string[] {
  const deleted = [
    // list caches: main "strapi-articles*", fallback "articles*"
    ...invalidateCache('strapi-articles', 'articles'),
  ];

  if (slug) {
    // per-article: main "strapi-article-{slug}*", fallback "article-{slug}*"
    deleted.push(...invalidateCache(`strapi-article-${slug}`, `article-${slug}`));
  }

  return deleted;
}

function invalidateAuthorCache(): string[] {
  // Authors have no fallback cache — only clear main
  return [
    ...deleteCacheFilesInDir(CACHE_DIR, 'strapi-authors'),
    ...deleteCacheFilesInDir(CACHE_DIR, 'strapi-team-members'),
    ...deleteCacheFilesInDir(CACHE_DIR, 'strapi-author-slug-'),
  ];
}

function invalidateRoadmapCache(): string[] {
  // main "strapi-roadmaps*", fallback "roadmaps*"
  return invalidateCache('strapi-roadmaps', 'roadmaps');
}

/**
 * Re-fetch and rewrite article caches after invalidation.
 * On delete we skip re-fetching the individual article (it no longer exists in Strapi)
 * so we don't accidentally promote the stale fallback entry back into the main cache.
 */
async function warmArticleCache(slug: string | undefined, isDelete: boolean): Promise<void> {
  try {
    await fetchStrapiArticles();
  } catch (err) {
    console.error('[Webhook] Cache warm failed for article list:', err);
  }

  if (slug && !isDelete) {
    try {
      await fetchStrapiArticleBySlug(slug);
    } catch (err) {
      console.error(`[Webhook] Cache warm failed for article "${slug}":`, err);
    }
  }
}

async function warmAuthorCache(): Promise<void> {
  try {
    await fetchStrapiAuthors();
  } catch (err) {
    console.error('[Webhook] Cache warm failed for authors:', err);
  }
}

async function warmRoadmapCache(): Promise<void> {
  try {
    await fetchStrapiRoadmaps();
  } catch (err) {
    console.error('[Webhook] Cache warm failed for roadmaps:', err);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    if (!verifyWebhookSecret(request)) {
      console.error('[Webhook] Unauthorized webhook request');
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let payload: StrapiWebhookPayload;
    try {
      payload = (await request.json()) as StrapiWebhookPayload;
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { event, model, entry } = payload;

    if (!event || !model) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: event, model' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Webhook] ${event} on model "${model}"`, {
      id: entry?.id,
      slug: entry?.slug,
      name: entry?.name,
    });

    const isDelete = event === 'entry.delete';
    let deletedFiles: string[] = [];

    if (model === 'article') {
      deletedFiles = invalidateArticleCache(entry?.slug);
      console.log(`[Webhook] Cleared ${deletedFiles.length} article cache files:`, deletedFiles);
      void warmArticleCache(entry?.slug, isDelete);
    } else if (model === 'author') {
      deletedFiles = invalidateAuthorCache();
      console.log(`[Webhook] Cleared ${deletedFiles.length} author cache files:`, deletedFiles);
      void warmAuthorCache();
    } else if (model === 'roadmap') {
      deletedFiles = invalidateRoadmapCache();
      console.log(`[Webhook] Cleared ${deletedFiles.length} roadmap cache files:`, deletedFiles);
      void warmRoadmapCache();
    } else {
      console.warn(`[Webhook] Unknown model: ${model}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache cleared and refresh triggered',
        details: {
          event,
          model,
          entryId: entry?.id,
          slug: entry?.slug,
          deletedFiles,
          duration: `${Date.now() - startTime}ms`,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Webhook] Unexpected error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
