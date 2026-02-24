// src/plugins/copy-markdown/types.d.ts

export interface CopyMarkdownConfig {
  /**
   * Include frontmatter in copied markdown
   * @default false
   */
  includeFrontmatter?: boolean;
  /**
   * Show toast notification on copy
   * @default true
   */
  showToast?: boolean;
  /**
   * Text shown on copy button
   * @default 'Copy'
   */
  copyText?: string;
  /**
   * Text shown after successful copy
   * @default 'Copied!'
   */
  copiedText?: string;
  /**
   * Show "View as Markdown" button that links to raw GitHub file
   * @default false
   */
  showViewMarkdown?: boolean;
  /**
   * Base URL for raw GitHub files (e.g., 'https://raw.githubusercontent.com/datum-cloud/datum.net/refs/heads/main')
   * @default ''
   */
  githubRawBaseUrl?: string;
  /**
   * Content path relative to repo root (e.g., 'src/content/docs')
   * Used to construct the full GitHub raw URL
   * @default 'src/content/docs'
   */
  contentPath?: string;
}

declare global {
  var __COPY_MARKDOWN_CONFIG__: CopyMarkdownConfig | undefined;
}
