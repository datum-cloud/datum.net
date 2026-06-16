// Maps a request pathname to its raw markdown URL when a source exists.
//
// Used by FooterAiAgents.astro to decide whether the "Read as Markdown" trigger
// should render on the current page. Pages without a markdown source (purely
// component-rendered .astro pages) return null and the trigger is hidden.
//
// Routing layers:
//   1. Hand-curated public/*.md files (highest precedence — Astro serves them
//      as static assets directly).
//   2. Dedicated <path>.md.ts endpoints with custom logic (blog, changelog,
//      roadmap, events, handbook, brand, pricing, locations).
//   3. Auto-derived catch-all [...mdslug].md.ts driven by markdownRegistry.

import { ensureStrapiArticleDetail } from '@libs/strapi';
import { hasMarkdownForPath } from '@utils/markdownRegistry';
import { isNumericBlogSlug } from '@utils/blogPagination';

/** Normalises a pathname: strips trailing slashes (except for root). */
function normalisePath(pathname: string): string {
  if (pathname === '/' || pathname === '') return '/';
  return pathname.replace(/\/+$/, '');
}

/**
 * Resolves a request pathname to its raw markdown URL, or null when the page
 * has no markdown source. Async because it may consult the content-collection
 * registry.
 *
 * Examples:
 *   /                  -> /index.md          (hand-curated)
 *   /pricing           -> /pricing.md        (dedicated endpoint)
 *   /download/mac-os   -> /download/mac-os.md (auto-derived catch-all)
 *   /brand/principles  -> /brand/principles.md (auto-derived catch-all)
 *   /blog/some-post    -> /blog/some-post.md  (Strapi)
 *   /unknown-page      -> null
 */
export async function resolveMarkdownUrl(pathname: string): Promise<string | null> {
  const path = normalisePath(pathname);

  if (path === '/') return '/index.md';

  // Strapi-backed blog articles: /blog/<slug>. Numeric slugs may be pagination
  // unless a published article uses that slug — same rule as [slug].astro.
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    if (!slug) return null;
    if (isNumericBlogSlug(slug)) {
      const article = await ensureStrapiArticleDetail(slug);
      if (!article) return null;
    }
    return `${path}.md`;
  }

  // Static assets, dedicated endpoints, and auto-derived registry entries are
  // all checked uniformly by hasMarkdownForPath.
  if (await hasMarkdownForPath(path)) {
    return `${path}.md`;
  }
  return null;
}

/**
 * Normalises common Unicode punctuation to ASCII equivalents so markdown
 * served to the lightbox renders correctly regardless of how the viewer
 * decodes Content-Type charset. Em/en dashes -> hyphen, smart quotes/
 * apostrophes -> straight, arrows -> ASCII arrows, ellipsis -> three dots.
 *
 * Pass anything you produce by hand or pull from a CMS through this helper
 * before responding from a `.md.ts` endpoint.
 */
export function toAsciiMarkdown(input: string): string {
  return input
    .replace(/[—–]/g, '-') // em/en dash
    .replace(/[‘’‚′]/g, "'") // smart single quotes
    .replace(/[“”„″]/g, '"') // smart double quotes
    .replace(/…/g, '...') // ellipsis
    .replace(/→/g, '->') // right arrow
    .replace(/←/g, '<-') // left arrow
    .replace(/\u00a0/g, ' ') // non-breaking space
    .normalize('NFKD') // decompose Latin diacritics so combining marks isolate
    .replace(/\p{M}+/gu, ''); // drop combining marks (Sao Paolo -> Sao Paolo)
}
