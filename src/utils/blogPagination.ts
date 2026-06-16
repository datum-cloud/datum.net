// src/utils/blogPagination.ts
/** Canonical blog listing index. */
export const BLOG_LISTING_BASE = '/blog';

/**
 * URL for a paginated blog listing page.
 * Page 1 is `/blog`; page 2+ is `/blog/<n>`.
 */
export function getBlogListingPagePath(page: number): string {
  if (page <= 1) return BLOG_LISTING_BASE;
  return `${BLOG_LISTING_BASE}/${page}`;
}

/** True when the slug is purely numeric (may be a pagination URL). */
export function isNumericBlogSlug(slug: string): boolean {
  const parsed = parseInt(slug, 10);
  return !Number.isNaN(parsed) && String(parsed) === slug;
}

/**
 * When a numeric slug has no matching article, treat it as a listing page (≥ 2).
 * Returns null for non-numeric slugs or page 1 (handled separately).
 */
export function getBlogListingPageFromNumericSlug(slug: string): number | null {
  if (!isNumericBlogSlug(slug)) return null;
  const page = parseInt(slug, 10);
  if (page < 2) return null;
  return page;
}
