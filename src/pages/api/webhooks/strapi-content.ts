// src/pages/api/webhooks/strapi-content.ts
/**
 * Strapi → datum.net webhook endpoint.
 *
 * Delegates secret verification, payload parsing, and tag-based cache
 * invalidation to `@datum-cloud/strapi-revalidate`'s `createWebhookHandler`.
 * The `onRevalidate` callback re-warms the affected caches by calling the
 * shared fetchers (which use the same `cache` manager, so the next request
 * after a publish serves fresh data without a cold trip to Strapi).
 *
 * Header note: the package accepts `Authorization: Bearer <secret>`,
 * `X-Strapi-Signature`, or `strapi-webhook-secret`. Strapi Cloud must be
 * configured to send one of these (not the legacy `X-Webhook-Secret`) or
 * every request will 401.
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
import { fetchStrapiRoadmaps } from '@libs/strapi/roadmaps';

/** Strapi events that mean "the entry no longer exists" — skip the per-slug warm. */
const DELETE_EVENTS = new Set(['entry.delete', 'entry.unpublish']);

async function warmAfterRevalidate(event: WebhookEvent): Promise<void> {
  const isDelete = DELETE_EVENTS.has(event.event);

  switch (event.model) {
    case 'article':
      await Promise.allSettled([
        fetchStrapiArticles(),
        event.slug && !isDelete ? fetchStrapiArticleBySlug(event.slug) : Promise.resolve(null),
      ]);
      break;
    case 'author':
      await Promise.allSettled([
        // Order matters: refresh the source list first so derived caches are
        // computed from fresh data when getStrapiTeamMembers/getStrapiCardMembers run.
        fetchStrapiAuthors().then(() =>
          Promise.allSettled([getStrapiTeamMembers(), getStrapiCardMembers()])
        ),
      ]);
      break;
    case 'roadmap':
      await fetchStrapiRoadmaps();
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

  // Adapt Astro's `Request` to the package's lowest-common-denominator shape.
  // Fetch `Headers` doesn't have a string index signature so the package's
  // `WebhookRequest` rejects it at the type level, even though `.get()` works
  // at runtime — wrap it so only the methods the handler needs are exposed.
  const webhookReq = {
    method: request.method,
    headers: {
      get: (name: string): string | null => request.headers.get(name),
    },
    text: () => request.text(),
    json: () => request.json(),
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

  if (body && typeof body === 'object' && status === 200) {
    (body as Record<string, unknown>).duration = `${Date.now() - startTime}ms`;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
