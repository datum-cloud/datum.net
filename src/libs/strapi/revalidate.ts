// src/libs/strapi/revalidate.ts
/**
 * Shared `@datum-cloud/strapi-revalidate` bundle.
 *
 * Lazy-initialized so importing this module does not require STRAPI_TOKEN
 * (e.g. `rss.xml` only needs articles from `@libs/strapi`). Token is validated
 * on first use (fetch, webhook, cache write).
 *
 * Note: `.env` is listed in `.dockerignore`, so Docker `npm run build` does not
 * see local secrets — pass STRAPI_TOKEN as a build-arg/CI env for `build:cache`.
 */

import { createStrapiRevalidate, type StrapiRevalidate } from '@datum-cloud/strapi-revalidate';
import type { CacheManager } from '@datum-cloud/strapi-revalidate/cache';
import type { CacheSetOptions } from '@datum-cloud/strapi-revalidate/cache';
import type { WebhookHandler } from '@datum-cloud/strapi-revalidate/webhook';

/** Astro/Vite expose `.env` on `import.meta.env` in SSR; `process.env` alone is often empty in dev. */
function envString(key: string): string {
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  const value = fromMeta ?? process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

const STRAPI_URL =
  envString('STRAPI_URL') || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';

const DEFAULT_CACHE_TTL_SEC = 30 * 24 * 60 * 60; // 30 days
const envTtlSec = parseInt(
  import.meta.env?.STRAPI_CACHE_TTL ??
    process.env.STRAPI_CACHE_TTL ??
    String(DEFAULT_CACHE_TTL_SEC),
  10
);
const CACHE_TTL_SEC = Number.isNaN(envTtlSec) || envTtlSec <= 0 ? DEFAULT_CACHE_TTL_SEC : envTtlSec;

const DEFAULT_TIMEOUT_MS = 10_000;
const envTimeoutSec = parseInt(
  import.meta.env?.STRAPI_TIMEOUT ?? process.env.STRAPI_TIMEOUT ?? '10',
  10
);
const TIMEOUT_MS =
  Number.isNaN(envTimeoutSec) || envTimeoutSec <= 0 ? DEFAULT_TIMEOUT_MS : envTimeoutSec * 1000;

const tagMap: Record<string, string[]> = {
  'api::roadmap.roadmap': ['roadmaps'],
};

let bundle: StrapiRevalidate | null = null;

function getBundle(): StrapiRevalidate {
  if (bundle) {
    return bundle;
  }

  const token = envString('STRAPI_TOKEN');
  if (!token) {
    throw new Error(
      '[strapi-revalidate] STRAPI_TOKEN is required when fetching or invalidating Strapi content. ' +
        'Locally: set STRAPI_TOKEN in .env. Docker build: .env is not copied (.dockerignore); ' +
        'pass STRAPI_TOKEN as a build-arg or CI secret for npm run build:cache.'
    );
  }

  bundle = createStrapiRevalidate({
    url: STRAPI_URL,
    token,
    timeout: TIMEOUT_MS,
    cache: {
      dir: '.cache',
      fallbackDir: '.cache/strapi-fallback',
      ttl: CACHE_TTL_SEC,
    },
    webhook: {
      // No `secret` here — the outer Astro endpoint already verifies
      // `X-Webhook-Secret` before dispatching to this handler.
      tagMap,
      onRevalidate: (event) => {
        // Fire-and-forget warmup. Library does not await async work scheduled
        // outside the returned promise, so Strapi sees an immediate 200.
        if (event.model === 'roadmap') {
          void warmRoadmap();
        }
      },
    },
  });

  return bundle;
}

async function warmRoadmap(): Promise<void> {
  try {
    const { fetchStrapiRoadmaps } = await import('./roadmaps');
    await fetchStrapiRoadmaps();
  } catch (err) {
    console.error('[strapi-revalidate] roadmap warmup failed:', err);
  }
}

/** GraphQL client — initialized on first query. */
export const client = {
  query<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
    return getBundle().client.query<T>(query, variables);
  },
};

/** Cache manager — initialized on first cache operation. */
export const cache: Pick<CacheManager, 'get' | 'getFallback' | 'set' | 'delete' | 'invalidate'> = {
  get<T>(key: string) {
    return getBundle().cache.get<T>(key);
  },
  getFallback<T>(key: string) {
    return getBundle().cache.getFallback<T>(key);
  },
  set<T>(key: string, data: T, options?: CacheSetOptions) {
    return getBundle().cache.set(key, data, options);
  },
  delete(key: string) {
    return getBundle().cache.delete(key);
  },
  invalidate(tag: string) {
    return getBundle().cache.invalidate(tag);
  },
};

/** Webhook handler — initialized on first request. */
export const webhook: WebhookHandler = (req, res) => getBundle().webhook(req, res);

/** Validated config after first initialization. */
export function getRevalidateConfig() {
  return getBundle().config;
}
