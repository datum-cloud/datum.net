// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'

export default defineConfig({
  site: 'https://datum.net',
  integrations: [
    mdx(),
    tailwind(),
    sitemap(),
    robotsTxt({
      sitemap: true,
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api'],
          crawlDelay: 10,
        }
      ]
    }),
  ],
  content: {
    collections: [
      {
        name: 'pages',
        directory: './src/content/pages'
      },
      {
        name: 'changelog',
        directory: './src/content/changelog'
      }
    ]
  }
});