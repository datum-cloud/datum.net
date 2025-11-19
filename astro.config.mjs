// @ts-check
import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import { loadEnv } from 'vite';
import starlight from '@astrojs/starlight';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';

import glossary from './src/libs/integration/glossary.ts';
import sitemap from './src/libs/integration/sitemap.ts';
import announcement from './src/libs/integration/announcement.ts';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Also check process.env for environment variables
const siteUrl = process.env.SITE_URL || import.meta.env.SITE_URL || 'https://www.datum.net';
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
    announcement({
      show: true,
      label: "We've Launched!",
      text: 'Introducing our company, $13.6M in funding, and core features',
      href: 'https://www.datum.net/blog/internet-superpowers-for-every-builder/',
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
        Head: '@components/starlight/Head.astro',
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
          label: 'Overview',
          autogenerate: { directory: 'docs/overview' },
          collapsed: true, // First group is expanded by default
        },
        {
          label: 'Quickstart',
          autogenerate: { directory: 'docs/quickstart' },
          collapsed: true, // All other groups are collapsed by default
        },
        {
          label: 'Our Infrastructure',
          autogenerate: { directory: 'docs/infrastructure' },
          collapsed: true,
        },
        {
          label: 'Platform',
          autogenerate: { directory: 'docs/platform' },
          collapsed: true,
        },
        {
          label: 'Runtime',
          autogenerate: { directory: 'docs/runtime' },
          collapsed: true,
        },
        {
          label: 'Connections',
          autogenerate: { directory: 'docs/connections' },
          collapsed: true,
        },
        {
          label: 'Workflows',
          autogenerate: { directory: 'docs/workflows' },
          collapsed: true,
        },
        {
          label: 'Assets',
          autogenerate: { directory: 'docs/assets' },
          collapsed: true,
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
    sitemap({
      exclude: [
        '404',
        'auth/callback',
        'auth/login',
        'api/info',
        'waitlist',
        'request-access',
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
  ],

  vite: {
    // @ts-expect-error - Tailwind Vite plugin type mismatch with Vite's expected plugin types
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
