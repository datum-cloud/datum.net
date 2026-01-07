import { stargazerCount } from '@libs/datum';
import { sequence } from 'astro:middleware';
import type { MiddlewareHandler } from 'astro';

const PROTECTED_ROUTES = [/^\/dev($|\/.*)/];

const REDIRECTS: Record<
  string,
  { destination: string; status: 300 | 301 | 302 | 303 | 304 | 307 | 308 }
> = {
  '/product': { destination: '/features/', status: 302 },
  '/feature/': { destination: '/features/', status: 301 },
  '/product/overview/overview': { destination: '/features/', status: 301 },
  '/team': { destination: '/about/', status: 302 },
  '/jobs/': { destination: '/careers/', status: 302 },
  '/docs/overview/': { destination: '/docs/', status: 302 },
  '/docs/roadmap': { destination: '/resources/roadmap/', status: 302 },
  '/docs/tutorials/gateway': { destination: '/docs/tutorials/httpproxy/', status: 302 },
  '/docs/get-started/datum-concepts/': {
    destination: '/docs/quickstart/datum-concepts/',
    status: 302,
  },
  '/docs/tasks/create-project/': { destination: '/docs/platform/projects/', status: 302 },
  '/docs/tasks/developer-guide': { destination: '/docs/developer-guide/', status: 302 },
  '/docs/task/tools/': { destination: '/docs/', status: 301 },
  '/docs/tutorials/grafana/': { destination: '/docs/workflows/grafana-cloud/', status: 301 },
  '/docs/tutorials/httpproxy/': { destination: '/docs/runtime/proxy/', status: 301 },
  '/docs/get-started/': { destination: '/docs/quickstart/', status: 302 },
  '/docs/contribution-guidelines/': { destination: '/docs/', status: 301 },
  '/docs/guides/using-byoc/': { destination: '/docs/', status: 301 },
  '/docs/workflows/': { destination: '/docs/', status: 302 },
  '/docs/workflows/1-click-waf/': { destination: '/docs/runtime/proxy/', status: 302 },
  '/handbook/engineering/rfc/': { destination: '/handbook/technical/', status: 301 },
  '/handbook/company/what-we-believe/': { destination: '/handbook/about/purpose/', status: 302 },
  '/handbook/culture/anti-harassment-and-discrimination-policy/': {
    destination: '/handbook/policy/anti-harassment/',
    status: 302,
  },
  '/handbook/company/who-are-we-building-for/': {
    destination: '/handbook/product/customers/',
    status: 302,
  },
  '/handbook/people/travel-policy/': { destination: '/handbook/culture/traveling/', status: 302 },
  '/handbook/company/where-are-we-now/': { destination: '/handbook/about/strategy/', status: 302 },
  '/handbook/go-to-market/keep-momentum/': {
    destination: '/handbook/about/strategy/',
    status: 302,
  },
  '/handbook/go-to-market/approach-gtm/': { destination: '/handbook/about/model/', status: 302 },
  '/netzero/overview/overview': { destination: '/', status: 301 },
  '/api-reference/invite/deletes-a-invite-by-id': {
    destination: '/docs/api/reference/',
    status: 301,
  },
  '/blog/internet-superpowers-for-every-builder/)_/': {
    destination: '/blog/internet-superpowers-for-every-builder/',
    status: 301,
  },
  '/legal/': { destination: '/legal/terms/', status: 302 },
  '/privacy-policy/': { destination: '/legal/privacy/', status: 302 },
  '/privacy/': { destination: '/legal/privacy/', status: 302 },
  '/terms-of-service/': { destination: '/legal/terms/', status: 302 },
  '/index.asp': { destination: '/', status: 301 },
  '/logon.html': { destination: 'https://auth.datum.net/ui/v2/login/loginname', status: 302 },
  '/public-slack/': { destination: 'https://link.datum.net/discord', status: 302 },
  '/handbook/company/': { destination: '/handbook/about/', status: 302 },
  '/handbook/engineering/': { destination: '/handbook/technical/', status: 302 },
  '/handbook/go-to-market/': { destination: '/handbook/about/', status: 302 },
  '/handbook/culture/rythms/': { destination: '/handbook/culture/rhythms/', status: 301 },
};

const isProtected = (path: string): boolean => {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(path));
};

const redirectMiddleware: MiddlewareHandler = async ({ url, redirect }, next) => {
  const pathName = new URL(url).pathname;
  const redirectConfig = REDIRECTS[pathName];

  if (redirectConfig) {
    const response = redirect(redirectConfig.destination, redirectConfig.status);
    response.headers.set('Cache-Control', 'no-cache');
    return response;
  }

  return next();
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

export const onRequest = sequence(redirectMiddleware, routeGuard, baseMiddleware);
