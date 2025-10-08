import { z, reference, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const metaSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    og: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        url: z.string().optional(),
        article: z.boolean().default(false).optional(),
        published: z.date().optional(),
        author: z.string().optional(),
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
      subtitle: z.string().optional(),
      description: z.string().optional(),
      iconName: z.string().optional(),
      featuredImage: image().optional(),
      slug: z.string().optional(),
      order: z.number().optional().default(0),
      contents: z.array(reference('pages')).optional(),
      items: z.array(z.string()).optional(),
      updatedDate: z.string().optional(),
      images: z
        .array(
          z.object({
            img: image().optional(),
            alt: z.string().optional(),
          })
        )
        .optional(),
      pageInfo: z
        .array(
          z.object({
            icon: z.string(),
            text: z.string(),
          })
        )
        .optional(),
      meta: metaSchema,
    }),
});

// Define about collections
const about = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/about' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      iconName: z.string().optional(),
      featuredImage: image().optional(),
      order: z.number().optional().default(0),
      contents: z.array(reference('about')).optional(),
      companies: z
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

// Define legal collections
const legal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/legal' }),
  schema: () =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      iconName: z.string().optional(),
      meta: metaSchema,
    }),
});

// Define blog collections
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      date: z.date(),
      author: z.string().optional(),
      categories: z.array(z.string()).optional().default([]),
      thumbnail: image().optional(),
      featuredImage: image().optional(),
      draft: z.boolean().optional().default(false),
      updatedDate: z.string().optional(),
      meta: metaSchema,
    }),
});

// Define authors collections
const authors = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      name: z.string(),
      bio: z.string(),
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
      subtitle: z.string().optional(),
      description: z.string().optional(),
      slug: z.string().optional(),
      featuredImage: image().optional(),
      meta: metaSchema,
    }),
});

// Define handbook collections
const handbooks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/handbook' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
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
      meta: metaSchema,
      contents: z.array(z.string()).optional(),
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
      version: z.string().optional(),
      tags: z
        .array(
          z.object({
            label: z.string(),
            type: z.enum(['fixed', 'new', 'changed']),
            value: z.string(),
          })
        )
        .optional()
        .default([]),
      meta: metaSchema,
    }),
});

// Define features collections
const features = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/features' }),
  schema: () =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      order: z.number().optional(),
      keyFeatures: z.array(z.string()).optional(),
      benefits: z.string().optional(),
      perfectFor: z.array(z.string()).optional(),
      draft: z.boolean().optional().default(false),
      meta: metaSchema,
      sections: z
        .object({
          first: z.array(reference('features')).optional(),
          second: z.array(reference('features')).optional(),
          third: z.array(reference('features')).optional(),
        })
        .optional(),
    }),
});

// Define huddles collections
const huddles = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/huddles' }),
  schema: () =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      date: z.date(),
      time: z.string().optional(),
      zoomLink: z.string().url().optional(),
      zoomPass: z.string().optional(),
      slidesUrl: z.string().url().optional(),
      draft: z.boolean().optional().default(false),
      meta: metaSchema,
    }),
});

// Define use cases collections
const useCases = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/use-cases' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      date: z.date().optional(),
      author: z.string().optional(),
      thumbnail: image().optional(),
      featuredImage: image().optional(),
      draft: z.boolean().optional().default(false),
      meta: metaSchema,
    }),
});

export const collections = {
  pages,
  about,
  legal,
  blog,
  authors,
  categories,
  handbooks,
  changelog,
  features,
  huddles,
  useCases,
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // override lastUpdated from original schema
        updatedDate: z.string().optional(),
      }),
    }),
  }),
};
