// src/libs/strapi/_runtime.ts
/**
 * Shared @datum-cloud/strapi-revalidate runtime.
 *
 * Cache driver selection (in priority order):
 *  1. Redis  — when REDIS_URL is set (required for multi-replica deployments)
 *  2. File   — fallback for single-instance / local dev
 *
 * The file driver is always used as the persistent fallback so Strapi
 * outages don't take the site down even when Redis is the primary.
 *
 * Env vars:
 *  - STRAPI_URL              Strapi base URL
 *  - STRAPI_TOKEN            API token (Authorization: Bearer …)
 *  - STRAPI_CACHE_TTL        Primary cache TTL in seconds (default 2592000 = 30d)
 *  - STRAPI_TIMEOUT          Per-request timeout in seconds (default 6)
 *  - STRAPI_WEBHOOK_SECRET   Secret expected on inbound webhook requests
 *  - STRAPI_DEBUG            "true" to enable verbose cache/client logging
 *  - REDIS_URL               Redis connection URL (enables Redis primary cache)
 *  - REDIS_KEY_PREFIX        Key prefix in Redis (default "strapi:")
 */

import { cwd } from 'node:process';
import { loadEnv } from 'vite';
import Redis from 'ioredis';
import {
  CacheManager,
  FileCacheDriver,
  createStrapiClient,
  createWebhookHandler,
  revalidateConfigSchema,
} from '@datum-cloud/strapi-revalidate';
import { RedisCacheDriver } from './drivers/redis';

const DEFAULT_STRAPI_URL = 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const DEFAULT_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_TIMEOUT_SECONDS = 6;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

// Local dev: merge .env into process.env so SSR routes reach Strapi without
// inlining secrets into build output.
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
const token = readEnv('STRAPI_TOKEN');
const debug = readEnv('STRAPI_DEBUG') === 'true' || readEnv('STRAPI_DEBUG') === '1';
const ttl = readSeconds('STRAPI_CACHE_TTL', DEFAULT_CACHE_TTL_SECONDS);

const config = revalidateConfigSchema.parse({
  url,
  token,
  cache: { driver: 'file', dir: '.cache', fallbackDir: '.cache/strapi-fallback', ttl },
  timeout: readSeconds('STRAPI_TIMEOUT', DEFAULT_TIMEOUT_SECONDS) * 1000,
  retry: 0,
  debug,
  webhook: {
    secret: readEnv('STRAPI_WEBHOOK_SECRET'),
    tagMap: {
      'api::roadmap.roadmap': ['roadmaps'],
    },
  },
});

const fallback = new FileCacheDriver({ dir: '.cache/strapi-fallback' });

const redisUrl = readEnv('REDIS_URL');
const keyPrefix = readEnv('REDIS_KEY_PREFIX') ?? 'strapi:';

/**
 * Shared raw ioredis client. `null` when Redis is not configured (local dev).
 * Import this in other libs (e.g. githubBacklog.ts) to reuse the same connection
 * instead of opening a second ioredis socket.
 */
export const redisClient: Redis | null = redisUrl
  ? new Redis(redisUrl, { lazyConnect: true, enableReadyCheck: false })
  : null;

/** Key prefix used for all Redis keys in this app (default "strapi:"). */
export const redisKeyPrefix = keyPrefix;

let primary: FileCacheDriver | RedisCacheDriver;

if (redisClient) {
  primary = new RedisCacheDriver(redisClient, keyPrefix);
  if (debug) console.debug('[strapi-runtime] Primary cache: Redis at', redisUrl);
} else {
  primary = new FileCacheDriver({ dir: '.cache' });
  if (debug) console.debug('[strapi-runtime] Primary cache: file (.cache)');
}

export const cache = new CacheManager({ primary, fallback, defaultTtl: ttl, debug });

/**
 * Delete all primary-cache keys whose names start with `prefix`.
 * Fallback entries are preserved (same semantics as `cache.delete`).
 * @returns Deleted key names
 */
export async function deletePrimaryCacheByPrefix(prefix: string): Promise<string[]> {
  const keys = await primary.keys(prefix);
  await Promise.all(keys.map((key) => cache.delete(key)));
  if (debug && keys.length > 0) {
    console.debug(
      `[strapi-runtime] deleted ${keys.length} primary cache key(s) with prefix "${prefix}"`
    );
  }
  return keys;
}

export const client = createStrapiClient(config);
export const webhook = createWebhookHandler({ config, cache });
export { config };
export type { RevalidateConfig } from '@datum-cloud/strapi-revalidate';
