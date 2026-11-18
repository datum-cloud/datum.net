// src/utils/markdownFigure.ts

/**
 * Transform markdown figure syntax to HTML figure elements.
 *
 * Supported syntax:
 * - `![caption](url)` - Figure with caption, centered by default
 * - `![caption|left](url)` - Figure with caption, left-aligned
 * - `![caption|center](url)` - Figure with caption, centered
 * - `![caption|right](url)` - Figure with caption, right-aligned
 * - `![|left](url)` - Figure without caption, left-aligned
 * - `![caption](url#right)` - Same as `|right`: a `#left`, `#right` or `#center` suffix on the URL
 *   (what the Strapi editor writes) sets the alignment. The suffix is dropped from the src, and an
 *   explicit `|align` wins over it.
 * - A caption that is only a file name (Strapi's default alt text, e.g. `photo.png`) is not shown.
 *
 * @param markdown - The markdown string to transform
 * @returns The markdown string with image syntax converted to figure HTML
 */
// `#left` / `#right` / `#center` at the end of an image URL.
const URL_ALIGN_HINT = /#(left|right|center)$/;
// A single token ending in an image extension: the alt text Strapi fills in from the file name.
const FILE_NAME = /^\S+\.(?:png|jpe?g|gif|webp|svg|avif)$/i;

export function transformMarkdownFigures(markdown: string): string {
  if (!markdown) return markdown;

  // Regex to match: ![caption|align](url) or ![caption](url) or ![|align](url)
  // Captures: 1=caption (may be empty), 2=alignment (optional), 3=url
  const figureRegex = /!\[([^\]|]*?)(?:\|(\w+))?\]\(([^)]+)\)/g;

  return markdown.replace(figureRegex, (_match, caption, align, rawUrl: string) => {
    const hint = rawUrl.match(URL_ALIGN_HINT);
    const url = hint ? rawUrl.slice(0, hint.index) : rawUrl;
    const alignment = align || hint?.[1] || 'center';
    const rawCaption = (caption || '').trim();
    const trimmedCaption = FILE_NAME.test(rawCaption) ? '' : rawCaption;

    // Build the figure HTML
    const imgTag = `<img src="${url}" alt="${trimmedCaption}" />`;
    const figcaptionHtml = trimmedCaption ? `<figcaption>${trimmedCaption}</figcaption>` : '';

    return `<figure class="figure--${alignment}">${imgTag}${figcaptionHtml}</figure>`;
  });
}

/**
 * Check if a markdown string contains figure syntax.
 *
 * @param markdown - The markdown string to check
 * @returns True if the markdown contains figure syntax
 */
export function containsFigureSyntax(markdown: string): boolean {
  if (!markdown) return false;
  return /!\[[^\]]*\]\([^)]+\)/.test(markdown);
}
