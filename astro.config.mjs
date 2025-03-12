// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import starlight from '@astrojs/starlight'

export default defineConfig({
  site: import.meta.env.SITE_URL || 'https://datum.net',
  integrations: [
    starlight({
      title: 'Datum',
      description: 'Documentation for Datum - Your Data Management Solution',
      social: {
        github: 'http://github.com/datum-cloud/datum.net'
      },
      components: {
        Sidebar: '@components/starlightSidebar.astro',
      },
      sidebar:
      [{
        label: 'Docs',
        autogenerate: { directory: 'docs' }
      },
      {
        label: 'Guides',
        autogenerate: { directory: 'guides' }
      }],
    }),
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
    svelte()
  ],
  adapter: vercel()
});