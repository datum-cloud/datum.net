// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import { loadEnv } from 'vite';
import starlight from '@astrojs/starlight';
import node from '@astrojs/node';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Also check process.env for environment variables
const siteUrl = process.env.SITE_URL || env.SITE_URL;
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
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
    alpinejs({ entrypoint: '/src/entrypoint' }),
    starlight({
      title: 'Datum',
      disable404Route: true,
      logo: {
        src: '/public/favicon.png',
      },
      customCss: ['./src/styles/global.css'], // https://github.com/withastro/starlight/blob/main/packages/starlight/style/props.css
      description:
        env.STARLIGHT_DESCRIPTION || 'Documentation for Datum - Your Data Management Solution',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: env.SITE_GITHUB || 'http://github.com/datum-cloud/datum.net',
        },
      ],
      components: {
        PageFrame: '@components/starlight/PageFrame.astro',
        Header: '@components/starlight/Header.astro',
      },
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          borderRadius: '0.5rem',
        },
      },
      sidebar: [
        {
          label: 'Docs',
          items: [
            {
              label: 'Get Started',
              autogenerate: { directory: 'docs/get-started' },
            },
            {
              label: 'Tasks',
              autogenerate: { directory: 'docs/tasks' },
            },
            {
              label: 'Tutorials',
              autogenerate: { directory: 'docs/tutorials' },
            },
          ],
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
      ],
    }),
    mdx(),
  ],

  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['website.staging.env.datum.net'],
    },
    server: {
      allowedHosts: ['website.staging.env.datum.net'],
    },
  },

  experimental: {},
  prefetch: true,
});
