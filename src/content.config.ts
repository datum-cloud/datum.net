import { z, reference, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metaSchema = (image?: any) =>
  z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      og: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          image: image().optional(),
          url: z.string().optional(),
          article: z.boolean().default(false).optional(),
          published: z.date().optional(),
          author: z.string().optional(),
        })
        .optional(),
    })
    .optional();

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
      meta: metaSchema(image),
    }),
});

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
      meta: metaSchema(image),
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
            url: z.string().optional(),
          })
        )
        .optional(),
      investors: z
        .array(
          z.object({
            img: image().optional(),
            alt: z.string().optional(),
            url: z.string().optional(),
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
      meta: metaSchema(image),
    }),
});

// Define legal collections
const legal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/legal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      iconName: z.string().optional(),
      meta: metaSchema(image),
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
      tick: z.string().optional(),
      surprising: z.string().optional(),
      weekends: z.string().optional(),
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
      meta: metaSchema(image),
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
      lastModified: z.string().optional(),
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
      meta: metaSchema(image),
      contents: z
        .array(
          z.object({
            slug: z.string(),
            label: z.string(),
          })
        )
        .optional(),
    }),
});

// Define changelog collections
const changelog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/changelog' }),
  schema: ({ image }) =>
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
      meta: metaSchema(image),
    }),
});

// Define features collections
const features = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/features' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      order: z.number().optional(),
      keyFeatures: z.array(z.string()).optional(),
      benefits: z.string().optional(),
      perfectFor: z.array(z.string()).optional(),
      readTheDocs: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url().optional(),
          })
        )
        .optional(),
      iconName: z.string().optional(),
      draft: z.boolean().optional().default(false),
      meta: metaSchema(image),
      sections: z
        .object({
          first: z.array(reference('features')).optional(),
          second: z.array(reference('features')).optional(),
          third: z.array(reference('features')).optional(),
        })
        .optional(),
    }),
});

// Define pricing collections
const pricing = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pricing' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      order: z.number().optional().default(0),
      price: z
        .object({
          badge: z.string().optional(),
          prefix: z.string().optional(),
          amount: z.string().optional(),
          suffix: z.string().optional(),
          note: z.string().optional(),
        })
        .optional(),
      cta: z
        .object({
          label: z.string(),
          href: z.string().optional(),
          class: z.string().optional(),
          isExternal: z.boolean().optional(),
        })
        .optional(),
      featureGroups: z
        .array(
          z.object({
            title: z.string().optional(),
            items: z.array(z.string()),
          })
        )
        .optional(),
      meta: metaSchema(image),
    }),
});

// Define FAQ collections
const faq = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/faq' }),
  schema: () =>
    z.object({
      question: z.string(),
      order: z.number().optional().default(0),
      category: z.string().optional(),
      draft: z.boolean().optional().default(false),
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
  pricing,
  faq,
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: ({ image }) =>
        z.object({
          // override lastUpdated from original schema
          updatedDate: z.string().optional(),
          meta: metaSchema(image),
        }),
    }),
  }),
};
