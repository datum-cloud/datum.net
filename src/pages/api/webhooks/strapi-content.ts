// src/pages/api/webhooks/strapi-content.ts
/**
 * Strapi → datum.net webhook endpoint.
 *
 * Delegates secret verification, payload parsing, tag-based cache invalidation,
 * and cache warm to `@datum-cloud/strapi-revalidate`'s `createWebhookHandler`.
 * Warm failures propagate as HTTP 502 via `webhook.failOnWarmError` (0.3.0+).
 *
 * Header note: the package accepts `Authorization: Bearer <secret>`,
 * `X-Strapi-Signature`, `strapi-webhook-secret`, and `X-Webhook-Secret`.
 * The adapter below still maps `X-Webhook-Secret` → `Authorization: Bearer`
 * for callers that only check the Authorization header.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createWebhookHandler } from '@datum-cloud/strapi-revalidate';
import type { WebhookEvent } from '@datum-cloud/strapi-revalidate';
import { cache, config } from '@libs/strapi/_runtime';
import { fetchStrapiArticles, fetchStrapiArticleBySlug } from '@libs/strapi/articles';
import {
  fetchStrapiAuthors,
  getStrapiTeamMembers,
  getStrapiCardMembers,
} from '@libs/strapi/authors';

/** Primary cache keys — must stay aligned with the Strapi fetcher modules. */
const ARTICLES_CACHE_KEY = 'strapi-articles';
const ARTICLE_CACHE_PREFIX = 'strapi-article-';
const AUTHORS_CACHE_KEY = 'strapi-authors';
/** Strapi events that mean "the entry no longer exists" — skip the per-slug warm. */
const DELETE_EVENTS = new Set(['entry.delete', 'entry.unpublish']);

const WEBHOOK_AUTH_HEADERS = [
  'authorization',
  'x-strapi-signature',
  'strapi-webhook-secret',
  'x-webhook-secret',
] as const;

/**
 * Map Strapi Admin's `X-Webhook-Secret` to headers the revalidate package reads.
 */
function getWebhookHeader(request: Request, name: string): string | null {
  const lower = name.toLowerCase();

  if (lower === 'authorization') {
    const auth = request.headers.get('authorization');
    if (auth) return auth;
    const legacy = request.headers.get('x-webhook-secret');
    return legacy ? `Bearer ${legacy}` : null;
  }

  if (lower === 'strapi-webhook-secret') {
    return request.headers.get('strapi-webhook-secret') ?? request.headers.get('x-webhook-secret');
  }

  return request.headers.get(lower) ?? request.headers.get(name);
}

/** Log inbound webhook details when `STRAPI_DEBUG=true` (secrets redacted). */
function logWebhookRequest(request: Request, rawBody: string): void {
  if (!config.debug) return;

  const headers: Record<string, string> = {};
  for (const name of WEBHOOK_AUTH_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = '[redacted]';
  }
  const contentType = request.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;

  let parsedBody: unknown = rawBody;
  if (rawBody.length > 0) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      // Keep raw string when body isn't JSON.
    }
  }

  console.log('[Webhook] Incoming request', {
    headers,
    body: parsedBody,
  });
}

function logWebhookResponse(status: number, body: unknown): void {
  if (!config.debug) return;
  console.log('[Webhook] Response', { status, body });
}

async function assertPrimaryCache(key: string, label: string): Promise<void> {
  const value = await cache.get(key);
  if (value === null) {
    throw new Error(`Cache warm failed: primary cache miss for ${label} (${key})`);
  }
}

async function warmAfterRevalidate(event: WebhookEvent): Promise<void> {
  const isDelete = DELETE_EVENTS.has(event.event);

  switch (event.model) {
    case 'article': {
      const tasks: Promise<void>[] = [
        fetchStrapiArticles().then(() => assertPrimaryCache(ARTICLES_CACHE_KEY, 'articles list')),
      ];

      if (event.slug && !isDelete) {
        const slug = event.slug;
        tasks.push(
          fetchStrapiArticleBySlug(slug).then(async (article) => {
            if (!article) {
              throw new Error(`Cache warm failed: could not load article "${slug}"`);
            }
            await assertPrimaryCache(`${ARTICLE_CACHE_PREFIX}${slug}`, `article "${slug}"`);
          })
        );
      }

      await Promise.all(tasks);
      break;
    }
    case 'author':
      // Order matters: refresh the source list first so derived caches are
      // computed from fresh data when getStrapiTeamMembers/getStrapiCardMembers run.
      await fetchStrapiAuthors();
      await Promise.all([getStrapiTeamMembers(), getStrapiCardMembers()]);
      await assertPrimaryCache(AUTHORS_CACHE_KEY, 'authors list');
      break;
    default:
      console.warn(`[Webhook] No warm strategy for model "${event.model}"`);
  }
}

const handle = createWebhookHandler({
  config: {
    ...config,
    webhook: {
      ...config.webhook,
      failOnWarmError: true,
      onRevalidate: warmAfterRevalidate,
    },
  },
  cache,
});

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  let status = 200;
  let body: unknown = {};

  // Fail closed: the package handler skips verification entirely when no secret is
  // configured, which would leave this cache-purge endpoint open to anyone. Reject
  // before delegating so a missing `STRAPI_WEBHOOK_SECRET` can never disable auth.
  if (!config.webhook?.secret) {
    console.error('[Webhook] STRAPI_WEBHOOK_SECRET is not configured — rejecting request');
    return new Response(JSON.stringify({ ok: false, error: 'Webhook secret not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Read body once — Request streams are single-use, and we log the payload in debug mode.
  const rawBody = await request.text();
  logWebhookRequest(request, rawBody);

  // Adapt Astro's `Request` to the package's lowest-common-denominator shape.
  // Fetch `Headers` doesn't have a string index signature so the package's
  // `WebhookRequest` rejects it at the type level, even though `.get()` works
  // at runtime — wrap it so only the methods the handler needs are exposed.
  const webhookReq = {
    method: request.method,
    headers: {
      get: (name: string): string | null => getWebhookHeader(request, name),
    },
    text: () => Promise.resolve(rawBody),
    json: () => Promise.resolve(JSON.parse(rawBody.length > 0 ? rawBody : '{}')),
  };

  try {
    await handle(webhookReq, {
      status: (code) => {
        status = code;
      },
      json: (value) => {
        body = value;
      },
    });
  } catch (err) {
    console.error('[Webhook] Unexpected error from package handler:', err);
    status = 500;
    body = { ok: false, error: 'Internal server error' };
  }

  if (body && typeof body === 'object' && (status === 200 || status === 502)) {
    (body as Record<string, unknown>).duration = `${Date.now() - startTime}ms`;
  }

  logWebhookResponse(status, body);

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
