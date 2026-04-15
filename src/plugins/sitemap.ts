import fs from 'node:fs';
import type {
  AstroConfig,
  AstroIntegration,
  IntegrationResolvedRoute,
  AstroIntegrationLogger,
} from 'astro';

const errorPrefix = '\x1b[31m';
const infoPrefix = '\x1b[32m';
const warnPrefix = '\x1b[33m';
const resetPrefix = '\x1b[0m';

export type SitemapOptions =
  | {
      exclude?: string[];
    }
  | undefined;

const MINTLIFY_TARGET = 'https://datum-4926dda5.mintlify.dev';

interface SitemapEntry {
  url: string;
  lastmod?: string;
}

const writeSitemapFile = (filePath: string, entries: SitemapEntry[]) => {
  try {
    const urlElements = entries
      .map(({ url, lastmod }) =>
        lastmod
          ? `<url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`
          : `<url><loc>${url}</loc></url>`
      )
      .join('');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${urlElements}
      </urlset>`;

    fs.writeFileSync(filePath, sitemapXml, 'utf-8');
    console.log(`Generated at: %s%s\n`, filePath, resetPrefix);
  } catch (err) {
    console.log(
      `%sError writing sitemap file: %s%s`,
      errorPrefix,
      (err as Error).message,
      resetPrefix
    );
  }
};

/**
 * Fetch all blog post slugs and publish dates from Strapi.
 * Uses the same GraphQL endpoint as the rest of the site.
 */
async function fetchStrapiSitemapEntries(siteUrl: string): Promise<SitemapEntry[]> {
  const strapiUrl =
    process.env.STRAPI_URL || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
  const strapiToken = process.env.STRAPI_TOKEN || '';

  const query = `
    query GetArticleSlugs {
      articles(pagination: { limit: 500 }, sort: ["originalPublishedAt:desc"]) {
        slug
        originalPublishedAt
      }
    }
  `;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (strapiToken) headers['Authorization'] = `Bearer ${strapiToken}`;

    const response = await fetch(`${strapiUrl}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.log(`%sStrapi sitemap fetch failed: ${response.status}%s`, warnPrefix, resetPrefix);
      return [];
    }

    const result = (await response.json()) as {
      data?: { articles?: Array<{ slug: string; originalPublishedAt?: string }> };
    };

    const articles = result.data?.articles ?? [];
    return articles
      .filter((a) => a.slug && !Number.isInteger(parseInt(a.slug, 10)))
      .map((a) => ({
        url: `${siteUrl}blog/${a.slug}/`,
        lastmod: a.originalPublishedAt
          ? new Date(a.originalPublishedAt).toISOString().split('T')[0]
          : undefined,
      }));
  } catch (err) {
    console.log(
      `%sError fetching Strapi articles for sitemap: %s%s`,
      warnPrefix,
      (err as Error).message,
      resetPrefix
    );
    return [];
  }
}

/**
 * Fetch the Mintlify docs sitemap and rewrite URLs to use datum.net domain.
 * Mintlify's canonical URLs may use the Mintlify dev subdomain — we rewrite
 * them to the reverse-proxied datum.net equivalent.
 */
async function fetchMintlifySitemapEntries(siteUrl: string): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(`${MINTLIFY_TARGET}/docs/sitemap.xml`, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'datum.net-sitemap-builder/1.0' },
    });

    if (!response.ok) {
      console.log(`%sMintlify sitemap fetch failed: ${response.status}%s`, warnPrefix, resetPrefix);
      return [];
    }

    const xml = await response.text();

    // Extract <loc> values
    const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
    // Extract <lastmod> values (parallel array)
    const lastmodMatches = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)];

    const entries: SitemapEntry[] = [];
    const siteBase = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

    for (let i = 0; i < locMatches.length; i++) {
      let url = locMatches[i][1].trim();

      // Rewrite Mintlify dev domain → datum.net
      url = url.replace(MINTLIFY_TARGET, siteBase);

      // Skip non-docs pages that might appear in the Mintlify sitemap
      if (!url.includes('/docs') && !url.includes('/api-reference')) continue;

      const lastmod = lastmodMatches[i]?.[1]?.trim();
      entries.push({ url, lastmod });
    }

    return entries;
  } catch (err) {
    console.log(
      `%sError fetching Mintlify sitemap: %s%s`,
      warnPrefix,
      (err as Error).message,
      resetPrefix
    );
    return [];
  }
}

