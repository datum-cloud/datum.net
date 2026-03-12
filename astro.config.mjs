import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mermaid from 'astro-mermaid';

import { loadEnv } from 'vite';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';

// import glossary from './src/plugins/glossary.js';
import syncDocs from './src/plugins/sync-docs.ts';
import sitemap from './src/plugins/sitemap.js';
import announcement from './src/plugins/announcement.ts';
import { remarkModifiedTime } from './src/plugins/remarkModifiedTime.mjs';

// Mintlify
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { mintlify } from '@mintlify/astro';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const isProd = process.env.MODE === 'production';

// Also check process.env for environment variables
const siteUrl = process.env.SITE_URL || import.meta.env.SITE_URL || 'https://www.datum.net';
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  trailingSlash: 'always',
  output: 'static',
  adapter: node({
    mode: 'middleware',
  }),
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
  image: {
    layout: 'constrained',
  },
  integrations: [
    announcement({
      show: true,
      label: "We're hiring!",
      text: "We're actively building our team, join us",
      href: '/careers/',
      icon: {
        name: 'arrow-right',
        size: 'sm',
      },
    }),
    robotsTxt({
      sitemap: false,
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api'],
          crawlDelay: 10,
        },
      ],
    }),
    alpinejs({ entrypoint: '/src/entrypoint' }),
    mermaid({
      theme: 'forest',
      autoTheme: true,
    }),
    ...(isProd ? [syncDocs()] : []),
    mintlify({ docsDir: './docs' }),
    react(),
    mdx(),
    // glossary({
    //   source: 'docs/docs/glossary.mdx',
    //   contentDir: 'docs',
    // }),
    sitemap({
      exclude: [
        '404',
        'auth/callback',
        'auth/login',
        'api/info',
        'waitlist',
        'authors/jacob-smith/1',
        'authors/zac-smith/1',
      ],
    }),
    ...(isProd
      ? [
          playformCompress({
            CSS: true,
            HTML: true,
            JavaScript: true,
            Image: true,
            SVG: true,
          }),
          compressor({
            gzip: true,
            brotli: true,
          }),
        ]
      : []),
  ],
  vite: {
    plugins: [tailwindcss()],
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
