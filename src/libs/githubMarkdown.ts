// src/libs/githubMarkdown.ts
/**
 * Render GitHub-flavoured issue markdown to sanitized HTML.
 *
 * Issue bodies are written by third parties, so the pipeline never trusts them:
 *  - raw HTML in the markdown is dropped (no `rehype-raw`),
 *  - the result goes through `rehype-sanitize` (GitHub-like allowlist: no
 *    scripts, no event handlers, no `javascript:` URLs),
 *  - links are then forced to open in a new tab with `noopener noreferrer`.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { Element, Root, RootContent } from 'hast';

/** Minimal hast walker — avoids pulling in `unist-util-visit` as a direct dependency. */
function walk(node: Root | RootContent, visit: (el: Element) => void): void {
  if (node.type === 'element') visit(node);
  if ('children' in node) {
    for (const child of node.children as RootContent[]) walk(child, visit);
  }
}

/** Open links in a new tab, lazy-load images. Runs after sanitizing. */
function rehypeExternalLinks() {
  return (tree: Root) => {
    walk(tree, (el) => {
      if (el.tagName === 'a') {
        el.properties = {
          ...el.properties,
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        };
      } else if (el.tagName === 'img') {
        el.properties = { ...el.properties, loading: 'lazy', decoding: 'async' };
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeExternalLinks)
  .use(rehypeStringify);

/** Render an issue body to sanitized HTML. Returns '' for an empty body. */
export async function renderIssueMarkdown(markdown: string): Promise<string> {
  if (!markdown.trim()) return '';
  const file = await processor.process(markdown);
  return String(file);
}
