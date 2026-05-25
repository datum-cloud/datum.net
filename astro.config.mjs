import { defineConfig } from 'astro/config';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
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
            createReadStream(filePath).pipe(res);
            return;
          }
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
  security: {
    checkOrigin: false,
  },
  adapter: node({
    mode: 'middleware',
  }),
  markdown: {
    remarkPlugins: [remarkModifiedTime],
    // Astro runs Shiki before user `rehypePlugins` on MDX; that emits `astro-code` and prevents
    // expressive-code from taking over. Disable built-in highlighting so fenced blocks stay
    // `pre > code` until `rehype-expressive-code` runs (same stack as `renderMarkdownWithExpressiveCode`).
    syntaxHighlight: false,
    rehypePlugins: [[rehypeExpressiveCode, expressiveCodeRehypeOptions]],
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
    }),
    playformCompress({
      // CSS minification disabled: csso@5 (bundled by @playform/compress) drops
      // MQ Level 4 range syntax `@media (width >= 40rem)`, used by Tailwind v4's
      // responsive variants and by src/v1/styles/variables-breakpoints.css.
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
  },
  experimental: {},
  prefetch: true,
});
