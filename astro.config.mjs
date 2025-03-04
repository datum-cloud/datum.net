// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    mdx(),
    tailwind(),
  ],
  // Enable content collections for MDX files
  content: {
    collections: [
      {
        name: 'home',
        directory: './src/content/home'
      },
      {
        name: 'about',
        directory: './src/content/about'
      }
    ]
  }
});