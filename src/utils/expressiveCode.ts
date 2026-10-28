// src/utils/expressiveCode.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { createInlineSvgUrl } from '@expressive-code/core';
import { transformMarkdownFigures } from '@utils/markdownFigure';

const lucideCopyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

const expressiveCodeConfig = {
  themes: ['github-light', 'github-dark'],
  styleOverrides: {
    borderRadius: '0.5rem',
    frames: {
      copyIcon: createInlineSvgUrl(lucideCopyIconSvg),
    },
  },
};

export const renderMarkdownWithExpressiveCode = async (markdown: string): Promise<string> => {
  const withFigures = transformMarkdownFigures(markdown);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // @ts-expect-error rehypeExpressiveCode types are not fully inferred by unified
    .use(rehypeExpressiveCode, expressiveCodeConfig)
    .use(rehypeStringify)
    .process(withFigures);

  return String(file);
};
