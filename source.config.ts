import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const guides = defineDocs({
  dir: ['content/guides'],
});

export const docs = defineDocs({
  dir: ['content/docs'],
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
