import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Define pages collections
const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featuredImage: image().optional(),
      isHomePage: z.boolean().optional().default(false),
      slug: z.string().optional(),
      order: z.number().optional().default(999),
    }),
});

// Define blog collections
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.date(),
      author: z.string().optional(),
      categories: z.array(z.string()).optional().default([]),
      slug: z.string().optional(),
      thumbnail: image().optional(),
      featuredImage: image().optional(),
      draft: z.boolean().optional().default(false),
    }),
});

const authorsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      bio: z.string(),
      title: z.string().optional(),
      avatar: image().optional(),
      isTeam: z.boolean().optional().default(false),
      team: z.enum(['founders', 'team']).optional(),
      position: z.string().optional(),
      order: z.number().optional().default(999),
      social: z
        .object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          linkedin: z.string().optional(),
        })
        .optional(),
    }),
});

const categoriesCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/categories' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string().optional(),
      slug: z.string().optional(),
      featuredImage: image().optional(),
    }),
});

// Export all collections
export const collections = {
  pages: pagesCollection,
  blog: blogCollection,
  authors: authorsCollection,
  categories: categoriesCollection,
};
