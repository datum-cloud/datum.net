import { defineConfig } from 'astro/config';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import mermaid from 'astro-mermaid';

import { loadEnv } from 'vite';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';

import announcement from './src/plugins/announcement.ts';
import { remarkModifiedTime } from './src/plugins/remarkModifiedTime.mjs';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { expressiveCodeRehypeOptions } from './src/utils/expressiveCodeOptions.ts';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Content-type overrides for extension-less .well-known files in the dev server.
// Vite falls back to application/octet-stream for unknown extensions; this plugin
// intercepts those paths before Vite's static-file middleware and sets correct types.
const WELL_KNOWN_TYPES = {
  '/.well-known/api-catalog': 'application/linkset+json',
  '/.well-known/oauth-protected-resource': 'application/json',
  '/.well-known/openid-configuration': 'application/json',
  '/.well-known/oauth-authorization-server': 'application/json',
};

// Merge one or more tokens into an existing Vary header value without
// duplicating anything already present. Kept in sync with the identical
// helper in server.mjs (that one runs standalone in production with no
// build step, so it can't import this file).
function mergeVary(existing, tokens) {
  const existingValue = Array.isArray(existing) ? existing.join(', ') : existing || '';
  const set = new Set(
    existingValue
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  );
  for (const token of tokens) set.add(token);
  return [...set].join(', ');
}

// Short markdown body for a 404 response — kept in sync with
// buildAgentNotFoundMarkdown in server.mjs.
function buildAgentNotFoundMarkdown(pathname) {
  return `# 404 — Page not found

\`${pathname}\` does not exist on this site.

## Where to look next

- [Sitemap](/sitemap.xml) — every URL on this site
- [llms.txt](/llms.txt) — curated page index for agents
- [Docs](/docs) — product documentation
- [Home](/) — start over from the homepage
`;
}

function wellKnownDevPlugin() {
  return {
    name: 'well-known-content-types',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        // Serve extension-less .well-known files with correct content-types
        const contentType = url && WELL_KNOWN_TYPES[url];
        if (contentType) {
          const filePath = join(process.cwd(), 'public', url);
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            createReadStream(filePath).pipe(res);
            return;
          }
        }

        // Markdown content negotiation — serve public/<path>/index.md when
        // the client sends Accept: text/markdown. In production server.mjs handles
        // this; this branch makes it work in the Vite dev server where raw request
        // headers are accessible but Astro middleware cannot read them.
        const accept = req.headers['accept'] || '';
        if (accept.includes('text/markdown') && url) {
          const mdPath = url.endsWith('/') ? url + 'index.md' : url + '.md';
          const filePath = join(process.cwd(), 'public', mdPath);
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            res.setHeader('Vary', mergeVary(res.getHeader('Vary'), ['Accept']));
            createReadStream(filePath).pipe(res);
            return;
          }

          // No static markdown export for this path here in dev (real content
          // pages export markdown via their own [...].md.ts route, prerendered
          // to dist/client/*.md only at build time — server.mjs serves that in
          // production). If Astro's own downstream routing is about to 404,
          // substitute a short agent-recoverable markdown body instead of
          // falling through to the HTML 404 page, mirroring server.mjs's
          // handleSSR so dev/test behavior matches production for genuinely
          // unknown paths. See is-agentic's "Agent-friendly 404s" check.
          const origWriteHead = res.writeHead.bind(res);
          const origWrite = res.write.bind(res);
          const origEnd = res.end.bind(res);
          let substitute404 = false;
          let body404 = null;

          res.writeHead = (statusCode, headers) => {
            if (statusCode === 404) {
              substitute404 = true;
              body404 = Buffer.from(buildAgentNotFoundMarkdown(url), 'utf-8');
              return origWriteHead(404, {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Content-Length': body404.length,
                Vary: mergeVary(null, ['Accept']),
              });
            }
            return origWriteHead(statusCode, headers);
          };
          res.write = (chunk, enc, cb) => {
            if (substitute404) {
              if (cb) cb();
              return true;
            }
            return origWrite(chunk, enc, cb);
          };
          res.end = (chunk, enc, cb) => {
            if (substitute404) return origEnd(body404);
            return origEnd(chunk, enc, cb);
          };
        }

        next();
      });
    },
  };
}

// Also check process.env for environment variables
const siteUrl = process.env.SITE_URL || import.meta.env.SITE_URL || 'https://www.datum.net';
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  trailingSlash: 'never',
  output: 'static',
  redirects: {
    '/brand/imagery': '/brand/graphics',
  },
  security: {
    checkOrigin: false,
  },
  adapter: node({
    mode: 'middleware',
  }),
  compressHTML: true,
  markdown: {
    processor: unified({
      gfm: true,
      smartypants: true,
      remarkPlugins: [remarkModifiedTime],
      // Astro runs Shiki before user `rehypePlugins` on MDX; that emits `astro-code` and prevents
      // expressive-code from taking over. Disable built-in highlighting so fenced blocks stay
      // `pre > code` until `rehype-expressive-code` runs (same stack as `renderMarkdownWithExpressiveCode`).
      rehypePlugins: [[rehypeExpressiveCode, expressiveCodeRehypeOptions]],
    }),
    syntaxHighlight: false,
  },
  image: {
    layout: 'constrained',
    domains: ['grateful-excitement-dfe9d47bad.media.strapiapp.com', 'images.lumacdn.com'],
  },
  integrations: [
    mdx(),
    announcement({
      show: true,
      label: 'Free download',
      text: 'Take your localhost global with our alpha http desktop app',
      href: '/download',
      icon: {
        name: 'arrow-right',
        size: 'sm',
      },
    }),
    alpinejs({ entrypoint: '/src/entrypoint' }),
    mermaid({
      theme: 'forest',
      autoTheme: true,
      enableLog: false,
    }),
    playformCompress({
      // CSS minification disabled: csso@5 (bundled by @playform/compress) drops
      // MQ Level 4 range syntax `@media (width >= 40rem)`, used by Tailwind v4's
      // responsive variants and by src/static/styles/variables-breakpoints.css.
      // Tailwind v4 already minifies CSS via lightningcss, so this is redundant.
      CSS: false,
      HTML: true,
      JavaScript: true,
      Image: true,
      SVG: true,
    }),
    compressor({
      gzip: true,
      brotli: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss(), wellKnownDevPlugin()],
    css: {
      devSourcemap: true,
    },
    ssr: {
      noExternal: ['zod'],
    },
    server: {
      allowedHosts: ['datumproxy.net', '.datumproxy.net'],
    },
  },
  experimental: {},
  prefetch: true,
});
