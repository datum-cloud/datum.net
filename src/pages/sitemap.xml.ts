/**
 * Sitemap generation script
 */

import { type APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const port = parseInt(import.meta.env.PORT || '4321');
const siteUrl = import.meta.env.SITE || `http://localhost:${port}`;

async function blogsEntries() {
  try {
    const pages = await getCollection('blog');

    const entries = pages.map((page) => {
      if (!page.id || page.id === '/') return '';

      const url = `${siteUrl}/blog/${page.id}/`;
      const lastMod = page.data.updatedDate || null;

      return (
        `<url><loc>${url}</loc>` +
        (lastMod ? `<lastmod>${new Date(lastMod).toISOString()}</lastmod>` : '') +
        `</url>`
      );
    });

    return entries.join('');
  } catch {
    return '';
  }
}

async function docsEntries() {
  try {
    const pages = await getCollection('docs');

    const entries = pages.map((page) => {
      if (!page.id || page.id === '/') return '';

      const url = `${siteUrl}/${page.id}/`;
      const lastMod = page.data.updatedDate || null;

      return (
        `<url><loc>${url}</loc>` +
        (lastMod ? `<lastmod>${new Date(lastMod).toISOString()}</lastmod>` : '') +
        `</url>`
      );
    });

    return entries.join('');
  } catch {
    return '';
  }
}

async function handbookEntries() {
  try {
    const pages = await getCollection('handbooks', ({ id }) => id !== 'index');

    const entries = pages.map((page) => {
      if (!page.id || page.id === '/') return '';

      const url = `${siteUrl}/handbook/${page.id}/`;
      const lastMod = page.data.updatedDate || null;

      return (
        `<url><loc>${url}</loc>` +
        (lastMod ? `<lastmod>${new Date(lastMod).toISOString()}</lastmod>` : '') +
        `</url>`
      );
    });

    return entries.join('');
  } catch {
    return '';
  }
}

async function staticEntries() {
  const entries =
    `<url><loc>https://www.datum.net/about/</loc></url>` +
    `<url><loc>https://www.datum.net/features/</loc></url>` +
    `<url><loc>https://www.datum.net/community-huddle/</loc></url>` +
    `<url><loc>https://www.datum.net/legal/privacy/</loc></url>` +
    `<url><loc>https://www.datum.net/legal/term/</loc></url>` +
    `<url><loc>https://www.datum.net/public-slack/</loc></url>` +
    `<url><loc>https://www.datum.net/resources/changelog/</loc></url>` +
    `<url><loc>https://www.datum.net/resources/open-source/</loc></url>` +
    `<url><loc>https://www.datum.net/resources/roadmap/</loc></url>`;

  return entries;
}

export const GET: APIRoute = async () => {
  let entries = '';

  try {
    // Generate sitemap entries
    entries = await docsEntries();
    entries += await blogsEntries();
    entries += await handbookEntries();
    entries += await staticEntries();

    if (!entries) {
      return new Response('No entries found', { status: 404 });
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${entries}
      </urlset>`;

    return new Response(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
