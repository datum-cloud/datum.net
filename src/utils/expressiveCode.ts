// src/utils/expressiveCode.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { transformMarkdownFigures } from '@utils/markdownFigure';

const expressiveCodeConfig = {
  themes: ['github-light', 'github-dark'],
  styleOverrides: {
    borderRadius: '0.5rem',
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
