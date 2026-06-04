// src/libs/strapi/_runtime.ts
/**
 * Shared `@datum-cloud/strapi-revalidate` runtime.
 *
 * Wires the GraphQL client, cache manager, and validated config once at
 * module load. Every Strapi fetcher and the webhook route import from here so
 * timeouts, retries, cache directories, and tag conventions stay in one place.
 *
 * Env vars (read from `import.meta.env` when available, then `process.env`):
 *  - STRAPI_URL              Strapi base URL
 *  - STRAPI_TOKEN            API token (sent as `Authorization: Bearer …`)
 *  - STRAPI_CACHE_TTL        Primary cache TTL in seconds (default 2592000 = 30d)
 *  - STRAPI_TIMEOUT          Per-request timeout in seconds (default 3)
 *  - STRAPI_WEBHOOK_SECRET   Secret expected on inbound webhook requests
 *  - STRAPI_DEBUG            "true" to enable verbose cache/client logging
 */

import { createStrapiRevalidate } from '@datum-cloud/strapi-revalidate';
import type { RevalidateConfig } from '@datum-cloud/strapi-revalidate';

const DEFAULT_STRAPI_URL = 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const DEFAULT_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_TIMEOUT_SECONDS = 3;

function readEnv(name: string): string | undefined {
  const viteValue =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as Record<string, unknown>)[name]
      : undefined;
  if (typeof viteValue === 'string' && viteValue.length > 0) return viteValue;
  const nodeValue = process.env[name];
  if (typeof nodeValue === 'string' && nodeValue.length > 0) return nodeValue;
  return undefined;
}

function readSeconds(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (raw === undefined) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

const url = readEnv('STRAPI_URL') ?? DEFAULT_STRAPI_URL;
// The package's zod schema requires a non-empty token. Fresh-clone builds without
// secrets fall back to stale cache anyway, so a placeholder keeps init succeeding
// — Strapi simply 401s and we serve from `.cache/strapi-fallback/`.
const token = readEnv('STRAPI_TOKEN') ?? 'placeholder-no-token';
const debug = readEnv('STRAPI_DEBUG') === 'true' || readEnv('STRAPI_DEBUG') === '1';

const strapiRevalidate = createStrapiRevalidate({
  url,
  token,
  cache: {
    driver: 'file',
    dir: '.cache',
    fallbackDir: '.cache/strapi-fallback',
    ttl: readSeconds('STRAPI_CACHE_TTL', DEFAULT_CACHE_TTL_SECONDS),
  },
  timeout: readSeconds('STRAPI_TIMEOUT', DEFAULT_TIMEOUT_SECONDS) * 1000,
  // Preserve current no-retry behaviour; revisit when adopting retry is a separate decision.
  retry: 0,
  webhook: {
    secret: readEnv('STRAPI_WEBHOOK_SECRET'),
    // Default map handles api::article.article and api::author.author; roadmaps need an explicit
    // entry so the webhook invalidates the `roadmaps` tag instead of the singular fallback.
    tagMap: {
      'api::roadmap.roadmap': ['roadmaps'],
    },
  },
  debug,
});

export const { client, cache, config } = strapiRevalidate;

/** Re-export so consumers can build webhook handlers with custom `onRevalidate`. */
export type { RevalidateConfig };
