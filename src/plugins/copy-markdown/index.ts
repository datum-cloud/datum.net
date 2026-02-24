// src/plugins/copy-markdown/index.ts
import type { StarlightPlugin } from '@astrojs/starlight/types';

export type { CopyMarkdownConfig } from './types.d';

/**
 * Starlight plugin that adds a "Copy as Markdown" button to documentation pages.
 * Config is set once here and read by plugin components via getCopyMarkdownConfig().
 */
export default function copyMarkdown(
  config: import('./types.d').CopyMarkdownConfig = {}
): StarlightPlugin {
  const resolved = {
    includeFrontmatter: config.includeFrontmatter ?? false,
    showToast: config.showToast ?? true,
    copyText: config.copyText ?? 'Copy',
    copiedText: config.copiedText ?? 'Copied!',
    showViewMarkdown: config.showViewMarkdown ?? false,
    githubRawBaseUrl: config.githubRawBaseUrl ?? '',
    contentPath: config.contentPath ?? 'src/content/docs',
  };

  return {
    name: 'starlight-copy-markdown',
    hooks: {
      setup({ config: _starlightConfig, updateConfig }) {
        // Set config in Node so components see it at build/SSR
        globalThis.__COPY_MARKDOWN_CONFIG__ = resolved;
        // Also inject for client-side (e.g. any future scripts)
        updateConfig({
          head: [
            {
              tag: 'script',
              attrs: { type: 'text/javascript' },
              content: `globalThis.__COPY_MARKDOWN_CONFIG__ = ${JSON.stringify(resolved)};`,
            },
          ],
        });
      },
    },
  };
}
