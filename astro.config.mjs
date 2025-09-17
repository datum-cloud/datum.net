// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import { loadEnv } from 'vite';
import starlight from '@astrojs/starlight';
import node from '@astrojs/node';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Also check process.env for environment variables
// const siteUrl = process.env.SITE_URL || env.SITE_URL;
const siteUrl = 'https://www.datum.net';
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
      editLink: {
        baseUrl: 'https://github.com/datum-cloud/datum.net/edit/main/',
      },
      logo: {
        light: '/public/datum-light.svg',
        dark: '/public/datum-dark.svg',
        replacesTitle: true,
      },
      customCss: ['./src/v1/styles/starlight.css'], // https://github.com/withastro/starlight/blob/main/packages/starlight/style/props.css
      description:
        env.STARLIGHT_DESCRIPTION || 'Documentation for Datum - Your Data Management Solution',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: env.GITHUB_PROJECT_URL || 'http://github.com/datum-cloud/datum.net',
        },
      ],
      components: {
        PageFrame: '@components/starlight/PageFrame.astro',
        Header: '@components/starlight/Header.astro',
      },
      head: [
        {
          tag: 'script',
          attrs: { src: '/scripts/markerio.js', defer: true },
        },
        {
          tag: 'script',
          attrs: {
            src: 'https://cdn.usefathom.com/script.js',
            defer: true,
            'data-site': 'PXKRQKIZ',
          },
        },
      ],
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
        styleOverrides: {
          borderRadius: '0.5rem',
        },
      },

      sidebar: [
        {
          label: 'Overview',
          link: '/docs/',
        },
        {
          label: 'Getting Started',
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
        {
          label: 'Datum Cloud API',
          autogenerate: { directory: 'docs/api' },
        },
        {
          label: 'Contribution Guidelines',
          link: 'docs/contribution-guidelines/',
        },
        {
          label: 'Datum Cloud Glossary',
          link: 'docs/glossary/',
        },
        {
          label: 'Guides and Demos',
          link: 'docs/guides/',
        },
        {
          label: 'Developer Guide',
          link: 'docs/developer-guide/',
        },
        {
          label: 'Galactic VPC',
          autogenerate: { directory: 'docs/galactic-vpc' },
        },
      ],
    }),
  ],

  vite: {
    // @ts-expect-error - Tailwind Vite plugin type mismatch with Vite's expected plugin types
    plugins: [tailwindcss()],
    css: {
      devSourcemap: true,
    },
  },

  experimental: {},
  prefetch: true,

  redirects: {
    '/docs/roadmap': '/resources/roadmap/',
    '/product': '/features/',
    '/team': '/about/',
    '/docs/tutorials/gateway': '/docs/tutorials/httpproxy/',
    '/docs/tasks/developer-guide': '/docs/developer-guide/',
    '/product/overview/overview': '/features/',
    '/netzero/overview/overview': '/',
    '/api-reference/invite/deletes-a-invite-by-id': '/docs/api/reference/',
  },
});
