import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import mermaid from 'astro-mermaid';

import { loadEnv } from 'vite';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';

import sitemap from './src/plugins/sitemap.js';
import announcement from './src/plugins/announcement.ts';
import { remarkModifiedTime } from './src/plugins/remarkModifiedTime.mjs';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Also check process.env for environment variables
const siteUrl = process.env.SITE_URL || import.meta.env.SITE_URL || 'https://www.datum.net';
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  trailingSlash: 'always',
  output: 'static',
  security: {
    checkOrigin: false,
  },
  adapter: node({
    mode: 'middleware',
  }),
  markdown: {
    remarkPlugins: [remarkModifiedTime],
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
      href: '/download/',
      icon: {
        name: 'arrow-right',
        size: 'sm',
      },
    }),
    robotsTxt({
      sitemap: 'https://www.datum.net/sitemap.xml',
      policy: [
        // Explicit allow for major AI crawlers (no crawl delay)
        { userAgent: 'GPTBot', allow: '/' },
        { userAgent: 'OAI-SearchBot', allow: '/' },
        { userAgent: 'ChatGPT-User', allow: '/' },
        { userAgent: 'ClaudeBot', allow: '/' },
        { userAgent: 'anthropic-ai', allow: '/' },
        { userAgent: 'PerplexityBot', allow: '/' },
        { userAgent: 'Amazonbot', allow: '/' },
        { userAgent: 'Google-Extended', allow: '/' },
        { userAgent: 'Bytespider', allow: '/' },
        // Default policy for all other bots
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api'],
        },
      ],
    }),
    alpinejs({ entrypoint: '/src/entrypoint' }),
    mermaid({
      theme: 'forest',
      autoTheme: true,
    }),
    sitemap({
      exclude: [
        '404',
        'auth/callback',
        'auth/login',
        'auth/logout',
        'api/info',
        'shop',
        'waitlist',
        'dev/build',
        'dev/info',
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
