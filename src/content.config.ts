import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

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

// Define authos collections
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

// Define categories collections
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

// Define handbook collections
const handbooksCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/handbook' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      slug: z.string().optional(),
      draft: z.boolean().optional(),
      readingTime: z.string().optional(),
      updatedDate: z.string().optional(),
      authors: z.string().optional(),
      sidebar: z.object({
        label: z.string().optional(),
        order: z.number().optional(),
        badge: z
          .object({
            text: z.string(),
            variant: z.enum(['info', 'caution', 'danger']).optional(),
          })
          .optional(),
      }),
      hero: z
        .object({
          tagline: z.string(),
          image: z.object({
            file: z.string(),
            alt: z.string().optional(),
          }),
        })
        .optional(),
      featuredImage: image().optional(),
    }),
});

// Define docs collections
// const docsCollection = defineCollection({
//   loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/docs/docs' }),
//   schema: ({ image }) =>
//     z.object({
//       title: z.string(),
//       description: z.string().optional(),
//       date: z.date().optional(),
//       slug: z.string().optional(),
//       thumbnail: image().optional(),
//       draft: z.boolean().optional().default(false),
//       weight: z.number().optional().default(999),
//     }),
// });

// Define changelog collections
const changelogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/changelog' }),
  schema: () =>
    z.object({
      title: z.string(),
      date: z.date().optional(),
      description: z.string().optional(),
      version: z.string(),
    }),
});

// Export all collections
export const collections = {
  pages: pagesCollection,
  blog: blogCollection,
  authors: authorsCollection,
  categories: categoriesCollection,
  handbooks: handbooksCollection,
  // olddocs: docsCollection,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  changelog: changelogCollection,
};
