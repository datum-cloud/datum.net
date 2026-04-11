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
 *
 * @param markdown - The markdown string to transform
 * @returns The markdown string with image syntax converted to figure HTML
 */
export function transformMarkdownFigures(markdown: string): string {
  if (!markdown) return markdown;

  // Regex to match: ![caption|align](url) or ![caption](url) or ![|align](url)
  // Captures: 1=caption (may be empty), 2=alignment (optional), 3=url
  const figureRegex = /!\[([^\]|]*?)(?:\|(\w+))?\]\(([^)]+)\)/g;

  return markdown.replace(figureRegex, (_match, caption, align, url) => {
    const alignment = align || 'center';
    const trimmedCaption = (caption || '').trim();

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
