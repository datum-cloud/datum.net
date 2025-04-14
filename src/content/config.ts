import { z, defineCollection } from 'astro:content';

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

// Define blog collections
const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
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
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    bio: z.string(),
    title: z.string().optional(),
    avatar: image().optional(),
    social: z.object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
    }).optional(),
  }),
});

const categoriesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    description: z.string().optional(),
    slug: z.string().optional(),
    featuredImage: image().optional(),
  }),
});

// Export all collections
export const collections = {
  'pages': pagesCollection,
  'blog': blogCollection,
  'authors': authorsCollection,
  'categories': categoriesCollection,
};