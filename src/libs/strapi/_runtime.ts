// src/libs/strapi/_runtime.ts
/**
 * Shared `@datum-cloud/strapi-revalidate` runtime.
 *
 * Wires the GraphQL client, cache manager, and validated config once at
 * module load. Every Strapi fetcher and the webhook route import from here so
 * timeouts, retries, cache directories, and tag conventions stay in one place.
 *
 * Env vars (read from `process.env` at runtime — never `import.meta.env`, so secrets
 * are not inlined into server bundles at build time):
 *  - STRAPI_URL              Strapi base URL
 *  - STRAPI_TOKEN            API token (sent as `Authorization: Bearer …`)
 *  - STRAPI_CACHE_TTL        Primary cache TTL in seconds (default 2592000 = 30d)
 *  - STRAPI_TIMEOUT          Per-request timeout in seconds (default 3)
 *  - STRAPI_WEBHOOK_SECRET   Secret expected on inbound webhook requests
 *  - STRAPI_DEBUG            "true" to enable verbose cache/client logging
 */

import { cwd } from 'node:process';
import { loadEnv } from 'vite';
import { createStrapiRevalidate } from '@datum-cloud/strapi-revalidate';
import type { RevalidateConfig } from '@datum-cloud/strapi-revalidate';

const DEFAULT_STRAPI_URL = 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const DEFAULT_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_TIMEOUT_SECONDS = 6;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

// Local dev loads .env into import.meta.env; merge into process.env when secrets are unset
// so SSR routes can reach Strapi without inlining tokens into build output.
if (!readEnv('STRAPI_TOKEN')) {
  Object.assign(process.env, loadEnv(process.env.NODE_ENV ?? 'development', cwd(), ''));
}

function readSeconds(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (raw === undefined) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

const url = readEnv('STRAPI_URL') ?? DEFAULT_STRAPI_URL;
// Token is optional in 0.2.0+: omitting it skips the Authorization header,
// allowing unauthenticated requests to publicly-readable Strapi endpoints.
const token = readEnv('STRAPI_TOKEN');
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
