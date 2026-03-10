// src/utils/etagUtils.ts
/**
 * Generate a weak ETag from content metadata for conditional requests (304).
 * Uses slug + updatedAt when available; falls back to documentId + originalPublishedAt.
 */

import { createHash } from 'node:crypto';

/**
 * Generates an ETag string from article metadata.
 * @param slug - Article slug
 * @param updatedAt - Last update timestamp (preferred)
 * @param documentId - Fallback identifier
 * @param originalPublishedAt - Fallback timestamp
 * @returns ETag in format "hash" (quoted)
 */
export function generateArticleEtag(
  slug: string,
  updatedAt?: string | null,
  documentId?: string,
  originalPublishedAt?: string | null
): string {
  const payload = updatedAt
    ? `${slug}:${updatedAt}`
    : `${documentId ?? slug}:${originalPublishedAt ?? ''}`;
  const hash = createHash('md5').update(payload).digest('hex');
  return `"${hash}"`;
}
