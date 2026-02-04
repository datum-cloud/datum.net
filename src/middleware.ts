import { stargazerCount } from '@libs/datum';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];
type RedirectStatus = 300 | 301 | 302 | 303 | 304 | 307 | 308;

const REDIRECTS: Record<string, { destination: string; status: RedirectStatus }> = {
  '/docs/quickstart/datumctl': { destination: '/docs/datumctl/', status: 301 },
  '/docs/quickstart/datumctl/': { destination: '/docs/datumctl/', status: 301 },
};

const isProtected = (path: string): boolean => {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(path));
};

const routeGuard: MiddlewareHandler = async ({ url, redirect }, next) => {
  const mode = process.env.MODE || import.meta.env.MODE;
  const pathName = new URL(url).pathname;

  const redirectConfig = REDIRECTS[pathName];
  if (redirectConfig) {
    return redirect(redirectConfig.destination, redirectConfig.status);
  }

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

export const onRequest = sequence(routeGuard, baseMiddleware);
