// src/libs/rateLimit.ts
//
// Minimal in-memory fixed-window rate limiter for this site's own public API
// routes (see src/data/openapi.ts) — surfaces the standard RateLimit-* response
// headers (draft-ietf-httpapi-ratelimit-headers) so agents can self-throttle
// instead of guessing. This is a lightweight polling-endpoint signal, not a
// security boundary: counters are per-process, so the effective ceiling scales
// with server replica count. That's an acceptable tradeoff for what this
// guards today; a shared store (e.g. Redis, already used elsewhere in this
// codebase for caching) would be needed before relying on it for anything
// stricter.

export interface RateLimitConfig {
  /** Max requests allowed per window. */
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the current window resets. */
  resetSeconds: number;
}

interface WindowState {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, WindowState>();

// Opportunistic cleanup so a long-lived process doesn't accumulate an
// unbounded number of stale per-key entries (e.g. many distinct client IPs
// over a long uptime) — sweeps expired windows once the map grows past this
// size, rather than running a timer no one asked for.
const MAX_TRACKED_KEYS = 10_000;

function sweepExpired(now: number, windowMs: number): void {
  for (const [key, state] of buckets) {
    if (now - state.windowStart >= windowMs) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitConfig,
  now: number = Date.now()
): RateLimitResult {
  if (buckets.size > MAX_TRACKED_KEYS) {
    sweepExpired(now, windowMs);
  }

  const existing = buckets.get(key);
  const windowIsCurrent = existing !== undefined && now - existing.windowStart < windowMs;
  const windowStart = windowIsCurrent ? existing.windowStart : now;
  const count = windowIsCurrent ? existing.count + 1 : 1;

  buckets.set(key, { count, windowStart });

  const resetSeconds = Math.max(0, Math.ceil((windowStart + windowMs - now) / 1000));

  return {
    limited: count > limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetSeconds,
  };
}

/** Test-only: clear all tracked windows between test cases. */
export function _resetRateLimitState(): void {
  buckets.clear();
}
