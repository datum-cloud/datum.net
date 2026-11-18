// src/utils/articleHeadings.ts
// Adds ids to the h2 headings of rendered article HTML and lists them for an "On this page" nav.

export interface ArticleHeading {
  id: string;
  text: string;
}

const H2 = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi;

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Returns the HTML with an id on every h2 that lacks one, plus the h2 list in document order.
 * `taken` carries ids already used by earlier blocks so ids stay unique across an article.
 */
export function addHeadingIds(
  html: string,
  taken: readonly string[] = []
): { html: string; headings: ArticleHeading[] } {
  const used = new Set(taken);
  const headings: ArticleHeading[] = [];

  const out = html.replace(H2, (match, attrs: string | undefined, inner: string) => {
    const text = stripTags(inner);
    if (!text) return match;

    const existing = attrs?.match(/\sid="([^"]+)"/)?.[1];
    let id = existing ?? (slugify(text) || 'section');
    if (!existing) {
      const base = id;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    }
    used.add(id);
    headings.push({ id, text });

    return existing ? match : `<h2 id="${id}"${attrs ?? ''}>${inner}</h2>`;
  });

  return { html: out, headings };
}
