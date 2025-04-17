// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';

import { loadEnv } from 'vite';
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const port = parseInt(env.PORT || '4321');

export default defineConfig({
  site: env.SITE_URL || `http://localhost:${port}`,
  integrations: [
    starlight({
      title: env.STARLIGHT_TITLE || 'Datum',
      description: env.STARLIGHT_DESCRIPTION || 'Datum Handbook',
      disable404Route: true,
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: env.SITE_GITHUB || 'http://github.com/datum-cloud/datum.net',
        },
      ],
      components: {
        Sidebar: '@components/starlight/sidebar.astro',
      },
      sidebar: [
        {
          label: 'Handbook',
          autogenerate: { directory: 'handbook' },
        },
      ],
    }),
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
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    svg: true,
  },
});
