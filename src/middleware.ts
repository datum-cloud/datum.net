import { stargazerCount } from '@libs/datum';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];

const DOCS_PATH_PREFIX = /^\/docs(\/|$)/;

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

export const onRequest = sequence(routeGuard, baseMiddleware, docsHeaders);
