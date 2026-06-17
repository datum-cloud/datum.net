// src/libs/strapi/httpCache.ts
/**
 * HTTP Cache-Control for SSR routes backed by webhook-invalidated Strapi cache.
 *
 * - `s-maxage=60` — shared caches (CDN) revalidate with origin every minute so
 *   webhook-driven server cache updates propagate without a CDN purge.
 * - `max-age=300` — browsers may reuse responses briefly for performance.
 * - `must-revalidate` — no stale-while-revalidate window after expiry.
 */
export const STRAPI_SSR_CACHE_CONTROL = 'public, max-age=300, s-maxage=60, must-revalidate';
