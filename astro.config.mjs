// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel';
import starlight from '@astrojs/starlight';

import { loadEnv } from 'vite';
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const port = parseInt(env.PORT || '4321');

export default defineConfig({
  site: env.SITE_URL || `http://localhost:${port}`,
  integrations: [
    starlight({
      title: env.STARLIGHT_TITLE || 'Datum Docs',
      description:
        env.STARLIGHT_DESCRIPTION || 'Documentation for Datum - Your Data Management Solution',
      social: {
        github: env.SITE_GITHUB || 'http://github.com/datum-cloud/datum.net',
      },
      components: {
        Sidebar: '@components/starlightSidebar.astro',
      },
      sidebar: [
        {
          label: 'Docs',
          autogenerate: { directory: 'docs' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
      ],
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
        },
      ],
    }),
    svelte(),
  ],
  adapter: vercel(),
});
