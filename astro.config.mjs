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
          label: 'About Datum',
          autogenerate: { directory: 'docs/about' },
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'docs/get-started' },
        },
        {
          label: 'Resources',
          autogenerate: { directory: 'docs/resources' },
        },
        {
          label: 'Datum Cloud API',
          autogenerate: { directory: 'docs/api' },
        },
      ],
    }),
  ],

  vite: {
    // @ts-expect-error - Tailwind Vite plugin type mismatch with Vite's expected plugin types
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['website.staging.env.datum.net'],
    },
    server: {
      allowedHosts: ['website.staging.env.datum.net'],
    },
    css: {
      devSourcemap: true,
    },
  },

  experimental: {},
  prefetch: true,
});
