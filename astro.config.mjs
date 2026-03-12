import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import { createInlineSvgUrl } from '@expressive-code/core';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mermaid from 'astro-mermaid';

import { loadEnv } from 'vite';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';

// import glossary from './src/plugins/glossary.js';
import copyMarkdown from './src/plugins/copy-markdown/index.ts';

import sitemap from './src/plugins/sitemap.js';
import announcement from './src/plugins/announcement.ts';
import { remarkModifiedTime } from './src/plugins/remarkModifiedTime.mjs';
import mdx from '@astrojs/mdx';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const lucideCopyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

const expressiveCodeConfig = {
  themes: ['github-light', 'github-dark'],
  styleOverrides: {
    borderRadius: '0.5rem',
    frames: {
      copyIcon: createInlineSvgUrl(lucideCopyIconSvg),
    },
  },
};

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
    // glossary({
    //   source: 'docs/docs/glossary.mdx',
    //   contentDir: 'docs',
    // }),
    mdx(),
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
