// src/plugins/copy-markdown/config.ts
import type { CopyMarkdownConfig } from './types.d.ts';

const DEFAULTS: Required<CopyMarkdownConfig> = {
  includeFrontmatter: false,
  showToast: true,
  copyText: 'Copy',
  copiedText: 'Copied!',
  showViewMarkdown: false,
  githubRawBaseUrl: '',
  contentPath: 'src/content/docs',
};

/**
 * Returns the copy-markdown config (set by the plugin). Use this in components instead of reading globalThis.
 */
export function getCopyMarkdownConfig(): Required<CopyMarkdownConfig> {
  const config = globalThis.__COPY_MARKDOWN_CONFIG__ ?? {};
  return {
    includeFrontmatter: config.includeFrontmatter ?? DEFAULTS.includeFrontmatter,
    showToast: config.showToast ?? DEFAULTS.showToast,
    copyText: config.copyText ?? DEFAULTS.copyText,
    copiedText: config.copiedText ?? DEFAULTS.copiedText,
    showViewMarkdown: config.showViewMarkdown ?? DEFAULTS.showViewMarkdown,
    githubRawBaseUrl: config.githubRawBaseUrl ?? DEFAULTS.githubRawBaseUrl,
    contentPath: config.contentPath ?? DEFAULTS.contentPath,
  };
}
