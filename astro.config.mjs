import { defineConfig } from 'astro/config';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mermaid from 'astro-mermaid';

import { loadEnv } from 'vite';
import starlight from '@astrojs/starlight';
import node from '@astrojs/node';

import playformCompress from '@playform/compress';
import compressor from 'astro-compressor';

import glossary from './src/plugins/glossary.js';
import sitemap from './src/plugins/sitemap.js';
import announcement from './src/plugins/announcement.ts';
import { remarkModifiedTime } from './src/plugins/remarkModifiedTime.mjs';
import copyMarkdown from './src/plugins/copy-markdown/index.ts';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Also check process.env for environment variables
const siteUrl = process.env.SITE_URL || import.meta.env.SITE_URL || 'https://www.datum.net';
const port = parseInt(process.env.PORT || env.PORT || '4321');

export default defineConfig({
  site: siteUrl || `http://localhost:${port}`,
  trailingSlash: 'always',
  output: 'static',
  adapter: node({
    mode: 'middleware',
  }),
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
  image: {
    layout: 'constrained',
  },
  integrations: [
    announcement({
      show: true,
      label: "We're hiring!",
      text: "We're actively building our team, join us",
      href: '/careers/',
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
    mermaid({
      theme: 'forest',
      autoTheme: true,
    }),
    starlight({
      plugins: [
        copyMarkdown({
          includeFrontmatter: false,
          showToast: true,
          copyText: 'Copy for LLM',
          copiedText: 'Copied!',
          showViewMarkdown: true,
          githubRawBaseUrl:
            'https://raw.githubusercontent.com/datum-cloud/datum.net/refs/heads/main',
          contentPath: 'src/content/docs',
        }),
      ],
      title: 'Datum',
      disable404Route: true,
      credits: false,
      lastUpdated: true,
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
        PageTitle: '@components/starlight/PageTitle.astro',
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
          autogenerate: { directory: 'docs/overview' },
          collapsed: true, // First group is expanded by default
        },
        {
          label: 'Quickstart',
          autogenerate: { directory: 'docs/quickstart' },
          collapsed: true, // All other groups are collapsed by default
        },
        {
          label: 'API',
          autogenerate: { directory: 'docs/api' },
          collapsed: true,
        },
        {
          label: 'Command line',
          autogenerate: { directory: 'docs/datumctl' },
          collapsed: true, // First group is expanded by default
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
          items: [
            { label: 'Runtime Overview', link: 'docs/runtime/' },
            { label: 'Datum DNS', autogenerate: { directory: 'docs/runtime/dns' } },
            { label: 'Datum Proxy', link: 'docs/runtime/proxy/' },
            { label: 'AI Gateway', link: 'docs/runtime/ai-gateway/' },
          ],
          collapsed: true,
        },
        {
          label: 'Connections',
          autogenerate: { directory: 'docs/connections' },
          collapsed: true,
        },
        {
          label: 'Assets',
          autogenerate: { directory: 'docs/assets' },
          collapsed: true,
        },
        {
          label: 'Metrics',
          autogenerate: { directory: 'docs/metrics' },
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
