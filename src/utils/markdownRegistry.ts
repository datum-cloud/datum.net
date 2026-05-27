// Single source of truth for which URL paths have a markdown export.
//
// Used by:
//   1. src/utils/markdownExport.ts (resolver) — to decide whether the
//      "Read as Markdown" trigger renders in the footer.
//   2. src/pages/[...mdslug].md.ts (catch-all endpoint) — to generate its
//      getStaticPaths() and serve markdown for any covered path.
//
// Adding a new content collection or directory pattern only requires editing
// the COLLECTION_PATTERNS map below. The trigger and endpoint pick it up
// automatically — no manual list maintenance.

import { getCollection } from 'astro:content';

/** Maps a URL path to the collection + entry id that backs it. */
export interface MarkdownSource {
  collection: string;
  entryId: string;
}

/** URL paths that have a dedicated <path>.md.ts endpoint with custom logic
 * (Strapi listings, JSON-driven content, etc.). The catch-all defers to them
 * rather than overriding. */
const DEDICATED_ENDPOINTS = new Set<string>([
  '/blog',
  '/changelog',
  '/roadmap',
  '/events',
  '/handbook',
  '/brand',
  '/pricing',
  '/locations',
]);

/**
 * The `pages` collection has entries whose IDs come from either the `slug`
 * frontmatter field (when set) or the file path. As a result, the URL for an
 * entry isn't always `/${entry.id}` — these overrides spell out the
 * URLs that diverge from the default `/${id}` mapping.
 */
const PAGES_URL_OVERRIDES: Record<string, string> = {
  'alt-cloud-meetups': '/events/alt-cloud-meetups',
  'community-huddles': '/events/community-huddles',
  career: '/careers',
};

/** Entry IDs in the `pages` collection that should NOT produce a markdown
 * URL — hand-curated, dedicated, or not a real page. */
const PAGES_SKIP = new Set<string>([
  '/', // home (hand-curated as public/index.md)
  'contact', // hand-curated
  'download', // hand-curated
  'essentials', // hand-curated
  'features', // hand-curated
  'about', // hand-curated
  'blog', // dedicated (Strapi listing)
  'docs', // no /docs route
  'pricing', // dedicated (JSON tiers)
  'locations', // dedicated (JSON regions)
  'roadmap', // dedicated (Strapi)
  'brand', // dedicated (sections list)
  'events', // dedicated (events listing)
  'global-section', // component data, not a page
]);

/** Hand-curated public/*.md files — Astro serves these as static assets, so
 * they take precedence over any dynamic route. We still list them so the
 * trigger renders. */
const HAND_CURATED_PATHS = new Set<string>([
  '/',
  '/about',
  '/contact',
  '/download',
  '/essentials',
  '/features',
]);

/**
 * Maps a content collection to a function that returns URL paths derived from
 * its entries. Each function receives all entries in the collection and
 * returns [path, MarkdownSource] tuples.
 *
 * Add a new pattern here when a new content-collection-backed route appears.
 */
const COLLECTION_PATTERNS: Array<{
  collection: string;
  /** Build a URL path for an entry, or return null to skip it. */
  pathFor: (id: string) => string | null;
}> = [
  // /download/<slug>
  { collection: 'download', pathFor: (id) => `/download/${id}` },
  // /legal/<slug>
  { collection: 'legal', pathFor: (id) => `/legal/${id}` },
  // /handbook/<...id>
  {
    collection: 'handbooks',
    pathFor: (id) => (id === 'index' ? null : `/handbook/${id}`),
  },
  // Pages collection — IDs come from `slug` frontmatter when set, otherwise
  // the file path. We map known overrides explicitly and fall back to
  // either `/${id}` for nested paths (brand/color etc.) or skip.
  {
    collection: 'pages',
    pathFor: (id) => {
      if (PAGES_SKIP.has(id)) return null;
      if (id.startsWith('home/')) return null; // home sub-content fragments
      if (PAGES_URL_OVERRIDES[id]) return PAGES_URL_OVERRIDES[id];
      // brand/color, brand/iconography etc. render at /brand/<slug>
      if (id.startsWith('brand/')) return `/${id}`;
      // Top-level entries without overrides render at /<id> (e.g. /open-source).
      if (!id.includes('/')) return `/${id}`;
      return null;
    },
  },
];

let cache: Map<string, MarkdownSource> | null = null;

/**
 * Build (and cache) the full URL -> source registry by walking every
 * collection pattern. Cached for the lifetime of the module; safe because
 * content collections are immutable after Astro starts.
 */
export async function getMarkdownRegistry(): Promise<Map<string, MarkdownSource>> {
  if (cache) return cache;
  const registry = new Map<string, MarkdownSource>();

  for (const { collection, pathFor } of COLLECTION_PATTERNS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries = await getCollection(collection as any);
      for (const entry of entries) {
        const path = pathFor(entry.id);
        if (path) registry.set(path, { collection, entryId: entry.id });
      }
    } catch (err) {
      // Collection may not exist in this build — fail open.
      console.warn(`markdownRegistry: skipping collection "${collection}":`, err);
    }
  }

  cache = registry;
  return registry;
}

/**
 * Returns true if the path either has a dedicated endpoint, a hand-curated
 * public file, or an auto-derived entry in the registry. Used by the
 * resolver to decide whether to render the footer trigger.
 */
export async function hasMarkdownForPath(path: string): Promise<boolean> {
  if (HAND_CURATED_PATHS.has(path) || DEDICATED_ENDPOINTS.has(path)) return true;
  const reg = await getMarkdownRegistry();
  return reg.has(path);
}

export { DEDICATED_ENDPOINTS, HAND_CURATED_PATHS };
