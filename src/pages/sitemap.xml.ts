import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SITE_URL = 'https://www.datum.net';
const MINTLIFY_TARGET = 'https://datum-4926dda5.mintlify.dev';
const STRAPI_URL =
  import.meta.env?.STRAPI_URL || 'https://grateful-excitement-dfe9d47bad.strapiapp.com';
const STRAPI_TOKEN = import.meta.env?.STRAPI_TOKEN || '';

// Known static routes (dedicated .astro files, not driven by content collections)
const STATIC_ROUTES = [
  '/',
  '/about/',
  '/authors/',
  '/blog/',
  '/brand/',
  '/careers/',
  '/changelog/',
  '/contact/',
  '/download/',
  '/essentials/',
  '/events/',
  '/events/alt-cloud-meetups/',
  '/events/community-huddles/',
  '/features/',
  '/handbook/',
  '/locations/',
  '/pricing/',
  '/roadmap/',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface SitemapEntry {
  url: string;
  lastmod?: string;
}

function toISODate(date: string | Date | undefined | null): string | undefined {
  if (!date) return undefined;
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

function xmlEscape(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildXml(entries: SitemapEntry[]): string {
  const urlElements = entries
    .map(({ url, lastmod }) => {
      const loc = `<loc>${xmlEscape(url)}</loc>`;
      const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
      return `<url>${loc}${mod}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlElements}</urlset>`;
}

// ---------------------------------------------------------------------------
// Strapi: fetch all published blog post slugs
// ---------------------------------------------------------------------------
async function fetchBlogEntries(): Promise<SitemapEntry[]> {
  const query = `
    query {
      articles(pagination: { limit: 500 }, sort: ["originalPublishedAt:desc"]) {
        slug
        originalPublishedAt
      }
    }
  `;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

    const res = await fetch(`${STRAPI_URL}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const json = (await res.json()) as {
      data?: { articles?: Array<{ slug: string; originalPublishedAt?: string }> };
    };

    return (json.data?.articles ?? [])
      .filter((a) => a.slug && isNaN(parseInt(a.slug, 10)))
      .map((a) => ({
        url: `${SITE_URL}/blog/${a.slug}/`,
        lastmod: toISODate(a.originalPublishedAt),
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Mintlify: fetch and rewrite docs sitemap
// ---------------------------------------------------------------------------
async function fetchDocEntries(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(`${MINTLIFY_TARGET}/docs/sitemap.xml`, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'datum.net-sitemap/1.0' },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)];

    return locs.map((m, i) => {
      // Mintlify uses https://datum.net (no www) — normalise to www.datum.net
      // and ensure trailing slash for consistency
      let url = m[1].trim().replace('https://datum.net/', `${SITE_URL}/`);
      if (!url.endsWith('/')) url += '/';
      return {
        url,
        lastmod: lastmods[i]?.[1]?.trim(),
      };
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Content collections: handbooks + legal pages
// ---------------------------------------------------------------------------
async function fetchContentCollectionEntries(): Promise<SitemapEntry[]> {
  const [handbooks, legalPages] = await Promise.all([
    getCollection('handbooks', ({ data }) => !data.draft),
    getCollection('legal'),
  ]);

  const handbookEntries: SitemapEntry[] = handbooks.map((h) => ({
    url: `${SITE_URL}/handbook/${h.id}/`,
    lastmod: toISODate(h.data.lastModified),
  }));

  const legalEntries: SitemapEntry[] = legalPages.map((l) => ({
    url: `${SITE_URL}/legal/${l.id
      .replace(/\.(mdx?|md)$/, '')
      .split('/')
      .pop()}/`,
  }));

  return [...handbookEntries, ...legalEntries];
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export const GET: APIRoute = async () => {
  const [blogEntries, docEntries, collectionEntries] = await Promise.all([
    fetchBlogEntries(),
    fetchDocEntries(),
    fetchContentCollectionEntries(),
  ]);

  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  // Merge and deduplicate by URL
  const seen = new Set<string>();
  const all: SitemapEntry[] = [];
  for (const entry of [...staticEntries, ...collectionEntries, ...blogEntries, ...docEntries]) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      all.push(entry);
    }
  }

  all.sort((a, b) => a.url.localeCompare(b.url));

  return new Response(buildXml(all), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
};
