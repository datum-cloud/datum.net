// src/utils/expressiveCodeOptions.ts
import { createInlineSvgUrl } from '@expressive-code/core';

const lucideCopyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

/** Shared by `markdown.rehypePlugins` (MDX inherits) and `renderMarkdownWithExpressiveCode` (blog). */
export const expressiveCodeRehypeOptions = {
  themes: ['github-light', 'github-dark'],
  // Avoid terminal/editor frame chrome (title bar, tabs). `auto` treats e.g. `bash` as a terminal
  // and adds a header; blog-style blocks are plain code panels without that bar.
  defaultProps: {
    frame: 'none',
  },
  styleOverrides: {
    borderRadius: '0.5rem',
    frames: {
      copyIcon: createInlineSvgUrl(lucideCopyIconSvg),
    },
  },
};
