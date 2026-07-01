// Helpers for rendering a content-collection entry's frontmatter + body as
// ASCII markdown for the "Read as Markdown" lightbox. Used by the various
// <page>.md.ts endpoints.

import type { APIRoute } from 'astro';
import { getEntry, type CollectionKey } from 'astro:content';
import { toAsciiMarkdown } from '@utils/markdownExport';

/**
 * Strip MDX-only syntax from a body string so the output is plain markdown:
 *   - `import` lines (top-level imports)
 *   - JSX/component tags
 *   - extra blank lines
 *
 * Body must already be the post-frontmatter content (Astro's `entry.body`).
 */
export function stripMdxToMarkdown(body: string): string {
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+.*$/gm, '')
    .replace(/<\w+[^>]*\/>/g, '') // self-closing JSX
    .replace(/<\/?[A-Z][^>]*>/g, '') // capitalised component tags
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Response headers marking a `.md` endpoint as a non-canonical alternate of
 * its HTML page: `X-Robots-Tag: noindex` keeps it out of the search index,
 * and the `Link` canonical header points crawlers back at the HTML version.
 * Without these, search engines index `.md` and HTML as duplicate content.
 */
export function markdownSeoHeaders(canonicalUrl: string): HeadersInit {
  return {
    'X-Robots-Tag': 'noindex',
    Link: `<${canonicalUrl}>; rel="canonical"`,
  };
}

interface RenderOptions {
  /** Optional override for the H1. Defaults to entry.data.title. */
  title?: string;
  /** Optional prose to insert between title and body. */
  intro?: string;
  /** Optional canonical URL appended in the trailing source line. */
  sourceUrl?: string;
  /** Optional extra sections appended after the entry body. */
  trailingSections?: string[];
  /**
   * Skip the entry body entirely. Useful for pages where the MDX is a
   * component composition (e.g. /brand) and the stripped output would be
   * unreadable. Use `trailingSections` to supply meaningful content instead.
   */
  skipBody?: boolean;
  /**
   * Shift every body heading down by one level (# -> ##, ## -> ###, etc.).
   * Use when the body has its own H1 that would otherwise compete with the
   * frontmatter title.
   */
  demoteHeadings?: boolean;
}

/** Shift markdown headings (# / ## / ###...) down by one level. */
function demoteBodyHeadings(body: string): string {
  return body.replace(/^(#{1,5}) /gm, '$1# ');
}

/**
 * Build an ASCII markdown document from a content-collection entry. Pulls:
 *   - `title` -> # H1
 *   - `subtitle` and `description` -> lead paragraphs
 *   - entry body (stripped of MDX syntax)
 *   - meta.description if neither subtitle nor description provided context
 *
 * Returns plain text suitable for direct Response body.
 */
export function renderEntryMarkdown(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry: { data: any; body?: string },
  opts: RenderOptions = {}
): string {
  const data = entry.data ?? {};
  const sections: string[] = [];

  const title = opts.title ?? data.title ?? '';
  if (title) sections.push(`# ${title}`, '');

  if (data.subtitle && data.subtitle !== title) {
    sections.push(`_${data.subtitle}_`, '');
  }
  if (data.description) {
    sections.push(data.description, '');
  } else if (data.meta?.description) {
    sections.push(data.meta.description, '');
  }

  if (opts.intro) {
    sections.push(opts.intro, '');
  }

  if (!opts.skipBody) {
    let body = stripMdxToMarkdown(entry.body ?? '');
    if (opts.demoteHeadings) body = demoteBodyHeadings(body);
    if (body) sections.push(body, '');
  }

  if (opts.trailingSections) {
    for (const s of opts.trailingSections) {
      sections.push(s, '');
    }
  }

  if (opts.sourceUrl) {
    sections.push('---', '', `Source: <${opts.sourceUrl}>`, '');
  }

  return toAsciiMarkdown(sections.join('\n'));
}

/**
 * Convenience factory for a basic GET handler that reads one entry from a
 * collection and returns it as ASCII markdown. For most static-content pages
 * the body alone is enough; for listing or composed pages use a custom
 * endpoint that calls `renderEntryMarkdown` directly with `trailingSections`.
 */
export function makeEntryMarkdownRoute(
  collection: CollectionKey,
  entryId: string,
  opts: RenderOptions = {}
): APIRoute {
  return async () => {
    try {
      const entry = await getEntry(collection, entryId);
      if (!entry) return new Response('Not found', { status: 404 });
      const body = renderEntryMarkdown(entry, opts);
      return new Response(body, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          ...(opts.sourceUrl ? markdownSeoHeaders(opts.sourceUrl) : {}),
        },
      });
    } catch (error) {
      console.error(`Failed to serve markdown for ${String(collection)}/${entryId}:`, error);
      return new Response('Error generating markdown', { status: 500 });
    }
  };
}
