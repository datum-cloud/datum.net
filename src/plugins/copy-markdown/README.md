# Starlight Copy Markdown Plugin

Adds a "Copy as Markdown" button to Starlight docs pages so users can copy the raw markdown of the current page.

## Usage

In `astro.config.mjs`, add the plugin to your Starlight config:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import copyMarkdown from './src/plugins/copy-markdown/index.ts';

export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        copyMarkdown({
          includeFrontmatter: false,
          showToast: true,
          copyText: 'Copy',
          copiedText: 'Copied!',
        }),
      ],
      title: 'Docs',
      // ... other Starlight options
    }),
  ],
});
```

## Configuration

| Option               | Type      | Default     | Description                                 |
| -------------------- | --------- | ----------- | ------------------------------------------- |
| `includeFrontmatter` | `boolean` | `false`     | Include frontmatter in the copied markdown. |
| `showToast`          | `boolean` | `true`      | Show a toast notification on copy.          |
| `copyText`           | `string`  | `'Copy'`    | Label shown on the copy button.             |
| `copiedText`         | `string`  | `'Copied!'` | Label shown after a successful copy.        |

Example:

```js
copyMarkdown({
  includeFrontmatter: true,
  showToast: true,
  copyText: 'Copy Markdown',
  copiedText: 'Done!',
});
```

## Files

- `index.ts` — Plugin entry and Starlight integration
- `CopyButton.astro` — Button component
- `types.d.ts` — `CopyMarkdownConfig` type
- `utils/markdown.ts` — Markdown extraction helpers
- `styles.css` — Button and toast styles
