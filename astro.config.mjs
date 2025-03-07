// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'

import svelte from '@astrojs/svelte';

export default defineConfig({
  site: 'https://datum.net',
  integrations: [mdx(), tailwind(), sitemap(), robotsTxt({
    sitemap: true,
    policy: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
        crawlDelay: 10,
      }
    ]
  }), svelte()],
  content: {
    collections: [
      {
        name: 'pages',
        directory: './src/content/pages'
      },
      {
        name: 'blog',
        directory: './src/content/blog'
      },
      {
        name: 'changelog',
        directory: './src/content/changelog'
      }
    ]
  }
});