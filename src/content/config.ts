import { z, defineCollection } from 'astro:content';

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

// Export all collections
export const collections = {
  'pages': pagesCollection,
  'changelog': changelogCollection,
};