const createSitemapBuilderIntegration = (options?: SitemapOptions): AstroIntegration => {
  let config: AstroConfig;
  let routes: IntegrationResolvedRoute[];

  return {
    name: 'SitemapBuilder',
    hooks: {
      'astro:config:done': async ({ config: cfg }) => {
        config = cfg;
      },
      'astro:routes:resolved': (options: {
        routes: IntegrationResolvedRoute[];
        logger: AstroIntegrationLogger;
      }) => {
        routes = options.routes;
      },
      'astro:build:done': async ({ pages }) => {
        try {
          if (!config.site) {
            console.log(
              `%sCannot build sitemap without a site (\`astro.config.site\`) URL.%s`,
              warnPrefix
            );
            return;
          }
          console.log(`%s[Sitemap Generator]`, infoPrefix);

          const fullSitemapFilePath = `./dist/client/sitemap.xml`;
          const finalSiteUrl = new URL(config.base, config.site);
          const excepts = options?.exclude || [];

          // Static Astro pages
          const pageUrls: SitemapEntry[] = pages
            .filter((p) => !excepts.includes(p.pathname.replace(/^\/|\/$/g, '')))
            .map((p) => {
              if (p.pathname !== '' && !finalSiteUrl.pathname.endsWith('/'))
                finalSiteUrl.pathname += '/';
              if (p.pathname.startsWith('/')) p.pathname = p.pathname.slice(1);
              const fullPath = finalSiteUrl.pathname + p.pathname;
              return { url: new URL(fullPath, finalSiteUrl).href };
            });

          const routeUrls: SitemapEntry[] = routes.reduce<SitemapEntry[]>((urls, r) => {
            if (r.type !== 'page') return urls;

            if (r.pathname && !excepts.includes(r.pathname.replace(/^\/|\/$/g, ''))) {
              let fullPath = finalSiteUrl.pathname;
              if (fullPath.endsWith('/')) fullPath += r.generate(r.pathname).substring(1);
              else fullPath += r.generate(r.pathname);

              const newUrl = new URL(fullPath, finalSiteUrl).href;
              urls.push({ url: newUrl.endsWith('/') ? newUrl : newUrl + '/' });
            }
            return urls;
          }, []);

          const siteUrl = finalSiteUrl.href.endsWith('/')
            ? finalSiteUrl.href
            : finalSiteUrl.href + '/';

          // Fetch dynamic sources in parallel
          console.log(`%s  → Fetching blog posts from Strapi...`, infoPrefix);
          console.log(`%s  → Fetching docs pages from Mintlify...`, infoPrefix);
          const [strapiEntries, mintlifyEntries] = await Promise.all([
            fetchStrapiSitemapEntries(siteUrl),
            fetchMintlifySitemapEntries(siteUrl),
          ]);

          console.log(`%s  → ${strapiEntries.length} blog posts added`, infoPrefix);
          console.log(`%s  → ${mintlifyEntries.length} docs pages added`, infoPrefix);

          // Merge and deduplicate by URL
          const allUrlsMap = new Map<string, SitemapEntry>();
          for (const entry of [...pageUrls, ...routeUrls, ...strapiEntries, ...mintlifyEntries]) {
            if (!allUrlsMap.has(entry.url)) {
              allUrlsMap.set(entry.url, entry);
            }
          }

          const allEntries = Array.from(allUrlsMap.values()).sort((a, b) =>
            a.url.localeCompare(b.url)
          );

          writeSitemapFile(fullSitemapFilePath, allEntries);
        } catch (err) {
          console.log(
            `%sError building sitemap: %s%s`,
            errorPrefix,
            (err as Error).message,
            resetPrefix
          );
        }
      },
    },
  };
};

export default createSitemapBuilderIntegration;
