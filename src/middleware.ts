import { stargazerCount } from '@libs/datum';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.marker.io https://hyperping.com https://*.usefathom.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.datumstatus.net https://api.github.com https://*.datum.net https://*.marker.io https://*.helpscout.net",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; '),
};

const isProtected = (path: string): boolean => {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(path));
};

const routeGuard: MiddlewareHandler = async ({ url, redirect }, next) => {
  const mode = process.env.MODE || import.meta.env.MODE;
  const pathName = new URL(url).pathname;

  if (isProtected(pathName)) {
    // only for development mode, to ease testing
    if (mode == 'production') {
      return redirect(`/`);
    }
  }

  return next();
};

const securityHeaders: MiddlewareHandler = async (_context, next) => {
  const response = await next();

  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
};

const baseMiddleware: MiddlewareHandler = async (context, next) => {
  const starCount = await stargazerCount();
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
  const formattedStarCount = formatter.format(starCount);

  context.locals.starCount = () => formattedStarCount;

  return next();
};

export const onRequest = sequence(routeGuard, baseMiddleware, securityHeaders);
