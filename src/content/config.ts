import { z, defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Define the schema for changelog entries
const changelogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    version: z.string().optional(),
    summary: z.string(),
  }),
});

// Define pages collections
const pagesCollection = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    featuredImage: image().optional(),
    isHomePage: z.boolean().optional().default(false),
    slug: z.string().optional(),
    order: z.number().optional().default(999)
  }),
});

// Add to src/content/config.ts
const blogCollection = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    author: z.string().optional(),
    thumbnail: image().optional(),
    featuredImage: image().optional(),
    draft: z.boolean().optional().default(false)
  }),
});

// Export all collections
export const collections = {
  'pages': pagesCollection,
  'changelog': changelogCollection,
  'blog': blogCollection,
  'docs': defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};