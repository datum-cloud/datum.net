// src/utils/faqText.ts
// Reduces an FAQ MDX body to text. Entries may use components for richer
// treatments — see src/content/faq/pricing-straightforward.mdx — so the
// markdown export and the FAQPage structured data both need the same
// reduction rather than each rolling its own regex.

/**
 * Strips MDX imports and component tags, preserving list items as markdown bullets.
 * @param body - Raw MDX body from a `faq` collection entry
 * @returns Markdown-safe plain text
 */
export const faqToMarkdown = (body: string): string =>
  body
    .replace(/^import\s+.*$/gm, '')
    .replace(
      /<li\b[^>]*>([\s\S]*?)<\/li>/g,
      (_match, inner: string) =>
        `\n- ${inner
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()}`
    )
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Collapses an FAQ body to a single line, for schema.org `acceptedAnswer` text.
 * @param body - Raw MDX body from a `faq` collection entry
 * @returns One-line plain text with markdown emphasis and bullets removed
 */
export const faqToPlainText = (body: string): string =>
  faqToMarkdown(body).replace(/\*\*/g, '').replace(/^- /gm, '').replace(/\s+/g, ' ').trim();
