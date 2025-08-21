import { z, reference, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const metaSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),

    robots: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    og: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        url: z.string().optional(),
        type: z.string().optional(),
      })
      .optional(),
  })
  .optional();

// Define pages collections
const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featuredImage: image().optional(),
      slug: z.string().optional(),
      order: z.number().optional().default(0),
      contents: z.array(reference('pages')).optional(),
      items: z.array(z.string()).optional(),
      images: z
        .array(
          z.object({
            img: image().optional(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      meta: metaSchema,
    }),
});

const about = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/about' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      contents: z.array(reference('about')).optional(),
      companies: z
        .array(
          z.object({
            img: image().optional(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      investors: z
        .array(
          z.object({
            img: image().optional(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      items: z.array(z.string()).optional(),
      link: z
        .object({
          url: z.string().url(),
          label: z.string(),
        })
        .optional(),
      meta: metaSchema,
    }),
});

// Define blog collections
const blog = defineCollection({
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
const authors = defineCollection({
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
const categories = defineCollection({
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
const handbooks = defineCollection({
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

// Define changelog collections
const changelog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/changelog' }),
  schema: () =>
    z.object({
      title: z.string(),
      date: z.date().optional(),
      description: z.string().optional(),
      version: z.string(),
    }),
});

export const collections = {
  pages,
  about,
  blog,
  authors,
  categories,
  handbooks,
  changelog,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
