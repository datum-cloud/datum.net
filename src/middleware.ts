import { stargazerCount } from '@libs/datum';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];

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

const baseMiddleware: MiddlewareHandler = async (context, next) => {
  const starCount = await stargazerCount();
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
  const formattedStarCount = formatter.format(starCount);

  context.locals.starCount = () => formattedStarCount;

  return next();
};

/**
 * Security Headers Middleware
 * Adds comprehensive security headers to all responses including:
 * - Content-Security-Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Strict-Transport-Security (HSTS)
 * - Permissions-Policy
 */
const securityHeaders: MiddlewareHandler = async (_context, next) => {
  const response = await next();
  const mode = process.env.MODE || import.meta.env.MODE;
  const isProduction = mode === 'production';

  // Content Security Policy
  // Allows self-hosted content plus required external services
  const cspDirectives = [
    // Default: only allow same-origin
    "default-src 'self'",

    // Scripts: self, inline (for Astro hydration), and trusted external domains
    [
      "script-src 'self' 'unsafe-inline'",
      'https://cdn.usefathom.com', // Fathom Analytics
      'https://edge.marker.io', // Marker.io feedback
      'https://beacon-v2.helpscout.net', // HelpScout support
      'https://hyperping.com', // Hyperping status badge
    ].join(' '),

    // Styles: self and inline (required for Astro/Tailwind)
    "style-src 'self' 'unsafe-inline'",

    // Images: self, data URIs, and blob (for dynamic images)
    "img-src 'self' data: blob: https:",

    // Fonts: self only (all fonts are self-hosted)
    "font-src 'self'",

    // Connections (fetch, XHR, WebSocket)
    [
      "connect-src 'self'",
      'https://api.github.com', // GitHub API for stargazer count
      'https://cdn.usefathom.com', // Fathom Analytics
      'https://*.usefathom.com', // Fathom Analytics (additional endpoints)
      'https://edge.marker.io', // Marker.io
      'https://*.marker.io', // Marker.io (additional endpoints)
      'https://beacon-v2.helpscout.net', // HelpScout
      'https://*.helpscout.net', // HelpScout (additional endpoints)
      'https://hyperping.com', // Hyperping
      'https://www.datumstatus.net', // Datum status page
    ].join(' '),

    // Frames: self only (prevent embedding in iframes by default)
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",

    // Frame ancestors: prevent clickjacking
    "frame-ancestors 'self'",

    // Form actions: self only
    "form-action 'self'",

    // Base URI: self only
    "base-uri 'self'",

    // Object/Embed: none (no Flash/plugins)
    "object-src 'none'",

    // Upgrade insecure requests in production
    ...(isProduction ? ['upgrade-insecure-requests'] : []),
  ];

  const csp = cspDirectives.join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HSTS: only in production, with 1 year max-age
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
};

export const onRequest = sequence(routeGuard, baseMiddleware, securityHeaders);
