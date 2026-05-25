import { stargazerCount } from '@libs/datum';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];

const HELLO_PROFILE_PATH = /^\/hello\/([^/]+)$/;

const helloProfileRewrite: MiddlewareHandler = (context, next) => {
  const pathName = new URL(context.url).pathname;
  if (HELLO_PROFILE_PATH.test(pathName)) {
    return context.rewrite(new URL('/hello', context.url));
  }
  return next();
};

const DOCS_PATH_PREFIX = /^\/docs(\/|$)/;

const AGENT_LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</docs/>; rel="service-doc"',
  '</.well-known/openid-configuration>; rel="openid-configuration"',
  '</.well-known/mcp/server-card.json>; rel="describedby"',
].join(', ');

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

export const docsHeaders: MiddlewareHandler = async ({ url }, next) => {
  const pathName = new URL(url).pathname;

  if (!DOCS_PATH_PREFIX.test(pathName)) {
    return next();
  }

  const response = await next();
  const mutableResponse = new Response(response.body, response);

  mutableResponse.headers.delete('X-Frame-Options');
  mutableResponse.headers.set('Content-Security-Policy', 'frame-ancestors *');

  return mutableResponse;
};

// Inject RFC 8288 Link headers on all HTML responses for agent discovery.
// In production, server.mjs also injects these for static files served by sirv;
// this handler covers the dev server and any SSR-rendered routes.
const agentDiscovery: MiddlewareHandler = async (_context, next) => {
  const response = await next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;
  const mutable = new Response(response.body, response);
  if (!mutable.headers.has('Link')) {
    mutable.headers.set('Link', AGENT_LINK_HEADERS);
  }
  return mutable;
};

export const onRequest = sequence(
  helloProfileRewrite,
  routeGuard,
  agentDiscovery,
  baseMiddleware,
  docsHeaders
);
