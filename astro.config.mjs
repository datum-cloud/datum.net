// @ts-check
import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import { loadEnv } from 'vite';
import starlight from '@astrojs/starlight';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';

import glossary from './src/libs/glossary.js';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Also check process.env for environment variables
// const siteUrl = process.env.SITE_URL || env.SITE_URL;
const siteUrl = 'https://www.datum.net';
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  trailingSlash: 'always',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  image: {
    layout: 'constrained',
  },
  integrations: [
    robotsTxt({
      sitemap: true,
      sitemapBaseFileName: 'sitemap',
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
      credits: false,
      editLink: {
        baseUrl: 'https://github.com/datum-cloud/datum.net/edit/main/',
      },
      logo: {
        light: '/public/download/logo-datum-light.svg',
        dark: '/public/download/logo-datum-dark.svg',
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
        PageSidebar: '@components/starlight/PageSidebar.astro',
        TwoColumnContent: '@components/starlight/TwoColumnContent.astro',
        SiteTitle: '@components/starlight/SiteTitle.astro',
        Header: '@components/starlight/Header.astro',
        Footer: '@components/starlight/Footer.astro',
        MobileMenuToggle: '@components/starlight/MobileMenuToggle.astro',
        Sidebar: '@components/starlight/Sidebar.astro',
        Search: '@components/starlight/Search.astro',
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
        {
          tag: 'script',
          content: `document.documentElement.setAttribute('data-smooth-scroll', 'false');`,
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
          label: 'Datum Documentation',
          link: '/docs/',
        },
        {
          label: 'Overview',
          autogenerate: { directory: 'docs/overview' },
        },
        {
          label: 'Quick Start',
          autogenerate: { directory: 'docs/quickstart' },
        },
        {
          label: 'Platform',
          autogenerate: { directory: 'docs/platform' },
        },
        {
          label: 'API',
          autogenerate: { directory: 'docs/api' },
        },
        {
          label: 'Runtime',
          autogenerate: { directory: 'docs/runtime' },
        },
        {
          label: 'Workflows',
          autogenerate: { directory: 'docs/workflows' },
        },
        {
          label: 'Assets',
          autogenerate: { directory: 'docs/assets' },
        },
        {
          label: 'For Alt Clouds',
          autogenerate: { directory: 'docs/alt-cloud' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'docs/guides' },
        },
        {
          label: 'Glossary',
          link: 'docs/glossary/',
        },
      ],
    }),
    glossary({
      source: 'docs/docs/glossary.mdx',
      contentDir: 'docs',
    }),
    playformCompress({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
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
