import fs from 'node:fs';
import type { AstroConfig, AstroIntegration } from 'astro';

const errorPrefix = '\x1b[31m';
const infoPrefix = '\x1b[32m';
const warnPrefix = '\x1b[33m';
const resetPrefix = '\x1b[0m';

export type SitemapOptions =
  | {
      exclude?: string[];
    }
  | undefined;

const writeSitemapFile = (filePath: string, entries: string[]) => {
  try {
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${entries.join('')}
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

const createSitemapBuilderIntegration = (options?: SitemapOptions): AstroIntegration => {
  let config: AstroConfig;

  return {
    name: 'SitemapBuilder',
    hooks: {
      'astro:config:done': async ({ config: cfg }) => {
        config = cfg;
      },

      'astro:build:done': async ({ routes, pages }) => {
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

          const pageUrls = pages
            .filter((p) => !excepts.includes(p.pathname.replace(/^\/|\/$/g, '')))
            .map((p) => {
              if (p.pathname !== '' && !finalSiteUrl.pathname.endsWith('/'))
                finalSiteUrl.pathname += '/';
              if (p.pathname.startsWith('/')) p.pathname = p.pathname.slice(1);
              const fullPath = finalSiteUrl.pathname + p.pathname;
              return new URL(fullPath, finalSiteUrl).href;
            });

          const routeUrls = routes.reduce<string[]>((urls: string[], r) => {
            if (r.type !== 'page') return urls;

            if (r.pathname && !excepts.includes(r.pathname.replace(/^\/|\/$/g, ''))) {
              let fullPath = finalSiteUrl.pathname;
              if (fullPath.endsWith('/')) fullPath += r.generate(r.pathname).substring(1);
              else fullPath += r.generate(r.pathname);

              const newUrl = new URL(fullPath, finalSiteUrl).href;

              if (!newUrl.endsWith('/')) {
                urls.push(newUrl + '/');
              } else {
                urls.push(newUrl);
              }
            }
            return urls;
          }, []);

          const allUrls = Array.from(new Set([...pageUrls, ...routeUrls]));
          allUrls.sort();

          writeSitemapFile(
            fullSitemapFilePath,
            allUrls.map((url) => `<url><loc>${url}</loc></url>`)
          );
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
